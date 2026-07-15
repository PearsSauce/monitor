package server

import (
	"compress/gzip"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"vps-agent/internal/agent"
)

func TestNormalizeConfigDefaultsAndOrigins(t *testing.T) {
	cfg, err := normalizeConfig(Config{
		AuthSecret:  "strong-auth-secret",
		AdminPass:   "strong-admin-password",
		PublicURL:   "https://monitor.example.com/base/?ignored=true#fragment",
		CORSOrigins: []string{" https://panel.example.com/app ", "https://panel.example.com"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if cfg.AdminUser != "admin" {
		t.Fatalf("admin user = %q", cfg.AdminUser)
	}
	if cfg.PublicURL != "https://monitor.example.com/base" {
		t.Fatalf("public url = %q", cfg.PublicURL)
	}
	if cfg.OfflineWait != 10*time.Second {
		t.Fatalf("offline wait = %s", cfg.OfflineWait)
	}
	if cfg.MaxNodes != 2000 {
		t.Fatalf("max nodes = %d", cfg.MaxNodes)
	}
	if len(cfg.CORSOrigins) != 1 || cfg.CORSOrigins[0] != "https://panel.example.com" {
		t.Fatalf("cors origins = %#v", cfg.CORSOrigins)
	}
}

func TestNormalizeConfigRejectsInvalidOrigin(t *testing.T) {
	_, err := normalizeConfig(Config{
		AuthSecret:  "strong-auth-secret",
		AdminPass:   "strong-admin-password",
		CORSOrigins: []string{"javascript:alert(1)"},
	})
	if err == nil {
		t.Fatal("expected invalid CORS origin error")
	}
}

func TestWithCORSAllowsSameHostAndConfiguredOrigin(t *testing.T) {
	handler := withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}), []string{"https://panel.example.com"})

	sameHostReq := httptest.NewRequest(http.MethodOptions, "https://monitor.example.com/api/nodes", nil)
	sameHostReq.Header.Set("Origin", "https://monitor.example.com")
	sameHostReq.Host = "monitor.example.com"
	sameHostResp := httptest.NewRecorder()
	handler.ServeHTTP(sameHostResp, sameHostReq)
	if sameHostResp.Code != http.StatusNoContent {
		t.Fatalf("same-host status = %d", sameHostResp.Code)
	}
	if got := sameHostResp.Header().Get("Access-Control-Allow-Origin"); got != "https://monitor.example.com" {
		t.Fatalf("same-host allow origin = %q", got)
	}

	allowedReq := httptest.NewRequest(http.MethodOptions, "https://monitor.example.com/api/nodes", nil)
	allowedReq.Header.Set("Origin", "https://panel.example.com")
	allowedReq.Host = "monitor.example.com"
	allowedResp := httptest.NewRecorder()
	handler.ServeHTTP(allowedResp, allowedReq)
	if allowedResp.Code != http.StatusNoContent {
		t.Fatalf("allowed status = %d", allowedResp.Code)
	}
	if got := allowedResp.Header().Get("Access-Control-Allow-Origin"); got != "https://panel.example.com" {
		t.Fatalf("allowed origin = %q", got)
	}

	blockedReq := httptest.NewRequest(http.MethodOptions, "https://monitor.example.com/api/nodes", nil)
	blockedReq.Header.Set("Origin", "https://evil.example.com")
	blockedReq.Host = "monitor.example.com"
	blockedResp := httptest.NewRecorder()
	handler.ServeHTTP(blockedResp, blockedReq)
	if blockedResp.Code != http.StatusForbidden {
		t.Fatalf("blocked status = %d", blockedResp.Code)
	}
}

func TestAdminMeRequiresGetAndReportsSession(t *testing.T) {
	s := newTestServer(t)

	postReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/me", nil)
	postResp := httptest.NewRecorder()
	s.handleAdminMe(postResp, postReq)
	if postResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("post admin me status = %d body = %s", postResp.Code, postResp.Body.String())
	}

	guestReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/admin/me", nil)
	guestResp := httptest.NewRecorder()
	s.handleAdminMe(guestResp, guestReq)
	if guestResp.Code != http.StatusOK {
		t.Fatalf("guest admin me status = %d body = %s", guestResp.Code, guestResp.Body.String())
	}
	var guest map[string]bool
	decodeJSONResponse(t, guestResp, &guest)
	if guest["authenticated"] {
		t.Fatalf("guest admin me response = %#v", guest)
	}

	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}
	authedReq := authedAdminRequest(http.MethodGet, "https://monitor.example.com/api/admin/me", token)
	authedResp := httptest.NewRecorder()
	s.handleAdminMe(authedResp, authedReq)
	if authedResp.Code != http.StatusOK {
		t.Fatalf("authed admin me status = %d body = %s", authedResp.Code, authedResp.Body.String())
	}
	var authed map[string]bool
	decodeJSONResponse(t, authedResp, &authed)
	if !authed["authenticated"] {
		t.Fatalf("authed admin me response = %#v", authed)
	}
}

