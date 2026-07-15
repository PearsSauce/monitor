package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"vps-agent/internal/agent"
	serverapp "vps-agent/internal/server/application"
)

type Server struct {
	cfg      Config
	store    serverapp.Store
	http     *http.Server
	sessions *SessionStore
	cache    *ResponseCache
}

func New(cfg Config) (*Server, error) {
	var err error
	cfg, err = normalizeConfig(cfg)
	if err != nil {
		return nil, err
	}
	store, err := newStoreBackend(cfg)
	if err != nil {
		return nil, err
	}
	s := &Server{cfg: cfg, store: store, sessions: NewSessionStore(), cache: NewResponseCache()}
	mux := http.NewServeMux()
	mux.HandleFunc("/api/agent/ping", s.handleAgentPing)
	mux.HandleFunc("/api/agent/report", s.handleAgentReport)
	mux.HandleFunc("/api/admin/login", s.handleAdminLogin)
	mux.HandleFunc("/api/admin/logout", s.handleAdminLogout)
	mux.HandleFunc("/api/admin/me", s.handleAdminMe)
	mux.HandleFunc("/api/admin/settings", s.handleAdminSettings)
	mux.HandleFunc("/api/admin/nodes", s.handleAdminNodes)
	mux.HandleFunc("/api/admin/nodes/export", s.handleAdminNodesExport)
	mux.HandleFunc("/api/admin/nodes/import", s.handleAdminNodesImport)
	mux.HandleFunc("/api/admin/install-command", s.handleAdminInstallCommand)
	mux.HandleFunc("/install/agent-linux.sh", s.handleAgentLinuxInstaller)
	mux.HandleFunc("/install/agent-windows.ps1", s.handleAgentWindowsInstaller)
	mux.HandleFunc("/uninstall/agent-linux.sh", s.handleAgentLinuxUninstaller)
	mux.HandleFunc("/uninstall/agent-windows.ps1", s.handleAgentWindowsUninstaller)
	mux.HandleFunc("/download/", s.handleDownload)
	mux.HandleFunc("/admin", s.handleAdminPage)
	mux.HandleFunc("/admin/", s.handleAdminPage)
	mux.HandleFunc("/config.json", s.handleConfig)
	mux.HandleFunc("/ws", s.handleWS)
	mux.HandleFunc("/info", s.handleInfo)
	mux.HandleFunc("/delete", s.handleDelete)
	mux.HandleFunc("/api/nodes", s.handleNodes)
	mux.HandleFunc("/", s.handleStatic)
	s.http = &http.Server{
		Addr:           cfg.Addr,
		Handler:        withCORS(mux, cfg.CORSOrigins),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   15 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 16 << 10,
	}
	return s, nil
}

func (s *Server) ListenAndServe() error {
	return s.http.ListenAndServe()
}

func (s *Server) handleAgentPing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	if !s.agentAuthorized(r) {
		http.Error(w, "missing agent identity", http.StatusUnauthorized)
		return
	}
	writeJSON(w, map[string]string{"ok": "true"})
}

func (s *Server) handleAgentReport(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	if !s.agentAuthorized(r) {
		http.Error(w, "missing agent identity", http.StatusUnauthorized)
		return
	}
	defer r.Body.Close()
	var metrics agent.Metrics
	if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&metrics); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	metrics.NodeID = strings.TrimSpace(r.Header.Get("X-Node-ID"))
	if !validNodeID(metrics.NodeID) {
		http.Error(w, "invalid node_id", http.StatusBadRequest)
		return
	}
	metrics.Timestamp = time.Now().Unix()
	if err := s.store.UpsertReport(metrics, s.cfg.MaxNodes); err != nil {
		http.Error(w, err.Error(), http.StatusTooManyRequests)
		return
	}
	s.cache.MarkDirty()
	writeJSON(w, map[string]string{"ok": "true"})
}

func (s *Server) handleConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	base := s.requestBase(r)
	writeJSON(w, map[string]string{
		"socket":      socketURL(base),
		"apiURL":      base,
		"siteName":    s.store.SiteName(),
		"offlineWait": fmt.Sprintf("%.0f", s.cfg.OfflineWait.Seconds()),
	})
}

func (s *Server) handleInfo(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, s.store.InfoList())
	case http.MethodPost:
		if !s.adminAuthorized(r) {
			http.Error(w, "admin login required", http.StatusUnauthorized)
			return
		}
		if !s.validAdminOrigin(r) {
			http.Error(w, "invalid request origin", http.StatusForbidden)
			return
		}
		var req HostInfo
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		req.Name = strings.TrimSpace(req.Name)
		if !validNodeID(req.Name) {
			http.Error(w, "invalid node_id", http.StatusBadRequest)
			return
		}
		if err := s.store.UpsertInfo(req); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, map[string]string{"ok": "true"})
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	if !s.adminAuthorized(r) {
		http.Error(w, "admin login required", http.StatusUnauthorized)
		return
	}
	if !s.validAdminOrigin(r) {
		http.Error(w, "invalid request origin", http.StatusForbidden)
		return
	}
	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if !validNodeID(req.Name) {
		http.Error(w, "invalid node_id", http.StatusBadRequest)
		return
	}
	if err := s.store.Delete(req.Name); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	s.cache.MarkDirty()
	writeJSON(w, map[string]string{"ok": "true"})
}

func (s *Server) handleNodes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	s.writeCachedHosts(w)
}

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	conn, rw, err := upgradeWebSocket(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer conn.Close()
	if err := writeWSBytes(rw, s.cachedHostsJSON()); err != nil {
		return
	}
	for {
		_ = conn.SetReadDeadline(time.Now().Add(90 * time.Second))
		_, err := readWS(conn)
		if err != nil {
			return
		}
		_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		if err := writeWSBytes(rw, s.cachedHostsJSON()); err != nil {
			return
		}
	}
}

func (s *Server) cachedHostsJSON() []byte {
	return s.cache.Get(func() []byte {
		data, err := json.Marshal(s.store.AkileHosts())
		if err != nil {
			return []byte("[]")
		}
		return data
	})
}

func (s *Server) writeCachedHosts(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(s.cachedHostsJSON())
}

func (s *Server) requestBase(r *http.Request) string {
	if s.cfg.PublicURL != "" {
		return strings.TrimRight(s.cfg.PublicURL, "/")
	}
	scheme := "http"
	if r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	host := r.Host
	return scheme + "://" + host
}

func (s *Server) externalBase(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	host := r.Host
	if host != "" && !strings.HasPrefix(host, "127.0.0.1") && !strings.HasPrefix(host, "localhost") {
		return scheme + "://" + host
	}
	return s.requestBase(r)
}

func shellQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "'\\''") + "'"
}

func psQuote(value string) string {
	return strings.ReplaceAll(value, "'", "''")
}
