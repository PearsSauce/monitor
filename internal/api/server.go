package api

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"monitor/internal/config"
	"monitor/internal/monitor"
)

// Server represents the HTTP API server
type Server struct {
	svc          *monitor.Service
	cfg          config.Config
	mux          *http.ServeMux
	logger       *slog.Logger
	updates      chan monitor.Update
	clients      map[int]chan monitor.Update
	clientsMu    sync.Mutex
	nextClientID int
	rateLimiter  *RateLimiter
}

// NewServer creates a new API server instance
func NewServer(svc *monitor.Service, cfg config.Config) *Server {
	// Create structured logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	srv := &Server{
		svc:         svc,
		cfg:         cfg,
		mux:         http.NewServeMux(),
		logger:      logger,
		updates:     make(chan monitor.Update, 64),
		clients:     make(map[int]chan monitor.Update),
		rateLimiter: NewRateLimiter(10, 100), // 10 req/s, burst 100
	}

	svc.SetEventSink(srv.updates)

	// Start SSE broadcaster
	go srv.broadcastUpdates()

	srv.routes()
	return srv
}

// broadcastUpdates sends updates to all connected SSE clients
func (s *Server) broadcastUpdates() {
	for u := range s.updates {
		s.clientsMu.Lock()
		for _, ch := range s.clients {
			select {
			case ch <- u:
			default:
				// Channel full, skip this update for this client
			}
		}
		s.clientsMu.Unlock()
	}
}

// Snowflake ID generator
var (
	sfEpoch = time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).UnixMilli()
	sfMu    sync.Mutex
	sfLast  int64
	sfSeq   int64
	sfNode  int64 = func() int64 {
		var b [1]byte
		_, _ = rand.Read(b[:])
		return int64(b[0] % 32) // 5 bits node
	}()
)

func nextID() int64 {
	now := time.Now().UnixMilli()
	sfMu.Lock()
	if now == sfLast {
		sfSeq = (sfSeq + 1) & 0x7F // 7 bits sequence
	} else {
		sfSeq = 0
		sfLast = now
	}
	id := ((now - sfEpoch) << 12) | (sfNode << 7) | sfSeq
	sfMu.Unlock()
	return id
}

// Start starts the HTTP server with middleware chain
func (s *Server) Start() error {
	s.logger.Info("后端启动", "addr", s.cfg.Addr)

	// Build middleware chain
	handler := chainMiddleware(
		s.mux,
		RecoveryMiddleware(s.logger),
		LoggingMiddleware(s.logger),
		RateLimitMiddleware(s.rateLimiter),
		CORSMiddleware([]string{"*"}),
	)

	return http.ListenAndServe(s.cfg.Addr, handler)
}

// routes registers all API routes
func (s *Server) routes() {
	// Auth routes
	s.mux.HandleFunc("/api/login", s.handleLogin)
	s.mux.HandleFunc("/api/admin/verify", s.handleAdminVerify)

	// Monitor routes
	s.mux.HandleFunc("/api/monitors", s.handleMonitors)
	s.mux.HandleFunc("/api/monitors/", s.handleMonitorByID)

	// Group routes
	s.mux.HandleFunc("/api/groups", s.handleGroups)
	s.mux.HandleFunc("/api/groups/", s.handleGroupByID)

	// Notification routes
	s.mux.HandleFunc("/api/notifications", s.handleNotifications)
	s.mux.HandleFunc("/api/notifications/", s.handleNotificationByID)
	s.mux.HandleFunc("/api/notifications/test", s.handleNotificationsTest)

	// Subscription routes
	s.mux.HandleFunc("/api/public/subscribe", s.handlePublicSubscribe)
	s.mux.HandleFunc("/api/subscriptions/verify", s.handleSubscriptionVerify)
	s.mux.HandleFunc("/api/subscriptions", s.handleSubscriptions)
	s.mux.HandleFunc("/api/subscriptions/", s.handleSubscriptionByID)

	// SSE and SSL routes
	s.mux.HandleFunc("/api/events", s.handleEvents)
	s.mux.HandleFunc("/api/ssl/", s.handleSSL)

	// Settings and setup routes
	s.mux.HandleFunc("/api/setup/state", s.handleSetupState)
	s.mux.HandleFunc("/api/setup", s.handleSetup)
	s.mux.HandleFunc("/api/health", s.handleHealth)
	s.mux.HandleFunc("/api/settings", s.handleSettings)
}

// writeJSON writes a JSON response
func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

// Helper functions for null handling
func ifNullStr(v sql.NullString, def string) string {
	if v.Valid && strings.TrimSpace(v.String) != "" {
		return v.String
	}
	return def
}

func ifNullInt(v sql.NullInt64, def int) int {
	if v.Valid {
		return int(v.Int64)
	}
	return def
}

func ifNullInt64(v sql.NullInt64, def int64) int64 {
	if v.Valid {
		return v.Int64
	}
	return def
}

func ifNullBool(v sql.NullBool, def bool) bool {
	if v.Valid {
		return v.Bool
	}
	return def
}

func ifNullCSV(v sql.NullString, def []string) []string {
	if v.Valid && strings.TrimSpace(v.String) != "" {
		var out []string
		for _, p := range strings.Split(v.String, ",") {
			p = strings.TrimSpace(p)
			if p != "" {
				out = append(out, p)
			}
		}
		return out
	}
	return def
}

func nullIfZero(v int) any {
	if v == 0 {
		return nil
	}
	return v
}

func defaultStr(s, def string) string {
	if s == "" {
		return def
	}
	return s
}

func defaultInt(i, def int) int {
	if i == 0 {
		return def
	}
	return i
}

// DB returns the database connection (for backward compatibility)
func (s *Server) DB() *sql.DB {
	return s.svc.DB()
}