func TestAdminLoginRequiresPostOriginAndCredentials(t *testing.T) {
	s := newTestServer(t)
	s.cfg.AdminUser = "admin"
	s.cfg.AdminPass = "strong-admin-password"
	s.cfg.CORSOrigins = []string{"https://panel.example.com"}

	getReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/admin/login", nil)
	getResp := httptest.NewRecorder()
	s.handleAdminLogin(getResp, getReq)
	if getResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("get login status = %d body = %s", getResp.Code, getResp.Body.String())
	}

	badOriginReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/login", strings.NewReader("{"))
	badOriginReq.Host = "monitor.example.com"
	badOriginReq.Header.Set("Origin", "https://evil.example.com")
	badOriginResp := httptest.NewRecorder()
	s.handleAdminLogin(badOriginResp, badOriginReq)
	if badOriginResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin login status = %d body = %s", badOriginResp.Code, badOriginResp.Body.String())
	}
	if cookies := badOriginResp.Result().Cookies(); len(cookies) != 0 {
		t.Fatalf("bad-origin login set cookies: %#v", cookies)
	}

	badCredsReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/login", strings.NewReader(`{"username":"admin","password":"wrong-password"}`))
	badCredsReq.Host = "monitor.example.com"
	badCredsReq.Header.Set("Origin", "https://monitor.example.com")
	badCredsResp := httptest.NewRecorder()
	s.handleAdminLogin(badCredsResp, badCredsReq)
	if badCredsResp.Code != http.StatusUnauthorized {
		t.Fatalf("bad-credentials login status = %d body = %s", badCredsResp.Code, badCredsResp.Body.String())
	}
	if cookies := badCredsResp.Result().Cookies(); len(cookies) != 0 {
		t.Fatalf("bad-credentials login set cookies: %#v", cookies)
	}

	okReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/login", strings.NewReader(`{"username":"admin","password":"strong-admin-password"}`))
	okReq.Host = "monitor.example.com"
	okReq.Header.Set("Origin", "https://monitor.example.com")
	okReq.Header.Set("X-Forwarded-Proto", "https")
	okResp := httptest.NewRecorder()
	s.handleAdminLogin(okResp, okReq)
	if okResp.Code != http.StatusOK {
		t.Fatalf("valid login status = %d body = %s", okResp.Code, okResp.Body.String())
	}
	var payload map[string]bool
	decodeJSONResponse(t, okResp, &payload)
	if !payload["ok"] {
		t.Fatalf("valid login response = %#v", payload)
	}
	cookies := okResp.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("valid login cookies = %#v", cookies)
	}
	cookie := cookies[0]
	if cookie.Name != "monitor_admin" || cookie.Value == "" || cookie.Path != "/" {
		t.Fatalf("admin cookie identity = %#v", cookie)
	}
	if !cookie.HttpOnly || !cookie.Secure || cookie.SameSite != http.SameSiteLaxMode {
		t.Fatalf("admin cookie security attributes = %#v", cookie)
	}
	if cookie.MaxAge != int((24 * time.Hour).Seconds()) {
		t.Fatalf("admin cookie max age = %d", cookie.MaxAge)
	}
	if !s.sessions.Valid(cookie.Value) {
		t.Fatal("valid login cookie should reference an active admin session")
	}
}

func TestAdminPageRequiresGetAndNoCache(t *testing.T) {
	s := newTestServer(t)

	postReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/admin", nil)
	postResp := httptest.NewRecorder()
	s.handleAdminPage(postResp, postReq)
	if postResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("post admin page status = %d body = %s", postResp.Code, postResp.Body.String())
	}

	getReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/admin", nil)
	getResp := httptest.NewRecorder()
	s.handleAdminPage(getResp, getReq)
	if getResp.Code != http.StatusOK {
		t.Fatalf("get admin page status = %d body = %s", getResp.Code, getResp.Body.String())
	}
	if got := getResp.Header().Get("Content-Type"); got != "text/html; charset=utf-8" {
		t.Fatalf("admin page content type = %q", got)
	}
	if got := getResp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("admin page cache control = %q", got)
	}
	if !strings.Contains(getResp.Body.String(), `monitor-admin-marker`) {
		t.Fatalf("admin page body missing marker: %s", getResp.Body.String())
	}
}

func TestAgentPingRequiresGetAndValidNodeToken(t *testing.T) {
	s := newTestServer(t)
	const nodeID = "CN-ping-001"
	const token = "agent-token"
	if err := s.store.SetNodeToken(nodeID, hashToken(token), s.cfg.MaxNodes); err != nil {
		t.Fatal(err)
	}

	postReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/agent/ping", nil)
	postResp := httptest.NewRecorder()
	s.handleAgentPing(postResp, postReq)
	if postResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("post agent ping status = %d body = %s", postResp.Code, postResp.Body.String())
	}

	guestReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/agent/ping", nil)
	guestResp := httptest.NewRecorder()
	s.handleAgentPing(guestResp, guestReq)
	if guestResp.Code != http.StatusUnauthorized {
		t.Fatalf("guest agent ping status = %d body = %s", guestResp.Code, guestResp.Body.String())
	}

	authedReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/agent/ping", nil)
	authedReq.Header.Set("X-Node-ID", " "+nodeID+" ")
	authedReq.Header.Set("Authorization", "Bearer "+token)
	authedResp := httptest.NewRecorder()
	s.handleAgentPing(authedResp, authedReq)
	if authedResp.Code != http.StatusOK {
		t.Fatalf("authed agent ping status = %d body = %s", authedResp.Code, authedResp.Body.String())
	}
	var payload map[string]string
	decodeJSONResponse(t, authedResp, &payload)
	if payload["ok"] != "true" {
		t.Fatalf("authed agent ping response = %#v", payload)
	}
}

func TestValidNodeID(t *testing.T) {
	tests := []struct {
		name  string
		value string
		want  bool
	}{
		{name: "simple", value: "CN-node-001", want: true},
		{name: "trim spaces", value: "  CN-node-001  ", want: true},
		{name: "unicode", value: "\u9999\u6e2f\u8282\u70b9-01", want: true},
		{name: "max length", value: strings.Repeat("a", 96), want: true},
		{name: "empty", value: "", want: false},
		{name: "spaces only", value: "   ", want: false},
		{name: "too long", value: strings.Repeat("a", 97), want: false},
		{name: "path separator", value: "CN/node", want: false},
		{name: "newline", value: "CN\nnode", want: false},
		{name: "shell metachar", value: "CN;node", want: false},
		{name: "glob", value: "CN*node", want: false},
		{name: "quote", value: "CN'node", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validNodeID(tt.value); got != tt.want {
				t.Fatalf("validNodeID(%q) = %v, want %v", tt.value, got, tt.want)
			}
		})
	}
}

