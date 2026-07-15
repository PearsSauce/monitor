package server

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"net/http"
	"strings"
	"time"
)

func (s *Server) agentAuthorized(r *http.Request) bool {
	nodeID := strings.TrimSpace(r.Header.Get("X-Node-ID"))
	if !validNodeID(nodeID) {
		return false
	}
	token := bearerToken(r.Header.Get("Authorization"))
	return token != "" && s.store.ValidNodeToken(nodeID, hashToken(token))
}

func bearerToken(header string) string {
	scheme, token, ok := strings.Cut(strings.TrimSpace(header), " ")
	if !ok || !strings.EqualFold(scheme, "Bearer") {
		return ""
	}
	return strings.TrimSpace(token)
}

func (s *Server) adminAuthorized(r *http.Request) bool {
	cookie, err := r.Cookie("monitor_admin")
	if err != nil || cookie.Value == "" {
		return false
	}
	return s.sessions.Valid(cookie.Value)
}

func adminCookie(r *http.Request, value string, maxAge time.Duration) *http.Cookie {
	secure := r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
	return &http.Cookie{
		Name:     "monitor_admin",
		Value:    value,
		Path:     "/",
		MaxAge:   int(maxAge.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	}
}

func constantEqual(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

func validNodeID(value string) bool {
	value = strings.TrimSpace(value)
	if value == "" || len([]rune(value)) > 96 {
		return false
	}
	return !strings.ContainsAny(value, "\x00\r\n\t/\\'\"`$;&|<>!*?[]{}()")
}

func newAgentToken() (string, error) {
	var buf [32]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf[:]), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func (s *Server) validAdminOrigin(r *http.Request) bool {
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin == "" {
		return true
	}
	allowed := map[string]bool{}
	allowAll := false
	for _, value := range s.cfg.CORSOrigins {
		if value == "*" {
			allowAll = true
			continue
		}
		allowed[value] = true
	}
	return corsOriginAllowed(r, origin, allowed, allowAll)
}
