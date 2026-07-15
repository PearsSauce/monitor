package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

func (s *Server) handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	if !s.validAdminOrigin(r) {
		http.Error(w, "invalid request origin", http.StatusForbidden)
		return
	}
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if !constantEqual(req.Username, s.cfg.AdminUser) || !constantEqual(req.Password, s.cfg.AdminPass) {
		time.Sleep(300 * time.Millisecond)
		http.Error(w, "invalid admin credentials", http.StatusUnauthorized)
		return
	}
	token, err := s.sessions.Create()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, adminCookie(r, token, 24*time.Hour))
	writeJSON(w, map[string]bool{"ok": true})
}

func (s *Server) handleAdminLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	if !s.validAdminOrigin(r) {
		http.Error(w, "invalid request origin", http.StatusForbidden)
		return
	}
	if cookie, err := r.Cookie("monitor_admin"); err == nil {
		s.sessions.Delete(cookie.Value)
	}
	c := adminCookie(r, "", -time.Hour)
	http.SetCookie(w, c)
	writeJSON(w, map[string]bool{"ok": true})
}

func (s *Server) handleAdminMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	writeJSON(w, map[string]bool{"authenticated": s.adminAuthorized(r)})
}

func (s *Server) handleAdminNodes(w http.ResponseWriter, r *http.Request) {
	if !s.adminAuthorized(r) {
		http.Error(w, "admin login required", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodGet && !s.validAdminOrigin(r) {
		http.Error(w, "invalid request origin", http.StatusForbidden)
		return
	}
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, s.store.AdminNodes(s.cfg.OfflineWait))
	case http.MethodPost:
		var req struct {
			NodeID string `json:"node_id"`
		}
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		req.NodeID = strings.TrimSpace(req.NodeID)
		if !validNodeID(req.NodeID) {
			http.Error(w, "invalid node_id", http.StatusBadRequest)
			return
		}
		if err := s.store.AddPlannedNode(req.NodeID, s.cfg.MaxNodes); err != nil {
			http.Error(w, err.Error(), http.StatusTooManyRequests)
			return
		}
		s.cache.MarkDirty()
		writeJSON(w, map[string]bool{"ok": true})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleAdminNodesExport(w http.ResponseWriter, r *http.Request) {
	if !s.adminAuthorized(r) {
		http.Error(w, "admin login required", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.Header().Set("Content-Disposition", "attachment; filename=monitor-nodes.json")
	writeJSON(w, s.store.ExportNodes())
}

func (s *Server) handleAdminNodesImport(w http.ResponseWriter, r *http.Request) {
	if !s.adminAuthorized(r) {
		http.Error(w, "admin login required", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	if !s.validAdminOrigin(r) {
		http.Error(w, "invalid request origin", http.StatusForbidden)
		return
	}
	defer r.Body.Close()
	var backup NodeBackup
	if err := json.NewDecoder(io.LimitReader(r.Body, 10<<20)).Decode(&backup); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	imported, err := s.store.ImportNodes(backup, s.cfg.MaxNodes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	s.cache.MarkDirty()
	writeJSON(w, map[string]int{"imported": imported})
}

func (s *Server) handleAdminInstallCommand(w http.ResponseWriter, r *http.Request) {
	if !s.adminAuthorized(r) {
		http.Error(w, "admin login required", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	if !s.validAdminOrigin(r) {
		http.Error(w, "invalid request origin", http.StatusForbidden)
		return
	}
	nodeID := strings.TrimSpace(r.URL.Query().Get("node_id"))
	platform := strings.TrimSpace(r.URL.Query().Get("platform"))
	if !validNodeID(nodeID) {
		http.Error(w, "invalid node_id", http.StatusBadRequest)
		return
	}
	token, err := newAgentToken()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := s.store.SetNodeToken(nodeID, hashToken(token), s.cfg.MaxNodes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	base := s.externalBase(r)
	linux := fmt.Sprintf("curl -fsSL %s/install/agent-linux.sh | sudo sh -s -- --server %s --token %s --node-id %s", base, base, shellQuote(token), shellQuote(nodeID))
	windows := fmt.Sprintf("powershell -ExecutionPolicy Bypass -Command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iwr %s/install/agent-windows.ps1 -UseBasicParsing | iex; Install-VpsAgent -Server '%s' -Token '%s' -NodeId '%s'\"", base, base, psQuote(token), psQuote(nodeID))
	linuxUninstall := fmt.Sprintf("curl -fsSL %s/uninstall/agent-linux.sh | sudo sh", base)
	windowsUninstall := fmt.Sprintf("powershell -ExecutionPolicy Bypass -Command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iwr %s/uninstall/agent-windows.ps1 -UseBasicParsing | iex\"", base)
	if platform == "linux" {
		writeJSON(w, map[string]string{"command": linux})
		return
	}
	if platform == "windows" {
		writeJSON(w, map[string]string{"command": windows})
		return
	}
	if platform == "linux-uninstall" {
		writeJSON(w, map[string]string{"command": linuxUninstall})
		return
	}
	if platform == "windows-uninstall" {
		writeJSON(w, map[string]string{"command": windowsUninstall})
		return
	}
	writeJSON(w, map[string]string{"linux": linux, "windows": windows, "linux_uninstall": linuxUninstall, "windows_uninstall": windowsUninstall})
}

func (s *Server) handleAdminSettings(w http.ResponseWriter, r *http.Request) {
	if !s.adminAuthorized(r) {
		http.Error(w, "admin login required", http.StatusUnauthorized)
		return
	}
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, s.store.GetSettings())
	case http.MethodPost:
		if !s.validAdminOrigin(r) {
			http.Error(w, "invalid request origin", http.StatusForbidden)
			return
		}
		var req Settings
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		req.SiteName = strings.TrimSpace(req.SiteName)
		if req.SiteName == "" || len(req.SiteName) > 64 {
			http.Error(w, "invalid site_name", http.StatusBadRequest)
			return
		}
		if err := s.store.UpdateSettings(req); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, map[string]bool{"ok": true})
	default:
		methodNotAllowed(w)
	}
}