func TestAdminLogoutRequiresPostAndValidOrigin(t *testing.T) {
	s := newTestServer(t)
	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}

	getReq := authedAdminRequest(http.MethodGet, "https://monitor.example.com/api/admin/logout", token)
	getResp := httptest.NewRecorder()
	s.handleAdminLogout(getResp, getReq)
	if getResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("get logout status = %d", getResp.Code)
	}
	if !s.sessions.Valid(token) {
		t.Fatal("GET logout should not delete the admin session")
	}

	badOriginReq := authedAdminRequest(http.MethodPost, "https://monitor.example.com/api/admin/logout", token)
	badOriginReq.Header.Set("Origin", "https://evil.example.com")
	badOriginResp := httptest.NewRecorder()
	s.handleAdminLogout(badOriginResp, badOriginReq)
	if badOriginResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin logout status = %d", badOriginResp.Code)
	}
	if !s.sessions.Valid(token) {
		t.Fatal("bad-origin logout should not delete the admin session")
	}

	okReq := authedAdminRequest(http.MethodPost, "https://monitor.example.com/api/admin/logout", token)
	okReq.Header.Set("Origin", "https://monitor.example.com")
	okResp := httptest.NewRecorder()
	s.handleAdminLogout(okResp, okReq)
	if okResp.Code != http.StatusOK {
		t.Fatalf("post logout status = %d body = %s", okResp.Code, okResp.Body.String())
	}
	if s.sessions.Valid(token) {
		t.Fatal("POST logout should delete the admin session")
	}
}

func TestAdminInstallCommandRequiresPostAndValidOrigin(t *testing.T) {
	s := newTestServer(t)
	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}
	const nodeID = "CN-test-001"

	getReq := authedAdminRequest(http.MethodGet, "https://monitor.example.com/api/admin/install-command?node_id="+nodeID, token)
	getResp := httptest.NewRecorder()
	s.handleAdminInstallCommand(getResp, getReq)
	if getResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("get install-command status = %d", getResp.Code)
	}
	if got := s.store.ExportNodes().Nodes; len(got) != 0 {
		t.Fatalf("GET install-command wrote nodes: %#v", got)
	}

	badOriginReq := authedAdminRequest(http.MethodPost, "https://monitor.example.com/api/admin/install-command?node_id="+nodeID, token)
	badOriginReq.Header.Set("Origin", "https://evil.example.com")
	badOriginResp := httptest.NewRecorder()
	s.handleAdminInstallCommand(badOriginResp, badOriginReq)
	if badOriginResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin install-command status = %d", badOriginResp.Code)
	}
	if got := s.store.ExportNodes().Nodes; len(got) != 0 {
		t.Fatalf("bad-origin install-command wrote nodes: %#v", got)
	}

	okReq := authedAdminRequest(http.MethodPost, "https://monitor.example.com/api/admin/install-command?node_id="+nodeID, token)
	okReq.Header.Set("Origin", "https://monitor.example.com")
	okResp := httptest.NewRecorder()
	s.handleAdminInstallCommand(okResp, okReq)
	if okResp.Code != http.StatusOK {
		t.Fatalf("post install-command status = %d body = %s", okResp.Code, okResp.Body.String())
	}
	if !strings.Contains(okResp.Body.String(), "install/agent-linux.sh") {
		t.Fatalf("install command response missing linux command: %s", okResp.Body.String())
	}
	backup := s.store.ExportNodes()
	if len(backup.Nodes) != 1 {
		t.Fatalf("backup nodes len = %d", len(backup.Nodes))
	}
	if backup.Nodes[0].NodeID != nodeID || backup.Nodes[0].TokenHash == "" {
		t.Fatalf("backup node = %#v", backup.Nodes[0])
	}
}

func TestInfoPostChecksAdminBeforeBody(t *testing.T) {
	s := newTestServer(t)
	const nodeID = "CN-info-001"

	unauthorizedReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/info", "", "{")
	unauthorizedResp := httptest.NewRecorder()
	s.handleInfo(unauthorizedResp, unauthorizedReq)
	if unauthorizedResp.Code != http.StatusUnauthorized {
		t.Fatalf("unauthorized info status = %d body = %s", unauthorizedResp.Code, unauthorizedResp.Body.String())
	}
	if got := s.store.InfoList(); len(got) != 0 {
		t.Fatalf("unauthorized info request wrote infos: %#v", got)
	}

	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}
	badOriginReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/info", token, "{")
	badOriginReq.Header.Set("Origin", "https://evil.example.com")
	badOriginResp := httptest.NewRecorder()
	s.handleInfo(badOriginResp, badOriginReq)
	if badOriginResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin info status = %d body = %s", badOriginResp.Code, badOriginResp.Body.String())
	}
	if got := s.store.InfoList(); len(got) != 0 {
		t.Fatalf("bad-origin info request wrote infos: %#v", got)
	}

	okReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/info", token, `{"name":"`+nodeID+`","seller":"seller","traffic_reset_day":12}`)
	okReq.Header.Set("Origin", "https://monitor.example.com")
	okResp := httptest.NewRecorder()
	s.handleInfo(okResp, okReq)
	if okResp.Code != http.StatusOK {
		t.Fatalf("valid info status = %d body = %s", okResp.Code, okResp.Body.String())
	}
	infos := s.store.InfoList()
	if len(infos) != 1 {
		t.Fatalf("infos len = %d", len(infos))
	}
	if infos[0].Name != nodeID || infos[0].Seller != "seller" || infos[0].TrafficResetDay != 12 {
		t.Fatalf("saved info = %#v", infos[0])
	}
}

