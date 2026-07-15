package server

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
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
