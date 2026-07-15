package reporter

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"vps-agent/internal/agent"
	"vps-agent/internal/config"
)

func TestSendPostsMetricsWithAgentIdentity(t *testing.T) {
	var requestSeen bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestSeen = true
		if r.Method != http.MethodPost {
			t.Fatalf("method = %s", r.Method)
		}
		if r.URL.Path != "/api/agent/report" {
			t.Fatalf("path = %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer agent-token" {
			t.Fatalf("authorization = %q", got)
		}
		if got := r.Header.Get("X-Node-ID"); got != "CN-agent-001" {
			t.Fatalf("node id = %q", got)
		}
		if got := r.Header.Get("Content-Type"); got != "application/json" {
			t.Fatalf("content type = %q", got)
		}
		var metrics agent.Metrics
		if err := json.NewDecoder(r.Body).Decode(&metrics); err != nil {
			t.Fatal(err)
		}
		if metrics.NodeID != "CN-agent-001" || metrics.Network.RxBytes != 123 {
			t.Fatalf("metrics = %#v", metrics)
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	reporter := New(config.Config{Server: server.URL + "/", Token: "agent-token", NodeID: "CN-agent-001"})
	err := reporter.Send(context.Background(), agent.Metrics{
		NodeID:  "CN-agent-001",
		Network: agent.Network{RxBytes: 123},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !requestSeen {
		t.Fatal("server did not receive report")
	}
}

func TestSendIncludesServerErrorBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "missing agent identity", http.StatusUnauthorized)
	}))
	defer server.Close()

	reporter := New(config.Config{Server: server.URL, Token: "bad-token", NodeID: "CN-agent-001"})
	err := reporter.Send(context.Background(), agent.Metrics{})
	if err == nil {
		t.Fatal("expected reporter error")
	}
	message := err.Error()
	if !strings.Contains(message, "401 Unauthorized") {
		t.Fatalf("error missing status: %q", message)
	}
	if !strings.Contains(message, "missing agent identity") {
		t.Fatalf("error missing response body: %q", message)
	}
}