func TestDeletePostChecksAdminBeforeBody(t *testing.T) {
	s := newTestServer(t)
	const nodeID = "CN-delete-001"
	if err := s.store.UpsertInfo(HostInfo{Name: nodeID, Seller: "seller"}); err != nil {
		t.Fatal(err)
	}

	unauthorizedReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/delete", "", "{")
	unauthorizedResp := httptest.NewRecorder()
	s.handleDelete(unauthorizedResp, unauthorizedReq)
	if unauthorizedResp.Code != http.StatusUnauthorized {
		t.Fatalf("unauthorized delete status = %d body = %s", unauthorizedResp.Code, unauthorizedResp.Body.String())
	}
	if got := s.store.InfoList(); len(got) != 1 || got[0].Name != nodeID {
		t.Fatalf("unauthorized delete changed infos: %#v", got)
	}

	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}
	badOriginReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/delete", token, "{")
	badOriginReq.Header.Set("Origin", "https://evil.example.com")
	badOriginResp := httptest.NewRecorder()
	s.handleDelete(badOriginResp, badOriginReq)
	if badOriginResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin delete status = %d body = %s", badOriginResp.Code, badOriginResp.Body.String())
	}
	if got := s.store.InfoList(); len(got) != 1 || got[0].Name != nodeID {
		t.Fatalf("bad-origin delete changed infos: %#v", got)
	}

	okReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/delete", token, `{"name":"`+nodeID+`"}`)
	okReq.Header.Set("Origin", "https://monitor.example.com")
	okResp := httptest.NewRecorder()
	s.handleDelete(okResp, okReq)
	if okResp.Code != http.StatusOK {
		t.Fatalf("valid delete status = %d body = %s", okResp.Code, okResp.Body.String())
	}
	if got := s.store.InfoList(); len(got) != 0 {
		t.Fatalf("valid delete kept infos: %#v", got)
	}
}

func TestAdminSettingsRequiresAuthOriginAndPersists(t *testing.T) {
	s := newTestServer(t)

	unauthorizedReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/admin/settings", nil)
	unauthorizedResp := httptest.NewRecorder()
	s.handleAdminSettings(unauthorizedResp, unauthorizedReq)
	if unauthorizedResp.Code != http.StatusUnauthorized {
		t.Fatalf("unauthorized settings status = %d body = %s", unauthorizedResp.Code, unauthorizedResp.Body.String())
	}

	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}
	badOriginReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/api/admin/settings", token, "{")
	badOriginReq.Header.Set("Origin", "https://evil.example.com")
	badOriginResp := httptest.NewRecorder()
	s.handleAdminSettings(badOriginResp, badOriginReq)
	if badOriginResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin settings status = %d body = %s", badOriginResp.Code, badOriginResp.Body.String())
	}
	if got := s.store.GetSettings().SiteName; got != "Monitor Party" {
		t.Fatalf("bad-origin settings changed site name to %q", got)
	}

	okReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/api/admin/settings", token, `{"site_name":"  Ops Console  "}`)
	okReq.Header.Set("Origin", "https://monitor.example.com")
	okResp := httptest.NewRecorder()
	s.handleAdminSettings(okResp, okReq)
	if okResp.Code != http.StatusOK {
		t.Fatalf("valid settings status = %d body = %s", okResp.Code, okResp.Body.String())
	}
	if got := s.store.GetSettings().SiteName; got != "Ops Console" {
		t.Fatalf("saved site name = %q", got)
	}

	getReq := authedAdminRequest(http.MethodGet, "https://monitor.example.com/api/admin/settings", token)
	getResp := httptest.NewRecorder()
	s.handleAdminSettings(getResp, getReq)
	if getResp.Code != http.StatusOK {
		t.Fatalf("get settings status = %d body = %s", getResp.Code, getResp.Body.String())
	}
	var settings Settings
	decodeJSONResponse(t, getResp, &settings)
	if settings.SiteName != "Ops Console" {
		t.Fatalf("settings response = %#v", settings)
	}
}

