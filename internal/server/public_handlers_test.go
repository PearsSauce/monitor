package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestValidDownloadName(t *testing.T) {
	tests := []struct {
		name string
		want bool
	}{
		{name: "vps-agent-linux-amd64", want: true},
		{name: "agent_1.2.3.exe", want: true},
		{name: "", want: false},
		{name: "../secret", want: false},
		{name: "bad name", want: false},
		{name: strings.Repeat("a", 129), want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validDownloadName(tt.name); got != tt.want {
				t.Fatalf("validDownloadName(%q) = %v, want %v", tt.name, got, tt.want)
			}
		})
	}
}

func TestWindowsInstallerAndUninstallersRequireGetAndNoCache(t *testing.T) {
	s := newTestServer(t)

	windowsPostReq := httptest.NewRequest(http.MethodPost, "https://monitor.example.com/install/agent-windows.ps1", nil)
	windowsPostResp := httptest.NewRecorder()
	s.handleAgentWindowsInstaller(windowsPostResp, windowsPostReq)
	if windowsPostResp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("windows installer POST status = %d body = %s", windowsPostResp.Code, windowsPostResp.Body.String())
	}

	windowsGetReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/install/agent-windows.ps1", nil)
	windowsGetReq.Host = "monitor.example.com"
	windowsGetResp := httptest.NewRecorder()
	s.handleAgentWindowsInstaller(windowsGetResp, windowsGetReq)
	if windowsGetResp.Code != http.StatusOK {
		t.Fatalf("windows installer GET status = %d body = %s", windowsGetResp.Code, windowsGetResp.Body.String())
	}
	if got := windowsGetResp.Header().Get("Content-Type"); got != "text/plain; charset=utf-8" {
		t.Fatalf("windows installer content type = %q", got)
	}
	if got := windowsGetResp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("windows installer cache control = %q", got)
	}
	if !strings.Contains(windowsGetResp.Body.String(), "monitor.example.com") {
		t.Fatalf("windows installer body missing external base: %s", windowsGetResp.Body.String())
	}

	linuxUninstallReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/uninstall/agent-linux.sh", nil)
	linuxUninstallResp := httptest.NewRecorder()
	s.handleAgentLinuxUninstaller(linuxUninstallResp, linuxUninstallReq)
	if linuxUninstallResp.Code != http.StatusOK {
		t.Fatalf("linux uninstaller status = %d body = %s", linuxUninstallResp.Code, linuxUninstallResp.Body.String())
	}
	if got := linuxUninstallResp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("linux uninstaller cache control = %q", got)
	}

	windowsUninstallReq := httptest.NewRequest(http.MethodGet, "https://monitor.example.com/uninstall/agent-windows.ps1", nil)
	windowsUninstallResp := httptest.NewRecorder()
	s.handleAgentWindowsUninstaller(windowsUninstallResp, windowsUninstallReq)
	if windowsUninstallResp.Code != http.StatusOK {
		t.Fatalf("windows uninstaller status = %d body = %s", windowsUninstallResp.Code, windowsUninstallResp.Body.String())
	}
	if got := windowsUninstallResp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("windows uninstaller cache control = %q", got)
	}
}
