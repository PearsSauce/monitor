package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestBearerToken(t *testing.T) {
	tests := []struct {
		name   string
		header string
		want   string
	}{
		{name: "standard bearer", header: "Bearer token-123", want: "token-123"},
		{name: "case insensitive scheme", header: "bearer token-123", want: "token-123"},
		{name: "trims token", header: "Bearer token-123  ", want: "token-123"},
		{name: "missing token", header: "Bearer", want: ""},
		{name: "wrong scheme", header: "Basic token-123", want: ""},
		{name: "empty", header: "", want: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := bearerToken(tt.header); got != tt.want {
				t.Fatalf("bearerToken(%q) = %q, want %q", tt.header, got, tt.want)
			}
		})
	}
}

func TestAdminCookieSecurityAttributes(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "http://monitor.example.com/admin", nil)
	req.Header.Set("X-Forwarded-Proto", "https")

	cookie := adminCookie(req, "session-token", 24*time.Hour)
	if cookie.Name != "monitor_admin" {
		t.Fatalf("cookie name = %q", cookie.Name)
	}
	if cookie.Value != "session-token" {
		t.Fatalf("cookie value = %q", cookie.Value)
	}
	if cookie.Path != "/" {
		t.Fatalf("cookie path = %q", cookie.Path)
	}
	if cookie.MaxAge != int((24 * time.Hour).Seconds()) {
		t.Fatalf("cookie max age = %d", cookie.MaxAge)
	}
	if !cookie.HttpOnly {
		t.Fatal("cookie should be HttpOnly")
	}
	if !cookie.Secure {
		t.Fatal("cookie should be secure behind https proxy")
	}
	if cookie.SameSite != http.SameSiteLaxMode {
		t.Fatalf("cookie SameSite = %v", cookie.SameSite)
	}
}

func TestAdminAuthorized(t *testing.T) {
	s := &Server{sessions: NewSessionStore()}
	token, err := s.sessions.Create()
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "http://monitor.example.com/api/admin/me", nil)
	if s.adminAuthorized(req) {
		t.Fatal("request without cookie should not be authorized")
	}

	req.AddCookie(&http.Cookie{Name: "monitor_admin", Value: token})
	if !s.adminAuthorized(req) {
		t.Fatal("request with valid session cookie should be authorized")
	}

	invalidReq := httptest.NewRequest(http.MethodGet, "http://monitor.example.com/api/admin/me", nil)
	invalidReq.AddCookie(&http.Cookie{Name: "monitor_admin", Value: "missing"})
	if s.adminAuthorized(invalidReq) {
		t.Fatal("request with invalid session cookie should not be authorized")
	}
}

func TestAuthValidNodeID(t *testing.T) {
	tests := []struct {
		name string
		id   string
		want bool
	}{
		{name: "simple", id: "node-1", want: true},
		{name: "trim spaces", id: " node_1 ", want: true},
		{name: "empty", id: "", want: false},
		{name: "too long", id: strings.Repeat("n", 97), want: false},
		{name: "path separator", id: "node/1", want: false},
		{name: "shell metachar", id: "node;rm", want: false},
		{name: "newline", id: "node\n1", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validNodeID(tt.id); got != tt.want {
				t.Fatalf("validNodeID(%q) = %v, want %v", tt.id, got, tt.want)
			}
		})
	}
}

func TestAgentTokenAndHash(t *testing.T) {
	token, err := newAgentToken()
	if err != nil {
		t.Fatalf("newAgentToken: %v", err)
	}
	if len(token) != 43 {
		t.Fatalf("token length = %d, want 43", len(token))
	}

	hash := hashToken(token)
	if len(hash) != 43 {
		t.Fatalf("hash length = %d, want 43", len(hash))
	}
	if hash == token {
		t.Fatal("hash should differ from raw token")
	}
	if hashToken(token) != hash {
		t.Fatal("hashToken should be deterministic")
	}
}

func TestValidAdminOrigin(t *testing.T) {
	s := &Server{cfg: Config{CORSOrigins: []string{"https://allowed.example.com"}}}

	noOriginReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/logout", nil)
	if !s.validAdminOrigin(noOriginReq) {
		t.Fatal("request without Origin should be allowed")
	}

	allowedReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/logout", nil)
	allowedReq.Header.Set("Origin", "https://allowed.example.com")
	if !s.validAdminOrigin(allowedReq) {
		t.Fatal("configured Origin should be allowed")
	}

	disallowedReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/logout", nil)
	disallowedReq.Header.Set("Origin", "https://evil.example.com")
	if s.validAdminOrigin(disallowedReq) {
		t.Fatal("unconfigured Origin should be rejected")
	}
}