func TestAdminNodeBackupEndpointsRequireAuthOrigin(t *testing.T) {
	s := newTestServer(t)
	const nodeID = "CN-admin-001"
	const importedNodeID = "US-admin-002"

	unauthorizedReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/admin/nodes", nil)
	unauthorizedResp := httptest.NewRecorder()
	s.handleAdminNodes(unauthorizedResp, unauthorizedReq)
	if unauthorizedResp.Code != http.StatusUnauthorized {
		t.Fatalf("unauthorized nodes status = %d body = %s", unauthorizedResp.Code, unauthorizedResp.Body.String())
	}

	token, err := s.sessions.Create()
	if err != nil {
		t.Fatal(err)
	}
	badOriginAddReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/api/admin/nodes", token, "{")
	badOriginAddReq.Header.Set("Origin", "https://evil.example.com")
	badOriginAddResp := httptest.NewRecorder()
	s.handleAdminNodes(badOriginAddResp, badOriginAddReq)
	if badOriginAddResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin node add status = %d body = %s", badOriginAddResp.Code, badOriginAddResp.Body.String())
	}
	if got := s.store.ExportNodes().Nodes; len(got) != 0 {
		t.Fatalf("bad-origin node add wrote nodes: %#v", got)
	}

	okAddReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/api/admin/nodes", token, `{"node_id":"`+nodeID+`"}`)
	okAddReq.Header.Set("Origin", "https://monitor.example.com")
	okAddResp := httptest.NewRecorder()
	s.handleAdminNodes(okAddResp, okAddReq)
	if okAddResp.Code != http.StatusOK {
		t.Fatalf("valid node add status = %d body = %s", okAddResp.Code, okAddResp.Body.String())
	}

	exportReq := authedAdminRequest(http.MethodGet, "https://monitor.example.com/api/admin/nodes/export", token)
	exportResp := httptest.NewRecorder()
	s.handleAdminNodesExport(exportResp, exportReq)
	if exportResp.Code != http.StatusOK {
		t.Fatalf("export status = %d body = %s", exportResp.Code, exportResp.Body.String())
	}
	if got := exportResp.Header().Get("Content-Disposition"); got != "attachment; filename=monitor-nodes.json" {
		t.Fatalf("content disposition = %q", got)
	}
	var backup NodeBackup
	decodeJSONResponse(t, exportResp, &backup)
	if len(backup.Nodes) != 1 || backup.Nodes[0].NodeID != nodeID {
		t.Fatalf("export backup = %#v", backup)
	}

	badOriginImportReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/api/admin/nodes/import", token, "{")
	badOriginImportReq.Header.Set("Origin", "https://evil.example.com")
	badOriginImportResp := httptest.NewRecorder()
	s.handleAdminNodesImport(badOriginImportResp, badOriginImportReq)
	if badOriginImportResp.Code != http.StatusForbidden {
		t.Fatalf("bad-origin node import status = %d body = %s", badOriginImportResp.Code, badOriginImportResp.Body.String())
	}
	if got := s.store.ExportNodes().Nodes; len(got) != 1 {
		t.Fatalf("bad-origin node import changed nodes: %#v", got)
	}

	okImportReq := adminRequestWithBody(http.MethodPost, "https://monitor.example.com/api/admin/nodes/import", token, `{"version":1,"nodes":[{"node_id":"`+importedNodeID+`","info":{"seller":"seller","traffic_reset_day":9}}]}`)
	okImportReq.Header.Set("Origin", "https://monitor.example.com")
	okImportResp := httptest.NewRecorder()
	s.handleAdminNodesImport(okImportResp, okImportReq)
	if okImportResp.Code != http.StatusOK {
		t.Fatalf("valid node import status = %d body = %s", okImportResp.Code, okImportResp.Body.String())
	}
	var importResult map[string]int
	decodeJSONResponse(t, okImportResp, &importResult)
	if importResult["imported"] != 1 {
		t.Fatalf("import result = %#v", importResult)
	}
	nodes := s.store.ExportNodes().Nodes
	if len(nodes) != 2 {
		t.Fatalf("nodes after import = %#v", nodes)
	}
	if nodes[1].NodeID != importedNodeID || nodes[1].Info.Seller != "seller" || nodes[1].Info.TrafficResetDay != 9 {
		t.Fatalf("imported node = %#v", nodes[1])
	}
}

func TestPublicReadEndpointsRequireGet(t *testing.T) {
	s := newTestServer(t)
	s.cfg.PublicURL = "https://public.example.com/panel"
	s.cfg.OfflineWait = 45 * time.Second
	if err := s.store.UpdateSettings(Settings{SiteName: "Public Monitor"}); err != nil {
		t.Fatal(err)
	}
	const nodeID = "CN-public-001"
	if err := s.store.UpsertReport(sampleMetrics(nodeID, 100, 200), 10); err != nil {
		t.Fatal(err)
	}

	configPostReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/config.json", nil)
	configPostResp := httptest.NewRecorder()
	s.handleConfig(configPostResp, configPostReq)
	if configPostResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("config POST status = %d body = %s", configPostResp.Code, configPostResp.Body.String())
	}

	configGetReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/config.json", nil)
	configGetResp := httptest.NewRecorder()
	s.handleConfig(configGetResp, configGetReq)
	if configGetResp.Code != http.StatusOK {
		t.Fatalf("config GET status = %d body = %s", configGetResp.Code, configGetResp.Body.String())
	}
	var config map[string]string
	decodeJSONResponse(t, configGetResp, &config)
	if config["apiURL"] != "https://public.example.com/panel" || config["socket"] != "wss://public.example.com/panel/ws" {
		t.Fatalf("config base urls = %#v", config)
	}
	if config["siteName"] != "Public Monitor" || config["offlineWait"] != "45" {
		t.Fatalf("config metadata = %#v", config)
	}

	nodesPostReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/nodes", nil)
	nodesPostResp := httptest.NewRecorder()
	s.handleNodes(nodesPostResp, nodesPostReq)
	if nodesPostResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("nodes POST status = %d body = %s", nodesPostResp.Code, nodesPostResp.Body.String())
	}

	nodesGetReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/nodes", nil)
	nodesGetResp := httptest.NewRecorder()
	s.handleNodes(nodesGetResp, nodesGetReq)
	if nodesGetResp.Code != http.StatusOK {
		t.Fatalf("nodes GET status = %d body = %s", nodesGetResp.Code, nodesGetResp.Body.String())
	}
	var nodes []AkileHost
	decodeJSONResponse(t, nodesGetResp, &nodes)
	if len(nodes) != 1 || nodes[0].Host.Name != nodeID {
		t.Fatalf("nodes response = %#v", nodes)
	}
}

func TestWebSocketEndpointRequiresGetAndUpgrade(t *testing.T) {
	s := newTestServer(t)

	postReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/ws", nil)
	postResp := httptest.NewRecorder()
	s.handleWS(postResp, postReq)
	if postResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("post websocket status = %d body = %s", postResp.Code, postResp.Body.String())
	}

	getReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/ws", nil)
	getResp := httptest.NewRecorder()
	s.handleWS(getResp, getReq)
	if getResp.Code != http.StatusBadRequest {
		t.Fatalf("plain get websocket status = %d body = %s", getResp.Code, getResp.Body.String())
	}
	if !strings.Contains(getResp.Body.String(), "not websocket") {
		t.Fatalf("plain get websocket body = %s", getResp.Body.String())
	}

	missingConnectionReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/ws", nil)
	missingConnectionReq.Header.Set("Upgrade", "websocket")
	missingConnectionReq.Header.Set("Sec-WebSocket-Version", "13")
	missingConnectionReq.Header.Set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
	missingConnectionResp := httptest.NewRecorder()
	s.handleWS(missingConnectionResp, missingConnectionReq)
	if missingConnectionResp.Code != http.StatusBadRequest {
		t.Fatalf("missing connection websocket status = %d body = %s", missingConnectionResp.Code, missingConnectionResp.Body.String())
	}
	if !strings.Contains(missingConnectionResp.Body.String(), "missing websocket connection upgrade") {
		t.Fatalf("missing connection websocket body = %s", missingConnectionResp.Body.String())
	}

	badVersionReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/ws", nil)
	badVersionReq.Header.Set("Upgrade", "websocket")
	badVersionReq.Header.Set("Connection", "keep-alive, Upgrade")
	badVersionReq.Header.Set("Sec-WebSocket-Version", "12")
	badVersionReq.Header.Set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
	badVersionResp := httptest.NewRecorder()
	s.handleWS(badVersionResp, badVersionReq)
	if badVersionResp.Code != http.StatusBadRequest {
		t.Fatalf("bad version websocket status = %d body = %s", badVersionResp.Code, badVersionResp.Body.String())
	}
	if !strings.Contains(badVersionResp.Body.String(), "unsupported websocket version") {
		t.Fatalf("bad version websocket body = %s", badVersionResp.Body.String())
	}

	invalidKeyReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/ws", nil)
	invalidKeyReq.Header.Set("Upgrade", "websocket")
	invalidKeyReq.Header.Set("Connection", "Upgrade")
	invalidKeyReq.Header.Set("Sec-WebSocket-Version", "13")
	invalidKeyReq.Header.Set("Sec-WebSocket-Key", "not-a-valid-key")
	invalidKeyResp := httptest.NewRecorder()
	s.handleWS(invalidKeyResp, invalidKeyReq)
	if invalidKeyResp.Code != http.StatusBadRequest {
		t.Fatalf("invalid key websocket status = %d body = %s", invalidKeyResp.Code, invalidKeyResp.Body.String())
	}
	if !strings.Contains(invalidKeyResp.Body.String(), "invalid websocket key") {
		t.Fatalf("invalid key websocket body = %s", invalidKeyResp.Body.String())
	}
}

