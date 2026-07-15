package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAdminInstallCommandAuthAndPlatformResponse(t *testing.T) {
	s := newTestServer(t)

	unauthorizedReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/install-command?node_id=node-1&platform=linux", nil)
	unauthorizedResp := httptest.NewRecorder()
	s.handleAdminInstallCommand(unauthorizedResp, unauthorizedReq)
	if unauthorizedResp.Code != http.StatusUnauthorized {
		t.Fatalf("unauthorized install command status = %d body = %s", unauthorizedResp.Code, unauthorizedResp.Body.String())
	}

	token, err := s.sessions.Create()
	if err != nil {
		t.Fatalf("create admin session: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/api/admin/install-command?node_id=node-1&platform=linux", nil)
	req.AddCookie(&http.Cookie{Name: "monitor_admin", Value: token})
	resp := httptest.NewRecorder()
	s.handleAdminInstallCommand(resp, req)
	if resp.Code != http.StatusOK {
		t.Fatalf("install command status = %d body = %s", resp.Code, resp.Body.String())
	}

	var body struct {
		Command string `json:"command"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !strings.Contains(body.Command, "/install/agent-linux.sh") {
		t.Fatalf("linux command missing installer path: %s", body.Command)
	}
	if !strings.Contains(body.Command, "--node-id 'node-1'") {
		t.Fatalf("linux command missing node id: %s", body.Command)
	}
}
