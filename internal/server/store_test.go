package server

import (
	"encoding/json"
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