func TestValidWebSocketKey(t *testing.T) {
	tests := []struct {
		name string
		key  string
		want bool
	}{
		{name: "rfc example", key: "dGhlIHNhbXBsZSBub25jZQ==", want: true},
		{name: "empty", key: "", want: false},
		{name: "not base64", key: "not-a-valid-key", want: false},
		{name: "too short", key: "c2hvcnQ=", want: false},
		{name: "too long", key: "dGhlIHNhbXBsZSBub25jZTEyMzQ=", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validWebSocketKey(tt.key); got != tt.want {
				t.Fatalf("validWebSocketKey(%q) = %v, want %v", tt.key, got, tt.want)
			}
		})
	}
}

func TestWebSocketAcceptMatchesRFCExample(t *testing.T) {
	const key = "dGhlIHNhbXBsZSBub25jZQ=="
	const want = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
	if got := websocketAccept(key); got != want {
		t.Fatalf("websocketAccept(%q) = %q, want %q", key, got, want)
	}
}

func TestStaticFallbackUsesIndexHeadersAndCompression(t *testing.T) {
	s := newTestServer(t)

	postReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/dashboard/app.js", nil)
	postResp := httptest.NewRecorder()
	s.handleStatic(postResp, postReq)
	if postResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("static fallback POST status = %d body = %s", postResp.Code, postResp.Body.String())
	}

	req := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/dashboard/app.js", nil)
	req.Header.Set("Accept-Encoding", "br, gzip")
	resp := httptest.NewRecorder()
	s.handleStatic(resp, req)
	if resp.Code != http.StatusOK {
		t.Fatalf("static fallback status = %d body = %s", resp.Code, resp.Body.String())
	}
	if got := resp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("static fallback cache control = %q", got)
	}
	if got := resp.Header().Get("Content-Type"); !strings.Contains(got, "text/html") {
		t.Fatalf("static fallback content type = %q", got)
	}
	if got := resp.Header().Get("Content-Encoding"); got != "gzip" {
		t.Fatalf("static fallback content encoding = %q", got)
	}
	if got := resp.Header().Get("Vary"); got != "Accept-Encoding" {
		t.Fatalf("static fallback vary = %q", got)
	}
	gz, err := gzip.NewReader(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	defer gz.Close()
	data, err := io.ReadAll(gz)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), `<div id="app"></div>`) {
		t.Fatalf("static fallback body is not index html: %s", string(data))
	}
}

func TestAcceptsGzipHonorsEncodingTokensAndQValues(t *testing.T) {
	tests := []struct {
		name   string
		header string
		want   bool
	}{
		{name: "empty", header: "", want: false},
		{name: "plain gzip", header: "gzip", want: true},
		{name: "case insensitive gzip", header: "br, GZip", want: true},
		{name: "gzip with positive q", header: "br;q=1, gzip;q=0.5", want: true},
		{name: "gzip disabled", header: "br, gzip;q=0", want: false},
		{name: "gzip token only", header: "xgzip", want: false},
		{name: "gzip suffix only", header: "br, gzip-extra", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/", nil)
			req.Header.Set("Accept-Encoding", tt.header)
			if got := acceptsGzip(req); got != tt.want {
				t.Fatalf("acceptsGzip(%q) = %v, want %v", tt.header, got, tt.want)
			}
		})
	}
}

