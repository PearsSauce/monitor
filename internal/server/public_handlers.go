package server

import (
	"compress/gzip"
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
)

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
