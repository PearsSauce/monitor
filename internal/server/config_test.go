package server

import (
	"reflect"
	"testing"
)

func TestNormalizeConfigRejectsWeakSecrets(t *testing.T) {
	tests := []struct {
		name string
		cfg  Config
	}{
		{name: "missing auth secret", cfg: Config{AdminPass: "strong-admin-password"}},
		{name: "default auth secret", cfg: Config{AuthSecret: "change-me", AdminPass: "strong-admin-password"}},
		{name: "missing admin pass", cfg: Config{AuthSecret: "strong-auth-secret"}},
		{name: "default admin pass", cfg: Config{AuthSecret: "strong-auth-secret", AdminPass: "change-me"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := normalizeConfig(tt.cfg); err == nil {
				t.Fatal("expected weak secret error")
			}
		})
	}
}

func TestDefaultSQLitePath(t *testing.T) {
	tests := []struct {
		name     string
		dataPath string
		want     string
	}{
		{name: "empty", want: "data/server.db"},
		{name: "json extension", dataPath: "data/server.json", want: "data/server.db"},
		{name: "no extension", dataPath: "data/server", want: "data/server.db"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := defaultSQLitePath(tt.dataPath); got != tt.want {
				t.Fatalf("defaultSQLitePath(%q) = %q, want %q", tt.dataPath, got, tt.want)
			}
		})
	}
}

func TestCleanPublicURL(t *testing.T) {
	got, err := cleanPublicURL(" https://monitor.example.com/base/?ignored=true#fragment ")
	if err != nil {
		t.Fatal(err)
	}
	if got != "https://monitor.example.com/base" {
		t.Fatalf("clean public url = %q", got)
	}

	if _, err := cleanPublicURL("http://monitor.example.com"); err == nil {
		t.Fatal("expected http public url outside localhost to be rejected")
	}
	if got, err := cleanPublicURL("http://localhost:3000/"); err != nil || got != "http://localhost:3000" {
		t.Fatalf("localhost public url = %q, err = %v", got, err)
	}
}

func TestCleanOriginListDeduplicatesAndStripsPaths(t *testing.T) {
	got, err := cleanOriginList([]string{
		" https://panel.example.com/app ",
		"https://panel.example.com",
		"*",
		"*",
		"",
	})
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"https://panel.example.com", "*"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("clean origins = %#v, want %#v", got, want)
	}
}