func TestPublicResourceEndpointsRequireGetAndSafeDownloadName(t *testing.T) {
	s := newTestServer(t)

	installerPostReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/install/agent-linux.sh", nil)
	installerPostResp := httptest.NewRecorder()
	s.handleAgentLinuxInstaller(installerPostResp, installerPostReq)
	if installerPostResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("installer POST status = %d body = %s", installerPostResp.Code, installerPostResp.Body.String())
	}

	installerGetReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/install/agent-linux.sh", nil)
	installerGetReq.Host = "monitor.example.com"
	installerGetResp := httptest.NewRecorder()
	s.handleAgentLinuxInstaller(installerGetResp, installerGetReq)
	if installerGetResp.Code != http.StatusOK {
		t.Fatalf("installer GET status = %d body = %s", installerGetResp.Code, installerGetResp.Body.String())
	}
	if !strings.Contains(installerGetResp.Body.String(), "monitor.example.com") {
		t.Fatalf("installer body missing external base: %s", installerGetResp.Body.String())
	}
	if got := installerGetResp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("installer cache control = %q", got)
	}

	downloadPostReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/download/vps-agent-linux-amd64", nil)
	downloadPostResp := httptest.NewRecorder()
	s.handleDownload(downloadPostResp, downloadPostReq)
	if downloadPostResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("download POST status = %d body = %s", downloadPostResp.Code, downloadPostResp.Body.String())
	}

	invalidDownloadReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/download/bad%22name", nil)
	invalidDownloadResp := httptest.NewRecorder()
	s.handleDownload(invalidDownloadResp, invalidDownloadReq)
	if invalidDownloadResp.Code != http.StatusNotFound {
		t.Fatalf("invalid download status = %d body = %s", invalidDownloadResp.Code, invalidDownloadResp.Body.String())
	}

	downloadGetReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/download/vps-agent-linux-amd64", nil)
	downloadGetResp := httptest.NewRecorder()
	s.handleDownload(downloadGetResp, downloadGetReq)
	if downloadGetResp.Code != http.StatusOK {
		t.Fatalf("download GET status = %d body = %s", downloadGetResp.Code, downloadGetResp.Body.String())
	}
	if got := downloadGetResp.Header().Get("Content-Disposition"); got != `attachment; filename="vps-agent-linux-amd64"` {
		t.Fatalf("download content disposition = %q", got)
	}
	if downloadGetResp.Body.Len() == 0 {
		t.Fatal("download body is empty")
	}
}

func TestAgentAuthorizationRequiresBearerToken(t *testing.T) {
	s := newTestServer(t)
	const nodeID = "CN-agent-001"
	const token = "agent-token"
	if err := s.store.SetNodeToken(nodeID, hashToken(token), 10); err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name       string
		nodeID     string
		auth       string
		authorized bool
	}{
		{name: "valid bearer", nodeID: nodeID, auth: "Bearer " + token, authorized: true},
		{name: "case-insensitive scheme", nodeID: nodeID, auth: "bearer " + token, authorized: true},
		{name: "raw token rejected", nodeID: nodeID, auth: token},
		{name: "wrong scheme rejected", nodeID: nodeID, auth: "Basic " + token},
		{name: "empty bearer rejected", nodeID: nodeID, auth: "Bearer "},
		{name: "wrong token rejected", nodeID: nodeID, auth: "Bearer wrong-token"},
		{name: "missing node id rejected", auth: "Bearer " + token},
		{name: "invalid node id rejected", nodeID: "bad/node", auth: "Bearer " + token},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/api/agent/ping", nil)
			if tt.nodeID != "" {
				req.Header.Set("X-Node-ID", tt.nodeID)
			}
			req.Header.Set("Authorization", tt.auth)
			if got := s.agentAuthorized(req); got != tt.authorized {
				t.Fatalf("authorized = %v, want %v", got, tt.authorized)
			}
		})
	}
}

func TestAgentReportNormalizesAuthorizedNodeID(t *testing.T) {
	s := newTestServer(t)
	const nodeID = "CN-agent-report-001"
	const token = "agent-token"
	if err := s.store.SetNodeToken(nodeID, hashToken(token), 10); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/agent/report", strings.NewReader(`{}`))
	req.Header.Set("X-Node-ID", "  "+nodeID+"  ")
	req.Header.Set("Authorization", "Bearer "+token)
	resp := httptest.NewRecorder()
	s.handleAgentReport(resp, req)
	if resp.Code != http.StatusOK {
		t.Fatalf("agent report status = %d body = %s", resp.Code, resp.Body.String())
	}

	backup := s.store.ExportNodes()
	if len(backup.Nodes) != 1 {
		t.Fatalf("backup nodes len = %d", len(backup.Nodes))
	}
	if backup.Nodes[0].NodeID != nodeID {
		t.Fatalf("reported node id = %q", backup.Nodes[0].NodeID)
	}
	if got := s.store.AdminNodes(time.Minute); len(got) != 1 || got[0].NodeID != nodeID || !got[0].Online {
		t.Fatalf("admin nodes after report = %#v", got)
	}
}

func TestStoreBackendsNodeLifecycle(t *testing.T) {
	tests := []struct {
		name    string
		factory func(t *testing.T) dataStore
	}{
		{
			name: "json",
			factory: func(t *testing.T) dataStore {
				t.Helper()
				store, err := NewStore(filepath.Join(t.TempDir(), "server.json"))
				if err != nil {
					t.Fatal(err)
				}
				return store
			},
		},
		{
			name: "sqlite",
			factory: func(t *testing.T) dataStore {
				t.Helper()
				store, err := NewSQLiteStore(filepath.Join(t.TempDir(), "server.db"), "")
				if err != nil {
					t.Fatal(err)
				}
				return store
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := tt.factory(t)
			const nodeID = "CN-test-001"
			const tokenHash = "token-hash"

			if err := store.UpdateSettings(Settings{SiteName: "Ops Monitor"}); err != nil {
				t.Fatal(err)
			}
			if got := store.SiteName(); got != "Ops Monitor" {
				t.Fatalf("site name = %q", got)
			}
			if err := store.AddPlannedNode(nodeID, 10); err != nil {
				t.Fatal(err)
			}
			if err := store.SetNodeToken(nodeID, tokenHash, 10); err != nil {
				t.Fatal(err)
			}
			if !store.ValidNodeToken(nodeID, tokenHash) {
				t.Fatal("expected token to be valid")
			}
			if store.ValidNodeToken(nodeID, "wrong") {
				t.Fatal("unexpected valid wrong token")
			}
			if err := store.SetNodeToken("CN-over-limit", "hash", 1); err == nil {
				t.Fatal("expected max nodes error from SetNodeToken")
			}
			if err := store.UpsertInfo(HostInfo{Name: nodeID, Seller: "seller", Price: "$5", AuthSecret: "drop-me", TrafficResetDay: 31, Show: true}); err != nil {
				t.Fatal(err)
			}

			if err := store.UpsertReport(sampleMetrics(nodeID, 1000, 2000), 10); err != nil {
				t.Fatal(err)
			}
			if err := store.UpsertReport(sampleMetrics(nodeID, 1500, 2600), 10); err != nil {
				t.Fatal(err)
			}

			nodes := store.AdminNodes(time.Minute)
			if len(nodes) != 1 {
				t.Fatalf("nodes len = %d", len(nodes))
			}
			if !nodes[0].Online {
				t.Fatal("expected node online")
			}
			if nodes[0].Info.AuthSecret != "" {
				t.Fatal("auth secret leaked into stored host info")
			}
			if nodes[0].Info.TrafficResetDay != 31 {
				t.Fatalf("traffic reset day = %d", nodes[0].Info.TrafficResetDay)
			}

			hosts := store.AkileHosts()
			if len(hosts) != 1 {
				t.Fatalf("hosts len = %d", len(hosts))
			}
			if hosts[0].State.CycleNetInTransfer != 1500 || hosts[0].State.CycleNetOutTransfer != 2600 {
				t.Fatalf("cycle traffic = %d/%d", hosts[0].State.CycleNetInTransfer, hosts[0].State.CycleNetOutTransfer)
			}

			backup := store.ExportNodes()
			if len(backup.Nodes) != 1 {
				t.Fatalf("backup nodes len = %d", len(backup.Nodes))
			}
			if backup.Nodes[0].TokenHash != tokenHash {
				t.Fatalf("backup token hash = %q", backup.Nodes[0].TokenHash)
			}

			if err := store.Delete(nodeID); err != nil {
				t.Fatal(err)
			}
			if got := store.AdminNodes(time.Minute); len(got) != 0 {
				t.Fatalf("nodes after delete = %d", len(got))
			}
		})
	}
}

