package server

import (
	"encoding/json"
	"io/fs"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
)

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
