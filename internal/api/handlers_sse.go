package api

import (
	"encoding/json"
	"net/http"
	"time"

	"monitor/internal/monitor"
)

// handleEvents handles GET /api/events (SSE endpoint)
func (s *Server) handleEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	fl, ok := w.(http.Flusher)
	if !ok {
		internalError(w, "Streaming not supported")
		return
	}

	// Register client
	s.clientsMu.Lock()
	s.nextClientID++
	clientID := s.nextClientID
	ch := make(chan monitor.Update, 16)
	s.clients[clientID] = ch
	clientCount := len(s.clients)
	s.clientsMu.Unlock()

	s.logger.Info("SSE客户端连接", "client_id", clientID, "total_clients", clientCount)

	ctx := r.Context()
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	// Cleanup on disconnect
	defer func() {
		s.clientsMu.Lock()
		delete(s.clients, clientID)
		close(ch)
		clientCount := len(s.clients)
		s.clientsMu.Unlock()
		s.logger.Info("SSE客户端断开", "client_id", clientID, "total_clients", clientCount)
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Send keepalive ping
			_, _ = w.Write([]byte(": ping\n\n"))
			fl.Flush()
		case u := <-ch:
			b, _ := json.Marshal(u)
			_, _ = w.Write([]byte("data: "))
			_, _ = w.Write(b)
			_, _ = w.Write([]byte("\n\n"))
			fl.Flush()
		}
	}
}

// handleSSL handles GET /api/ssl/{id}
func (s *Server) handleSSL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	path := r.URL.Path[len("/api/ssl/"):]
	id := 0
	for _, c := range path {
		if c >= '0' && c <= '9' {
			id = id*10 + int(c-'0')
		} else {
			break
		}
	}

	if id <= 0 {
		badRequest(w, "无效的监控ID")
		return
	}

	type SSLResponse struct {
		ExpiresAt string `json:"expires_at"`
		Issuer    string `json:"issuer"`
		DaysLeft  int    `json:"days_left"`
	}

	var expiresAt, issuer string
	var daysLeft int

	err := s.svc.DB().QueryRow(`SELECT COALESCE(expires_at::text, ''), COALESCE(issuer, ''), COALESCE(days_left, 0) FROM ssl_info WHERE monitor_id=$1`, id).
		Scan(&expiresAt, &issuer, &daysLeft)
	if err != nil {
		notFound(w, "SSL信息不存在")
		return
	}

	writeJSON(w, SSLResponse{
		ExpiresAt: expiresAt,
		Issuer:    issuer,
		DaysLeft:  daysLeft,
	})
}