func TestSQLiteStoreImportsExistingJSON(t *testing.T) {
	dir := t.TempDir()
	jsonPath := filepath.Join(dir, "server.json")
	jsonStore, err := NewStore(jsonPath)
	if err != nil {
		t.Fatal(err)
	}
	const nodeID = "JP-test-001"
	const tokenHash = "imported-token-hash"
	if err := jsonStore.UpdateSettings(Settings{SiteName: "Migrated Monitor"}); err != nil {
		t.Fatal(err)
	}
	if err := jsonStore.AddPlannedNode(nodeID, 10); err != nil {
		t.Fatal(err)
	}
	if err := jsonStore.SetNodeToken(nodeID, tokenHash, 10); err != nil {
		t.Fatal(err)
	}
	if err := jsonStore.UpsertInfo(HostInfo{Name: nodeID, Seller: "seller", TrafficResetDay: 15}); err != nil {
		t.Fatal(err)
	}
	if err := jsonStore.UpsertReport(sampleMetrics(nodeID, 2000, 3000), 10); err != nil {
		t.Fatal(err)
	}

	sqliteStore, err := NewSQLiteStore(filepath.Join(dir, "server.db"), jsonPath)
	if err != nil {
		t.Fatal(err)
	}
	if got := sqliteStore.SiteName(); got != "Migrated Monitor" {
		t.Fatalf("site name = %q", got)
	}
	if !sqliteStore.ValidNodeToken(nodeID, tokenHash) {
		t.Fatal("expected imported token to be valid")
	}
	nodes := sqliteStore.AdminNodes(time.Minute)
	if len(nodes) != 1 || nodes[0].NodeID != nodeID || !nodes[0].Online {
		t.Fatalf("imported nodes = %#v", nodes)
	}
	if nodes[0].Info.TrafficResetDay != 15 {
		t.Fatalf("traffic reset day = %d", nodes[0].Info.TrafficResetDay)
	}
}

func newTestServer(t *testing.T) *Server {
	t.Helper()
	store, err := NewStore(filepath.Join(t.TempDir(), "server.json"))
	if err != nil {
		t.Fatal(err)
	}
	return &Server{
		cfg:      Config{MaxNodes: 10, OfflineWait: time.Minute},
		store:    store,
		sessions: NewSessionStore(),
		cache:    NewResponseCache(),
	}
}

func authedAdminRequest(method, target, token string) *http.Request {
	req := httptest.NewRequest(method, target, nil)
	req.Host = "monitor.example.com"
	req.AddCookie(&http.Cookie{Name: "monitor_admin", Value: token})
	return req
}

func adminRequestWithBody(method, target, token, body string) *http.Request {
	req := httptest.NewRequest(method, target, strings.NewReader(body))
	req.Host = "monitor.example.com"
	if token != "" {
		req.AddCookie(&http.Cookie{Name: "monitor_admin", Value: token})
	}
	return req
}

func decodeJSONResponse(t *testing.T, resp *httptest.ResponseRecorder, value any) {
	t.Helper()
	if err := json.NewDecoder(resp.Body).Decode(value); err != nil {
		t.Fatalf("decode response body %q: %v", resp.Body.String(), err)
	}
}

func sampleMetrics(nodeID string, rxBytes, txBytes uint64) agent.Metrics {
	return agent.Metrics{
		NodeID:    nodeID,
		Timestamp: time.Now().Unix(),
		OS:        "linux",
		Arch:      "amd64",
		Hostname:  "test-host",
		Kernel:    "test-kernel",
		OSName:    "Linux (Test)",
		CPU:       agent.CPU{UsagePercent: 12.5, Cores: 2, PhysicalCores: 1, ModelName: "Test CPU"},
		Memory:    agent.Memory{Total: 1024, Used: 512, Free: 512},
		Swap:      agent.Memory{},
		Load:      agent.Load{Load1: 0.1, Load5: 0.2, Load15: 0.3},
		Uptime:    123,
		Disks: []agent.Disk{
			{Mount: "/", FSType: "ext4", Total: 2048, Used: 1024, Free: 1024, UsedPercent: 50},
		},
		Network:   agent.Network{RxBytes: rxBytes, TxBytes: txBytes, RxRate: 10, TxRate: 20},
		DiskIO:    agent.DiskIO{ReadRate: 1, WriteRate: 2},
		Conns:     &agent.Connections{TCP: 3, UDP: 4},
		Processes: 5,
	}
}
