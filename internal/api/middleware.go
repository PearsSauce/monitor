package api

import (
	"context"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// contextKey is a custom type for context keys
type contextKey string

const (
	ctxKeyRequestID contextKey = "request_id"
	ctxKeyUserID    contextKey = "user_id"
)

// loggingWriter wraps http.ResponseWriter to capture status code
type loggingWriter struct {
	http.ResponseWriter
	status int
	size   int
}

func (lw *loggingWriter) WriteHeader(code int) {
	lw.status = code
	lw.ResponseWriter.WriteHeader(code)
}

func (lw *loggingWriter) Write(b []byte) (int, error) {
	n, err := lw.ResponseWriter.Write(b)
	lw.size += n
	return n, err
}

func (lw *loggingWriter) Flush() {
	if f, ok := lw.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

// Middleware chain helper
type Middleware func(http.Handler) http.Handler

func chainMiddleware(h http.Handler, middlewares ...Middleware) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}

// LoggingMiddleware logs all HTTP requests with structured logging
func LoggingMiddleware(logger *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			lw := &loggingWriter{ResponseWriter: w, status: 200}

			// Skip logging for SSE endpoints to reduce noise
			if r.URL.Path == "/api/events" {
				next.ServeHTTP(lw, r)
				return
			}

			next.ServeHTTP(lw, r)

			logger.Info("HTTP请求",
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", lw.status),
				slog.Int("size", lw.size),
				slog.Duration("duration", time.Since(start)),
				slog.String("remote", r.RemoteAddr),
				slog.String("user_agent", r.UserAgent()),
			)
		})
	}
}

// RecoveryMiddleware recovers from panics and logs them
func RecoveryMiddleware(logger *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					logger.Error("Panic recovered",
						slog.Any("error", err),
						slog.String("stack", string(debug.Stack())),
						slog.String("path", r.URL.Path),
					)
					internalError(w, "服务器内部错误")
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// CORSMiddleware adds CORS headers
func CORSMiddleware(allowedOrigins []string) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			allowed := false
			for _, o := range allowedOrigins {
				if o == "*" || o == origin {
					allowed = true
					break
				}
			}
			if allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				w.Header().Set("Access-Control-Max-Age", "86400")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RateLimiter implements a simple token bucket rate limiter
type RateLimiter struct {
	mu       sync.Mutex
	tokens   map[string]*bucket
	rate     float64 // tokens per second
	capacity int     // max tokens
}

type bucket struct {
	tokens    float64
	lastCheck time.Time
}

func NewRateLimiter(rate float64, capacity int) *RateLimiter {
	rl := &RateLimiter{
		tokens:   make(map[string]*bucket),
		rate:     rate,
		capacity: capacity,
	}
	// Cleanup old entries periodically
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			rl.cleanup()
		}
	}()
	return rl
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	cutoff := time.Now().Add(-10 * time.Minute)
	for key, b := range rl.tokens {
		if b.lastCheck.Before(cutoff) {
			delete(rl.tokens, key)
		}
	}
}

func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, exists := rl.tokens[key]
	if !exists {
		rl.tokens[key] = &bucket{
			tokens:    float64(rl.capacity) - 1,
			lastCheck: now,
		}
		return true
	}

	// Add tokens based on time elapsed
	elapsed := now.Sub(b.lastCheck).Seconds()
	b.tokens = min(float64(rl.capacity), b.tokens+elapsed*rl.rate)
	b.lastCheck = now

	if b.tokens >= 1 {
		b.tokens--
		return true
	}
	return false
}

// RateLimitMiddleware limits requests per IP
func RateLimitMiddleware(limiter *RateLimiter) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get client IP
			ip := r.RemoteAddr
			if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
				ip = strings.Split(forwarded, ",")[0]
			}

			if !limiter.Allow(ip) {
				w.Header().Set("Retry-After", "1")
				writeError(w, http.StatusTooManyRequests, "RATE_LIMITED", "请求过于频繁，请稍后重试", nil)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// AuthMiddleware validates JWT tokens for protected routes
func (s *Server) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			unauthorized(w)
			return
		}

		tokenString := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(s.cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			unauthorized(w)
			return
		}

		// Add user info to context if needed
		ctx := context.WithValue(r.Context(), ctxKeyUserID, "admin")
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAuth is a helper to check if request is authenticated
func (s *Server) requireAuth(r *http.Request) bool {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return false
	}

	tokenString := strings.TrimPrefix(auth, "Bearer ")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(s.cfg.JWTSecret), nil
	})

	return err == nil && token.Valid
}
