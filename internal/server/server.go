package server

import (
	"compress/gzip"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"mime"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
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

func (s *Server) handleAdminPage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	_, _ = w.Write([]byte(adminHTML))
}

func (s *Server) handleAgentLinuxInstaller(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.Header().Set("Content-Type", "text/x-shellscript; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	base := s.externalBase(r)
	_, _ = fmt.Fprintf(w, linuxInstallTemplate, base)
}

func (s *Server) handleAgentWindowsInstaller(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	base := s.externalBase(r)
	_, _ = fmt.Fprintf(w, windowsInstallTemplate, base)
}

func (s *Server) handleAgentLinuxUninstaller(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.Header().Set("Content-Type", "text/x-shellscript; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	_, _ = w.Write([]byte(linuxUninstallTemplate))
}

func (s *Server) handleAgentWindowsUninstaller(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	_, _ = w.Write([]byte(windowsUninstallTemplate))
}

func (s *Server) handleDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	name := strings.TrimPrefix(r.URL.Path, "/download/")
	if !validDownloadName(name) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	data, err := agentBinaries.ReadFile("agent_bins/" + name)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=\""+name+"\"")
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	_, _ = w.Write(data)
}

func validDownloadName(name string) bool {
	if name == "" || len(name) > 128 {
		return false
	}
	for _, r := range name {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '.' || r == '-' || r == '_' {
			continue
		}
		return false
	}
	return true
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

func (s *Server) handleStatic(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/admin" || strings.HasPrefix(r.URL.Path, "/admin/") {
		s.handleAdminPage(w, r)
		return
	}
	if r.URL.Path == "/install/agent-linux.sh" {
		s.handleAgentLinuxInstaller(w, r)
		return
	}
	if r.URL.Path == "/install/agent-windows.ps1" {
		s.handleAgentWindowsInstaller(w, r)
		return
	}
	if r.URL.Path == "/uninstall/agent-linux.sh" {
		s.handleAgentLinuxUninstaller(w, r)
		return
	}
	if r.URL.Path == "/uninstall/agent-windows.ps1" {
		s.handleAgentWindowsUninstaller(w, r)
		return
	}
	if strings.HasPrefix(r.URL.Path, "/download/") {
		s.handleDownload(w, r)
		return
	}
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/")
	if path == "" {
		path = "index.html"
	}
	data, err := staticFiles.ReadFile("web/dist/" + path)
	if err != nil {
		data, err = staticFiles.ReadFile("web/dist/index.html")
		if err != nil {
			http.Error(w, "frontend is not built; run npm install && npm run build in web", http.StatusNotFound)
			return
		}
		path = "index.html"
	}
	setStaticCache(w, path)
	if ext := filepath.Ext(path); ext != "" {
		if ct := mime.TypeByExtension(ext); ct != "" {
			w.Header().Set("Content-Type", ct)
		}
	}
	if acceptsGzip(r) && shouldGzip(path) {
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Add("Vary", "Accept-Encoding")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		_, _ = gz.Write(data)
		return
	}
	w.Write(data)
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

func (s *Server) agentAuthorized(r *http.Request) bool {
	nodeID := strings.TrimSpace(r.Header.Get("X-Node-ID"))
	if !validNodeID(nodeID) {
		return false
	}
	token := bearerToken(r.Header.Get("Authorization"))
	return token != "" && s.store.ValidNodeToken(nodeID, hashToken(token))
}

func bearerToken(header string) string {
	scheme, token, ok := strings.Cut(strings.TrimSpace(header), " ")
	if !ok || !strings.EqualFold(scheme, "Bearer") {
		return ""
	}
	return strings.TrimSpace(token)
}

func (s *Server) adminAuthorized(r *http.Request) bool {
	cookie, err := r.Cookie("monitor_admin")
	if err != nil || cookie.Value == "" {
		return false
	}
	return s.sessions.Valid(cookie.Value)
}

func adminCookie(r *http.Request, value string, maxAge time.Duration) *http.Cookie {
	secure := r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
	return &http.Cookie{
		Name:     "monitor_admin",
		Value:    value,
		Path:     "/",
		MaxAge:   int(maxAge.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	}
}

func constantEqual(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

func socketURL(base string) string {
	base = strings.TrimRight(base, "/")
	base = strings.TrimPrefix(base, "http://")
	if strings.HasPrefix(base, "https://") {
		return "wss://" + strings.TrimPrefix(base, "https://") + "/ws"
	}
	return "ws://" + base + "/ws"
}

func writeJSON(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(value)
}

func methodNotAllowed(w http.ResponseWriter) {
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

func withCORS(next http.Handler, allowedOrigins []string) http.Handler {
	allowed := map[string]bool{}
	allowAll := false
	for _, origin := range allowedOrigins {
		if origin == "*" {
			allowAll = true
			continue
		}
		allowed[origin] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin != "" {
			if corsOriginAllowed(r, origin, allowed, allowAll) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Add("Vary", "Origin")
			} else if r.Method == http.MethodOptions {
				http.Error(w, "origin not allowed", http.StatusForbidden)
				return
			}
		}
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Node-ID")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func shellQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", "'\\''") + "'"
}

func psQuote(value string) string {
	return strings.ReplaceAll(value, "'", "''")
}

func validNodeID(value string) bool {
	value = strings.TrimSpace(value)
	if value == "" || len([]rune(value)) > 96 {
		return false
	}
	return !strings.ContainsAny(value, "\x00\r\n\t/\\'\"`$;&|<>!*?[]{}()")
}

func newAgentToken() (string, error) {
	var buf [32]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf[:]), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func corsOriginAllowed(r *http.Request, origin string, allowed map[string]bool, allowAll bool) bool {
	if origin == "" {
		return true
	}
	if allowAll {
		return true
	}
	if requestOriginSameHost(r, origin) {
		return true
	}
	origin, err := cleanOrigin(origin)
	if err != nil {
		return false
	}
	return allowed[origin]
}

func requestOriginSameHost(r *http.Request, origin string) bool {
	if origin == "" {
		return true
	}
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}
	return strings.EqualFold(u.Host, r.Host)
}

func (s *Server) validAdminOrigin(r *http.Request) bool {
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin == "" {
		return true
	}
	allowed := map[string]bool{}
	allowAll := false
	for _, value := range s.cfg.CORSOrigins {
		if value == "*" {
			allowAll = true
			continue
		}
		allowed[value] = true
	}
	return corsOriginAllowed(r, origin, allowed, allowAll)
}

func acceptsGzip(r *http.Request) bool {
	for _, part := range strings.Split(r.Header.Get("Accept-Encoding"), ",") {
		encoding, params, _ := strings.Cut(strings.TrimSpace(part), ";")
		if !strings.EqualFold(strings.TrimSpace(encoding), "gzip") {
			continue
		}
		for _, param := range strings.Split(params, ";") {
			key, value, ok := strings.Cut(strings.TrimSpace(param), "=")
			if !ok || !strings.EqualFold(strings.TrimSpace(key), "q") {
				continue
			}
			q, err := strconv.ParseFloat(strings.TrimSpace(value), 64)
			return err != nil || q > 0
		}
		return true
	}
	return false
}

func shouldGzip(path string) bool {
	switch filepath.Ext(path) {
	case ".html", ".css", ".js", ".json", ".svg":
		return true
	default:
		return false
	}
}

func setStaticCache(w http.ResponseWriter, path string) {
	if path == "index.html" || path == "config.json" {
		w.Header().Set("Cache-Control", "no-cache")
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
}

func hasStaticBuild() bool {
	_, err := fs.Stat(staticFiles, "web/dist/index.html")
	return err == nil
}
