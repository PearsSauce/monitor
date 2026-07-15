package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestLoadParsesConfigFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.env")
	content := "\ufeffSERVER = \"https://monitor.example.com/base/\"\n" +
		"TOKEN='secret-token'\n" +
		"NODE_ID=CN-test-001\n" +
		"BASIC_INTERVAL=5\n" +
		"DISK_INTERVAL=45s\n" +
		"CONNECTION_INTERVAL=2m\n" +
		"MOUNTS=/,/data\n" +
		"NETWORK_EXCLUDE=lo, docker*, veth*\n" +
		"DISK_EXCLUDE_FS=tmpfs, overlay\n"
	if err := os.WriteFile(path, []byte(content), 0600); err != nil {
		t.Fatal(err)
	}

	cfg, err := Load(path)
	if err != nil {
		t.Fatal(err)
	}

	if cfg.Server != "https://monitor.example.com/base" {
		t.Fatalf("server = %q", cfg.Server)
	}
	if cfg.Token != "secret-token" {
		t.Fatalf("token = %q", cfg.Token)
	}
	if cfg.NodeID != "CN-test-001" {
		t.Fatalf("node id = %q", cfg.NodeID)
	}
	if cfg.BasicInterval != 5*time.Second {
		t.Fatalf("basic interval = %s", cfg.BasicInterval)
	}
	if cfg.DiskInterval != 45*time.Second {
		t.Fatalf("disk interval = %s", cfg.DiskInterval)
	}
	if cfg.ConnectionInterval != 2*time.Minute {
		t.Fatalf("connection interval = %s", cfg.ConnectionInterval)
	}
	if got := strings.Join(cfg.Mounts, ","); got != "/,/data" {
		t.Fatalf("mounts = %q", got)
	}
	if got := strings.Join(cfg.NetworkExclude, ","); got != "lo,docker*,veth*" {
		t.Fatalf("network exclude = %q", got)
	}
	if got := strings.Join(cfg.DiskExcludeFS, ","); got != "tmpfs,overlay" {
		t.Fatalf("disk exclude fs = %q", got)
	}
}

func TestLoadRejectsInvalidConfig(t *testing.T) {
	tests := []struct {
		name    string
		content string
	}{
		{name: "malformed line", content: "SERVER\n"},
		{name: "unknown key", content: "UNKNOWN=value\n"},
		{name: "bad duration", content: "BASIC_INTERVAL=soon\n"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), "config.env")
			if err := os.WriteFile(path, []byte(tt.content), 0600); err != nil {
				t.Fatal(err)
			}
			if _, err := Load(path); err == nil {
				t.Fatal("expected config load error")
			}
		})
	}
}

func TestValidateAcceptsSecureAndLocalServers(t *testing.T) {
	tests := []Config{
		{Server: "https://monitor.example.com", Token: "token", NodeID: "CN-test-001", BasicInterval: time.Second},
		{Server: "http://127.0.0.1:3000", Token: "token", NodeID: "local-001", BasicInterval: time.Second},
		{Server: "http://localhost:3000", Token: "token", NodeID: "local-002", BasicInterval: time.Second},
	}

	for _, cfg := range tests {
		if err := cfg.Validate(); err != nil {
			t.Fatalf("validate %q: %v", cfg.Server, err)
		}
	}
}

func TestValidateRejectsUnsafeConfig(t *testing.T) {
	valid := Config{Server: "https://monitor.example.com", Token: "token", NodeID: "CN-test-001", BasicInterval: time.Second}
	tests := []struct {
		name string
		cfg  Config
	}{
		{name: "empty server", cfg: Config{Token: valid.Token, NodeID: valid.NodeID, BasicInterval: valid.BasicInterval}},
		{name: "non absolute server", cfg: Config{Server: "monitor.example.com", Token: valid.Token, NodeID: valid.NodeID, BasicInterval: valid.BasicInterval}},
		{name: "plain http remote", cfg: Config{Server: "http://monitor.example.com", Token: valid.Token, NodeID: valid.NodeID, BasicInterval: valid.BasicInterval}},
		{name: "empty token", cfg: Config{Server: valid.Server, NodeID: valid.NodeID, BasicInterval: valid.BasicInterval}},
		{name: "bad node id", cfg: Config{Server: valid.Server, Token: valid.Token, NodeID: "bad/id", BasicInterval: valid.BasicInterval}},
		{name: "short interval", cfg: Config{Server: valid.Server, Token: valid.Token, NodeID: valid.NodeID, BasicInterval: time.Millisecond}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := tt.cfg.Validate(); err == nil {
				t.Fatal("expected validation error")
			}
		})
	}
}
