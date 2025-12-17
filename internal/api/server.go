package api

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"monitor/internal/config"
	"monitor/internal/db"
	"monitor/internal/model"
	"monitor/internal/monitor"
	"monitor/internal/notify"

	"github.com/golang-jwt/jwt/v5"
)

type Server struct {
	s            *monitor.Service
	cfg          config.Config
	mux          *http.ServeMux
	updates      chan monitor.Update
	clients      map[int]chan monitor.Update
	clientsMu    sync.Mutex
	nextClientID int
}

func NewServer(s *monitor.Service, cfg config.Config) *Server {
	srv := &Server{s: s, cfg: cfg, mux: http.NewServeMux(), updates: make(chan monitor.Update, 64), clients: map[int]chan monitor.Update{}}
	s.SetEventSink(srv.updates)
	go func() {
		for u := range srv.updates {
			srv.clientsMu.Lock()
			for _, ch := range srv.clients {
				select {
				case ch <- u:
				default:
				}
			}
			srv.clientsMu.Unlock()
		}
	}()
	srv.routes()
	return srv
}

var (
	sfEpoch = time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).UnixMilli()
	sfMu    sync.Mutex
	sfLast  int64
	sfSeq   int64
	sfNode  int64 = func() int64 {
		var b [1]byte
		_, _ = rand.Read(b[:])
		return int64(b[0] % 32) // 5 bits node
	}()
)

func nextID() int64 {
	now := time.Now().UnixMilli()
	sfMu.Lock()
	if now == sfLast {
		sfSeq = (sfSeq + 1) & 0x7F // 7 bits sequence
	} else {
		sfSeq = 0
		sfLast = now
	}
	id := ((now - sfEpoch) << 12) | (sfNode << 7) | (sfSeq)
	sfMu.Unlock()
	return id
}

func (s *Server) Start() error {
	log.Printf("后端启动，监听地址=%s", s.cfg.Addr)
	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lw := &loggingWriter{ResponseWriter: w, status: 200}
		s.mux.ServeHTTP(lw, r)
		dur := time.Since(start).Milliseconds()
		log.Printf("请求 %s %s 状态=%d 耗时=%dms", r.Method, r.URL.Path, lw.status, dur)
	})
	return http.ListenAndServe(s.cfg.Addr, h)
}

func (s *Server) routes() {
	s.mux.HandleFunc("/api/monitors", s.handleMonitors)
	s.mux.HandleFunc("/api/monitors/", s.handleMonitorByID)
	s.mux.HandleFunc("/api/groups", s.handleGroups)
	s.mux.HandleFunc("/api/groups/", s.handleGroupByID)
	s.mux.HandleFunc("/api/notifications", s.handleNotifications)
	s.mux.HandleFunc("/api/notifications/test", s.handleNotificationsTest)
	s.mux.HandleFunc("/api/public/subscribe", s.handlePublicSubscribe)
	s.mux.HandleFunc("/api/subscriptions/verify", s.handleSubscriptionVerify)
	s.mux.HandleFunc("/api/subscriptions", s.handleSubscriptions)
	s.mux.HandleFunc("/api/subscriptions/", s.handleSubscriptionByID)
	s.mux.HandleFunc("/api/events", s.handleEvents)
	s.mux.HandleFunc("/api/ssl/", s.handleSSL)
	s.mux.HandleFunc("/api/setup/state", s.handleSetupState)
	s.mux.HandleFunc("/api/setup", s.handleSetup)
	s.mux.HandleFunc("/api/health", s.handleHealth)
	s.mux.HandleFunc("/api/settings", s.handleSettings)
	s.mux.HandleFunc("/api/admin/verify", s.handleAdminVerify)
	s.mux.HandleFunc("/api/login", s.handleLogin)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

type loggingWriter struct {
	http.ResponseWriter
	status int
}

func (lw *loggingWriter) WriteHeader(code int) {
	lw.status = code
	lw.ResponseWriter.WriteHeader(code)
}

func (lw *loggingWriter) Flush() {
	if f, ok := lw.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

func (s *Server) adminOK(r *http.Request) bool {
	auth := r.Header.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		tokenString := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}
			return []byte(s.cfg.JWTSecret), nil
		})
		if err == nil && token.Valid {
			return true
		}
	}
	return false
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	var req struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	if s.cfg.AdminPassword == "" || req.Password != s.cfg.AdminPassword {
		http.Error(w, "unauthorized", 401)
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})
	ts, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		http.Error(w, "internal error", 500)
		return
	}
	writeJSON(w, map[string]string{"token": ts})
}

func (s *Server) handleMonitors(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		ms, err := s.s.ListMonitors()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, ms)
	case http.MethodPost:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		var m struct {
			Name              string `json:"name"`
			URL               string `json:"url"`
			Method            string `json:"method"`
			HeadersJSON       string `json:"headers_json"`
			Body              string `json:"body"`
			ExpectedStatusMin int    `json:"expected_status_min"`
			ExpectedStatusMax int    `json:"expected_status_max"`
			Keyword           string `json:"keyword"`
			GroupID           *int   `json:"group_id"`
			IntervalSeconds   int    `json:"interval_seconds"`
		}
		if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		if m.Method == "" {
			m.Method = "GET"
		}
		if m.ExpectedStatusMin == 0 && m.ExpectedStatusMax == 0 {
			m.ExpectedStatusMin = 200
			m.ExpectedStatusMax = 299
		}
		if strings.TrimSpace(m.HeadersJSON) == "" {
			m.HeadersJSON = "{}"
		} else {
			var tmp interface{}
			if err := json.Unmarshal([]byte(m.HeadersJSON), &tmp); err != nil {
				http.Error(w, "invalid headers_json", 400)
				return
			}
		}
		id := nextID()
		_, err := s.s.DB().Exec(`INSERT INTO monitors(id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,group_id,interval_seconds)
			VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
			id, m.Name, m.URL, m.Method, m.HeadersJSON, m.Body, m.ExpectedStatusMin, m.ExpectedStatusMax, m.Keyword, m.GroupID, m.IntervalSeconds)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		s.s.StartLoop(int(id))
		go func() { _ = s.s.CheckMonitor(int(id)) }()
		w.WriteHeader(201)
	default:
		w.WriteHeader(405)
	}
}

func (s *Server) handleGroupByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	id, _ := strconv.Atoi(path)
	switch r.Method {
	case http.MethodPut:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		var g model.MonitorGroup
		if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		_, err := s.s.DB().Exec(`UPDATE monitor_groups SET name=$1, icon=$2, color=$3 WHERE id=$4`, g.Name, g.Icon, g.Color, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(204)
	case http.MethodDelete:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		_, err := s.s.DB().Exec(`DELETE FROM monitor_groups WHERE id=$1`, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(204)
	default:
		w.WriteHeader(405)
	}
}

func (s *Server) handlePublicSubscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(405)
		return
	}
	var in struct {
		MonitorID    int      `json:"monitor_id"`
		Email        string   `json:"email"`
		NotifyEvents []string `json:"notify_events"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	if in.MonitorID <= 0 || strings.TrimSpace(in.Email) == "" || len(in.NotifyEvents) == 0 {
		http.Error(w, "missing fields", 400)
		return
	}
	if !strings.Contains(in.Email, "@") {
		http.Error(w, "invalid email", 400)
		return
	}
	var name, url string
	_ = s.s.DB().QueryRow(`SELECT COALESCE(name,''), COALESCE(url,'') FROM monitors WHERE id=$1`, in.MonitorID).Scan(&name, &url)
	var smtpServer sql.NullString
	var smtpPort sql.NullInt64
	var smtpUser sql.NullString
	var smtpPassword sql.NullString
	var fromEmail sql.NullString
	var siteName sql.NullString
	_ = s.s.DB().QueryRow(`SELECT smtp_server, smtp_port, smtp_user, smtp_password, from_email, site_name FROM app_settings ORDER BY id DESC LIMIT 1`).
		Scan(&smtpServer, &smtpPort, &smtpUser, &smtpPassword, &fromEmail, &siteName)
	host := ifNullStr(smtpServer, "")
	user := ifNullStr(smtpUser, "")
	pass := ifNullStr(smtpPassword, "")
	port := ifNullInt(smtpPort, 0)
	from := ifNullStr(fromEmail, "")
	if strings.TrimSpace(host) == "" || port <= 0 || strings.TrimSpace(user) == "" || strings.TrimSpace(pass) == "" || strings.TrimSpace(from) == "" {
		http.Error(w, "SMTP未配置", 400)
		return
	}
	token := hex.EncodeToString(sha256.New().Sum([]byte(strconv.Itoa(in.MonitorID) + "|" + in.Email + "|" + strconv.FormatInt(time.Now().UnixNano(), 10))))
	expires := time.Now().Add(24 * time.Hour)
	ev := strings.Join(in.NotifyEvents, ",")
	id := nextID()
	_, _ = s.s.DB().Exec(`DELETE FROM monitor_subscriptions WHERE monitor_id=$1 AND email=$2`, in.MonitorID, in.Email)
	_, err := s.s.DB().Exec(`INSERT INTO monitor_subscriptions(id, monitor_id, email, notify_events, verified, verify_token, verify_expires) VALUES($1,$2,$3,$4,false,$5,$6)`,
		id, in.MonitorID, in.Email, ev, token, expires)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	proto := "http"
	if strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		proto = "https"
	}
	verifyURL := proto + "://" + r.Host + "/api/subscriptions/verify?token=" + token
	subject := "订阅验证 · " + name + " ｜ " + ifNullStr(siteName, "服务监控系统")
	html := notify.BodySubscriptionVerify(ifNullStr(siteName, "服务监控系统"), name, verifyURL)
	go notify.SendSMTP(host, port, user, pass, from, in.Email, subject, html)
	w.WriteHeader(201)
}

func (s *Server) handleSubscriptionVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	token := r.URL.Query().Get("token")
	if strings.TrimSpace(token) == "" {
		http.Error(w, "missing token", 400)
		return
	}
	var id int64
	var expires time.Time
	err := s.s.DB().QueryRow(`SELECT id, verify_expires FROM monitor_subscriptions WHERE verify_token=$1`, token).Scan(&id, &expires)
	if err != nil {
		http.Error(w, "invalid token", 400)
		return
	}
	if time.Now().After(expires) {
		http.Error(w, "token expired", 400)
		return
	}
	_, err = s.s.DB().Exec(`UPDATE monitor_subscriptions SET verified=true, verify_token=NULL, verify_expires=NULL WHERE id=$1`, id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	var siteName sql.NullString
	_ = s.s.DB().QueryRow(`SELECT site_name FROM app_settings ORDER BY id DESC LIMIT 1`).Scan(&siteName)
	_, _ = w.Write([]byte(notify.PageSubscriptionVerifySuccess(ifNullStr(siteName, "服务监控系统"))))
}
func (s *Server) handleSetupState(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	type resp struct {
		Installed bool `json:"installed"`
	}
	if _, err := os.Stat(".env"); err == nil {
		writeJSON(w, resp{Installed: true})
		return
	}
	var count int
	if err := s.s.DB().QueryRow(`SELECT COUNT(*) FROM admin_users`).Scan(&count); err != nil {
		writeJSON(w, resp{Installed: false})
		return
	}
	writeJSON(w, resp{Installed: count > 0})
}

func (s *Server) handleSetup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(405)
		return
	}
	var in struct {
		DatabaseURL         string `json:"database_url"`
		Addr                string `json:"addr"`
		AdminEmail          string `json:"admin_email"`
		AdminPassword       string `json:"admin_password"`
		ResendAPIKey        string `json:"resend_api_key"`
		AlertBeforeDays     int    `json:"alert_before_days"`
		CheckIntervalSecond int    `json:"check_interval_seconds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	if in.DatabaseURL == "" || in.AdminEmail == "" || in.AdminPassword == "" {
		http.Error(w, "missing required fields", 400)
		return
	}
	tmpdb, err := db.Open(in.DatabaseURL)
	if err != nil {
		http.Error(w, "database connect error", 400)
		return
	}
	if err := db.Migrate(tmpdb); err != nil {
		http.Error(w, "migrate error", 500)
		return
	}
	salt := make([]byte, 16)
	_, _ = rand.Read(salt)
	hashed := sha256.Sum256(append(salt, []byte(in.AdminPassword)...))
	pw := hex.EncodeToString(salt) + "$" + hex.EncodeToString(hashed[:])
	_, err = tmpdb.Exec(`INSERT INTO admin_users(email, password_hash) VALUES($1,$2)
		ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash`, in.AdminEmail, pw)
	if err != nil {
		http.Error(w, "admin create error", 500)
		return
	}
	_, _ = tmpdb.Exec(`INSERT INTO app_settings(addr,database_url,resend_api_key,alert_before_days,check_interval_seconds)
		VALUES($1,$2,$3,$4,$5)`, in.Addr, in.DatabaseURL, in.ResendAPIKey, in.AlertBeforeDays, in.CheckIntervalSecond)
	env := "ADDR=" + defaultStr(in.Addr, ":8080") + "\n" +
		"DATABASE_URL=" + in.DatabaseURL + "\n" +
		"RESEND_API_KEY=" + in.ResendAPIKey + "\n" +
		"ALERT_BEFORE_DAYS=" + strconv.Itoa(defaultInt(in.AlertBeforeDays, 14)) + "\n" +
		"CHECK_INTERVAL_SECONDS=" + strconv.Itoa(defaultInt(in.CheckIntervalSecond, 60)) + "\n"
	_ = os.WriteFile(".env", []byte(env), 0600)
	prev := s.s.DB()
	s.s.SetDB(tmpdb)
	if prev != nil {
		_ = prev.Close()
	}
	w.WriteHeader(201)
}

func defaultStr(s string, def string) string {
	if s == "" {
		return def
	}
	return s
}
func defaultInt(i int, def int) int {
	if i == 0 {
		return def
	}
	return i
}
func (s *Server) handleMonitorByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/monitors/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		w.WriteHeader(404)
		return
	}
	id, _ := strconv.Atoi(parts[0])
	if len(parts) > 1 && parts[1] == "run" {
		if r.Method != http.MethodPost {
			w.WriteHeader(405)
			return
		}
		if err := s.s.CheckMonitor(id); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		var (
			t      time.Time
			on     bool
			sc     sql.NullInt64
			ms     sql.NullInt64
			errStr sql.NullString
		)
		_ = s.s.DB().QueryRow(`SELECT checked_at, online, status_code, response_ms, error FROM monitor_results WHERE monitor_id=$1 ORDER BY checked_at DESC LIMIT 1`, id).
			Scan(&t, &on, &sc, &ms, &errStr)
		type resp struct {
			CheckedAt  string `json:"checked_at"`
			Online     bool   `json:"online"`
			StatusCode int    `json:"status_code"`
			ResponseMs int    `json:"response_ms"`
			Error      string `json:"error"`
		}
		out := resp{CheckedAt: t.Format(time.RFC3339), Online: on}
		if sc.Valid {
			out.StatusCode = int(sc.Int64)
		}
		if ms.Valid {
			out.ResponseMs = int(ms.Int64)
		}
		if errStr.Valid {
			out.Error = errStr.String
		}
		writeJSON(w, out)
		return
	}
	if len(parts) > 1 && parts[1] == "latest" {
		if r.Method != http.MethodGet {
			w.WriteHeader(405)
			return
		}
		var (
			t      time.Time
			on     bool
			sc     sql.NullInt64
			ms     sql.NullInt64
			errStr sql.NullString
		)
		err := s.s.DB().QueryRow(`SELECT checked_at, online, status_code, response_ms, error FROM monitor_results WHERE monitor_id=$1 ORDER BY checked_at DESC LIMIT 1`, id).
			Scan(&t, &on, &sc, &ms, &errStr)
		if err != nil {
			http.Error(w, "not found", 404)
			return
		}
		type resp struct {
			CheckedAt  string `json:"checked_at"`
			Online     bool   `json:"online"`
			StatusCode int    `json:"status_code"`
			ResponseMs int    `json:"response_ms"`
			Error      string `json:"error"`
		}
		out := resp{CheckedAt: t.Format(time.RFC3339), Online: on}
		if sc.Valid {
			out.StatusCode = int(sc.Int64)
		}
		if ms.Valid {
			out.ResponseMs = int(ms.Int64)
		}
		if errStr.Valid {
			out.Error = errStr.String
		}
		writeJSON(w, out)
		return
	}
	if len(parts) > 1 && parts[1] == "history" {
		switch r.Method {
		case http.MethodGet:
			days := 30
			if v := r.URL.Query().Get("days"); v != "" {
				if n, err := strconv.Atoi(v); err == nil {
					days = n
				}
			}
			if r.URL.Query().Get("group") == "day" {
				rows, err := s.s.DB().Query(`SELECT date_trunc('day', checked_at) AS day,
					COUNT(*) FILTER (WHERE online) AS online_count,
					COUNT(*) AS total_count,
					COALESCE(AVG(NULLIF(response_ms,0)) FILTER (WHERE online), 0)
					FROM monitor_results
					WHERE monitor_id=$1 AND checked_at>=NOW() - ($2||' days')::interval
					GROUP BY day
					ORDER BY day DESC`, id, days)
				if err != nil {
					http.Error(w, err.Error(), 500)
					return
				}
				defer rows.Close()
				type item struct {
					Day           string  `json:"day"`
					OnlineCount   int     `json:"online_count"`
					TotalCount    int     `json:"total_count"`
					AvgResponseMs float64 `json:"avg_response_ms"`
				}
				var list []item
				for rows.Next() {
					var it item
					var t time.Time
					if err := rows.Scan(&t, &it.OnlineCount, &it.TotalCount, &it.AvgResponseMs); err != nil {
						http.Error(w, err.Error(), 500)
						return
					}
					it.Day = t.Format("2006-01-02")
					list = append(list, it)
				}
				writeJSON(w, list)
			} else {
				rows, err := s.s.DB().Query(`SELECT checked_at, online, status_code, response_ms, error 
					FROM monitor_results WHERE monitor_id=$1 AND checked_at>=NOW() - ($2||' days')::interval
					ORDER BY checked_at DESC`, id, days)
				if err != nil {
					http.Error(w, err.Error(), 500)
					return
				}
				defer rows.Close()
				type item struct {
					CheckedAt  string `json:"checked_at"`
					Online     bool   `json:"online"`
					StatusCode int    `json:"status_code"`
					ResponseMs int    `json:"response_ms"`
					Error      string `json:"error"`
				}
				var list []item
				for rows.Next() {
					var it item
					var errStr sql.NullString
					var t time.Time
					if err := rows.Scan(&t, &it.Online, &it.StatusCode, &it.ResponseMs, &errStr); err != nil {
						http.Error(w, err.Error(), 500)
						return
					}
					it.CheckedAt = t.Format(time.RFC3339)
					if errStr.Valid {
						it.Error = errStr.String
					}
					list = append(list, it)
				}
				writeJSON(w, list)
			}
		default:
			w.WriteHeader(405)
		}
		return
	}
	if len(parts) > 1 && parts[1] == "subscriptions" {
		if r.Method != http.MethodDelete {
			w.WriteHeader(405)
			return
		}
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		_, err := s.s.DB().Exec(`DELETE FROM monitor_subscriptions WHERE monitor_id=$1`, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(204)
		return
	}
	switch r.Method {
	case http.MethodGet:
		var m model.Monitor
		err := s.s.DB().QueryRow(`SELECT id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,group_id,interval_seconds,last_online,last_checked_at FROM monitors WHERE id=$1`, id).
			Scan(&m.ID, &m.Name, &m.URL, &m.Method, &m.HeadersJSON, &m.Body, &m.ExpectedStatusMin, &m.ExpectedStatusMax, &m.Keyword, &m.GroupID, &m.IntervalSeconds, &m.LastOnline, &m.LastCheckedAt)
		if err != nil {
			http.Error(w, err.Error(), 404)
			return
		}
		writeJSON(w, m)
	case http.MethodPut:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		var m struct {
			Name              string `json:"name"`
			URL               string `json:"url"`
			Method            string `json:"method"`
			HeadersJSON       string `json:"headers_json"`
			Body              string `json:"body"`
			ExpectedStatusMin int    `json:"expected_status_min"`
			ExpectedStatusMax int    `json:"expected_status_max"`
			Keyword           string `json:"keyword"`
			GroupID           *int   `json:"group_id"`
			IntervalSeconds   int    `json:"interval_seconds"`
		}
		if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		_, err := s.s.DB().Exec(`UPDATE monitors SET name=$1,url=$2,method=$3,headers=$4,body=$5,expected_status_min=$6,expected_status_max=$7,keyword=$8,group_id=$9,interval_seconds=$10 WHERE id=$11`,
			m.Name, m.URL, m.Method, m.HeadersJSON, m.Body, m.ExpectedStatusMin, m.ExpectedStatusMax, m.Keyword, m.GroupID, m.IntervalSeconds, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		s.s.RestartLoop(id)
		w.WriteHeader(204)
	case http.MethodDelete:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		_, err := s.s.DB().Exec(`DELETE FROM monitors WHERE id=$1`, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		s.s.StopLoop(id)
		w.WriteHeader(204)
	default:
		w.WriteHeader(405)
	}
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	type resp struct {
		Name    string `json:"name"`
		Version string `json:"version"`
		Status  string `json:"status"`
	}
	writeJSON(w, resp{Name: "Monitor Backend", Version: "0.1.0", Status: "running"})
}

func (s *Server) handleSettings(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		type resp struct {
			RetentionDays        int      `json:"retention_days"`
			FlapThreshold        int      `json:"flap_threshold"`
			CheckIntervalSeconds int      `json:"check_interval_seconds"`
			DebounceSeconds      int      `json:"debounce_seconds"`
			SiteName             string   `json:"site_name"`
			Subtitle             string   `json:"subtitle"`
			TabSubtitle          string   `json:"tab_subtitle"`
			EnableNotifications  bool     `json:"enable_notifications"`
			NotifyEvents         []string `json:"notify_events"`
			SMTPServer           string   `json:"smtp_server"`
			SMTPPort             int      `json:"smtp_port"`
			SMTPUser             string   `json:"smtp_user"`
			SMTPPassword         string   `json:"smtp_password"`
			FromEmail            string   `json:"from_email"`
			ToEmails             string   `json:"to_emails"`
		}
		var (
			siteName, subtitle, tabSubtitle, notifyEvents, smtpServer, smtpUser, smtpPassword, fromEmail sql.NullString
			debounce, smtpPort, retentionDays, flapThreshold, checkInterval                              sql.NullInt64
			enable                                                                                       sql.NullBool
		)
		var toEmails sql.NullString
		_ = s.s.DB().QueryRow(`SELECT site_name, subtitle, tab_subtitle, debounce_seconds, enable_notifications, notify_events, smtp_server, smtp_port, smtp_user, smtp_password, from_email, to_emails, retention_days, flap_threshold, check_interval_seconds FROM app_settings ORDER BY id DESC LIMIT 1`).
			Scan(&siteName, &subtitle, &tabSubtitle, &debounce, &enable, &notifyEvents, &smtpServer, &smtpPort, &smtpUser, &smtpPassword, &fromEmail, &toEmails, &retentionDays, &flapThreshold, &checkInterval)
		out := resp{
			RetentionDays:        ifNullInt(retentionDays, 30),
			FlapThreshold:        ifNullInt(flapThreshold, 2),
			CheckIntervalSeconds: ifNullInt(checkInterval, 60),
			DebounceSeconds:      ifNullInt(debounce, 0),
			SiteName:             ifNullStr(siteName, "服务监控系统"),
			Subtitle:             ifNullStr(subtitle, ""),
			TabSubtitle:          ifNullStr(tabSubtitle, ""),
			EnableNotifications:  ifNullBool(enable, true),
			NotifyEvents:         ifNullCSV(notifyEvents, []string{"online", "offline", "ssl_expiry"}),
			SMTPServer:           ifNullStr(smtpServer, ""),
			SMTPPort:             ifNullInt(smtpPort, 0),
			SMTPUser:             ifNullStr(smtpUser, ""),
			SMTPPassword:         ifNullStr(smtpPassword, ""),
			FromEmail:            ifNullStr(fromEmail, ""),
			ToEmails:             ifNullStr(toEmails, ""),
		}
		writeJSON(w, out)
	case http.MethodPut:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		var in struct {
			RetentionDays        int      `json:"retention_days"`
			FlapThreshold        int      `json:"flap_threshold"`
			CheckIntervalSeconds int      `json:"check_interval_seconds"`
			DebounceSeconds      *int     `json:"debounce_seconds"`
			SiteName             *string  `json:"site_name"`
			Subtitle             *string  `json:"subtitle"`
			TabSubtitle          *string  `json:"tab_subtitle"`
			EnableNotifications  *bool    `json:"enable_notifications"`
			NotifyEvents         []string `json:"notify_events"`
			SMTPServer           *string  `json:"smtp_server"`
			SMTPPort             *int     `json:"smtp_port"`
			SMTPUser             *string  `json:"smtp_user"`
			SMTPPassword         *string  `json:"smtp_password"`
			FromEmail            *string  `json:"from_email"`
			ToEmails             *string  `json:"to_emails"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		var count int
		_ = s.s.DB().QueryRow(`SELECT COUNT(*) FROM app_settings`).Scan(&count)
		if count == 0 {
			_, _ = s.s.DB().Exec(`INSERT INTO app_settings(id, site_name, subtitle, tab_subtitle, debounce_seconds, enable_notifications, notify_events, smtp_server, smtp_port, smtp_user, smtp_password, from_email, to_emails, retention_days, flap_threshold, check_interval_seconds)
				VALUES(1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
				in.SiteName, in.Subtitle, in.TabSubtitle, in.DebounceSeconds, in.EnableNotifications, strings.Join(in.NotifyEvents, ","), in.SMTPServer, in.SMTPPort, in.SMTPUser, in.SMTPPassword, in.FromEmail, in.ToEmails, nullIfZero(in.RetentionDays), nullIfZero(in.FlapThreshold), nullIfZero(in.CheckIntervalSeconds))
		} else {
			_, _ = s.s.DB().Exec(`UPDATE app_settings SET 
				site_name=COALESCE($1, site_name),
				subtitle=COALESCE($2, subtitle),
				tab_subtitle=COALESCE($3, tab_subtitle),
				debounce_seconds=COALESCE($4, debounce_seconds),
				enable_notifications=COALESCE($5, enable_notifications),
				notify_events=COALESCE($6, notify_events),
				smtp_server=COALESCE($7, smtp_server),
				smtp_port=COALESCE($8, smtp_port),
				smtp_user=COALESCE($9, smtp_user),
				smtp_password=COALESCE($10, smtp_password),
				from_email=COALESCE($11, from_email),
				to_emails=COALESCE($12, to_emails),
				retention_days=COALESCE($13, retention_days),
				flap_threshold=COALESCE($14, flap_threshold),
				check_interval_seconds=COALESCE($15, check_interval_seconds)
			WHERE id=(SELECT id FROM app_settings ORDER BY id DESC LIMIT 1)`,
				in.SiteName, in.Subtitle, in.TabSubtitle, in.DebounceSeconds, in.EnableNotifications, strings.Join(in.NotifyEvents, ","), in.SMTPServer, in.SMTPPort, in.SMTPUser, in.SMTPPassword, in.FromEmail, in.ToEmails, nullIfZero(in.RetentionDays), nullIfZero(in.FlapThreshold), nullIfZero(in.CheckIntervalSeconds))
		}
		w.WriteHeader(204)
	default:
		w.WriteHeader(405)
	}
}

func (s *Server) handleAdminVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	if !s.adminOK(r) {
		http.Error(w, "unauthorized", 401)
		return
	}
	w.WriteHeader(204)
}

func (s *Server) handleNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	limit := 20
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 200 {
			limit = n
		}
	}
	rows, err := s.s.DB().Query(`SELECT n.id, n.monitor_id, n.created_at, n.type, n.message, m.name
		FROM notifications n
		JOIN monitors m ON m.id = n.monitor_id
		ORDER BY n.created_at DESC
		LIMIT $1`, limit)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()
	type item struct {
		ID          int    `json:"id"`
		MonitorID   int    `json:"monitor_id"`
		CreatedAt   string `json:"created_at"`
		Type        string `json:"type"`
		Message     string `json:"message"`
		MonitorName string `json:"monitor_name"`
	}
	var list []item
	for rows.Next() {
		var it item
		var t time.Time
		if err := rows.Scan(&it.ID, &it.MonitorID, &t, &it.Type, &it.Message, &it.MonitorName); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		it.CreatedAt = t.Format(time.RFC3339)
		list = append(list, it)
	}
	writeJSON(w, list)
}

func (s *Server) handleNotificationsTest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(405)
		return
	}
	if !s.adminOK(r) {
		http.Error(w, "unauthorized", 401)
		return
	}
	var in struct {
		Type      string `json:"type"`
		MonitorID int    `json:"monitor_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	if in.MonitorID <= 0 || (in.Type != "online" && in.Type != "offline" && in.Type != "ssl_expiry") {
		http.Error(w, "invalid payload", 400)
		return
	}
	var name, url string
	_ = s.s.DB().QueryRow(`SELECT COALESCE(name,''), COALESCE(url,'') FROM monitors WHERE id=$1`, in.MonitorID).Scan(&name, &url)
	var enable sql.NullBool
	var notifyEvents sql.NullString
	var smtpServer sql.NullString
	var smtpPort sql.NullInt64
	var smtpUser sql.NullString
	var smtpPassword sql.NullString
	var fromEmail sql.NullString
	var toEmails sql.NullString
	_ = s.s.DB().QueryRow(`SELECT enable_notifications, notify_events, smtp_server, smtp_port, smtp_user, smtp_password, from_email, to_emails FROM app_settings ORDER BY id DESC LIMIT 1`).
		Scan(&enable, &notifyEvents, &smtpServer, &smtpPort, &smtpUser, &smtpPassword, &fromEmail, &toEmails)
	var insertType string
	var msg string
	switch in.Type {
	case "online":
		insertType = "status_change"
		msg = "服务恢复(测试)"
	case "offline":
		insertType = "status_change"
		msg = "服务离线(测试)"
	case "ssl_expiry":
		insertType = "ssl_expiry"
		msg = "证书到期(测试)"
	}
	_, err := s.s.DB().Exec(`INSERT INTO notifications(monitor_id,type,message) VALUES($1,$2,$3)`, in.MonitorID, insertType, msg)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	enabled := ifNullBool(enable, true)
	if !enabled {
		w.WriteHeader(204)
		return
	}
	events := ifNullCSV(notifyEvents, []string{"online", "offline", "ssl_expiry"})
	want := false
	for _, e := range events {
		if strings.TrimSpace(e) == in.Type {
			want = true
			break
		}
	}
	if want {
		recips := []string{}
		if toEmails.Valid && strings.TrimSpace(toEmails.String) != "" {
			for _, p := range strings.Split(toEmails.String, ",") {
				p = strings.TrimSpace(p)
				if p != "" {
					recips = append(recips, p)
				}
			}
		} else {
			var to string
			_ = s.s.DB().QueryRow(`SELECT email FROM admin_users ORDER BY id LIMIT 1`).Scan(&to)
			if to != "" {
				recips = append(recips, to)
			}
		}
		if len(recips) > 0 {
			var siteName sql.NullString
			_ = s.s.DB().QueryRow(`SELECT site_name FROM app_settings ORDER BY id DESC LIMIT 1`).Scan(&siteName)
			subject := notify.SubjectTest(in.Type, name, ifNullStr(siteName, "服务监控系统"))
			html := notify.BodyTest(ifNullStr(siteName, "服务监控系统"), name, url, in.Type, time.Now().Format(time.RFC3339))
			from := ifNullStr(fromEmail, "")
			host := ifNullStr(smtpServer, "")
			user := ifNullStr(smtpUser, "")
			pass := ifNullStr(smtpPassword, "")
			port := ifNullInt(smtpPort, 0)
			if strings.TrimSpace(host) == "" || port <= 0 || strings.TrimSpace(user) == "" || strings.TrimSpace(pass) == "" || strings.TrimSpace(from) == "" {
				http.Error(w, "SMTP配置不完整", 400)
				return
			}
			for _, to := range recips {
				if err := notify.SendSMTP(host, port, user, pass, from, to, subject, html); err != nil {
					log.Printf("smtp send failed: %v", err)
					http.Error(w, "SMTP发送失败: "+err.Error(), 500)
					return
				}
				log.Printf("smtp sent ok to=%s server=%s port=%d", to, host, port)
			}
		}
	}
	w.WriteHeader(204)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func ifNullStr(v sql.NullString, def string) string {
	if v.Valid && strings.TrimSpace(v.String) != "" {
		return v.String
	}
	return def
}
func ifNullInt(v sql.NullInt64, def int) int {
	if v.Valid {
		return int(v.Int64)
	}
	return def
}
func ifNullBool(v sql.NullBool, def bool) bool {
	if v.Valid {
		return v.Bool
	}
	return def
}
func ifNullCSV(v sql.NullString, def []string) []string {
	if v.Valid && strings.TrimSpace(v.String) != "" {
		var out []string
		for _, p := range strings.Split(v.String, ",") {
			p = strings.TrimSpace(p)
			if p != "" {
				out = append(out, p)
			}
		}
		return out
	}
	return def
}

func nullIfZero(v int) interface{} {
	if v == 0 {
		return nil
	}
	return v
}

func (s *Server) handleEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	fl, ok := w.(http.Flusher)
	if !ok {
		w.WriteHeader(500)
		return
	}
	s.clientsMu.Lock()
	s.nextClientID++
	id := s.nextClientID
	ch := make(chan monitor.Update, 16)
	s.clients[id] = ch
	s.clientsMu.Unlock()
	ctx := r.Context()
	for {
		select {
		case <-ctx.Done():
			s.clientsMu.Lock()
			delete(s.clients, id)
			close(ch)
			s.clientsMu.Unlock()
			return
		case u := <-ch:
			b, _ := json.Marshal(u)
			w.Write([]byte("data: "))
			w.Write(b)
			w.Write([]byte("\n\n"))
			fl.Flush()
		}
	}
}

func updateEnv(kv map[string]string) {
	b, _ := os.ReadFile(".env")
	lines := strings.Split(string(b), "\n")
	m := map[string]bool{}
	for k := range kv {
		m[k] = false
	}
	for i := range lines {
		if lines[i] == "" || strings.HasPrefix(strings.TrimSpace(lines[i]), "#") {
			continue
		}
		parts := strings.SplitN(lines[i], "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		if _, ok := kv[key]; ok {
			lines[i] = key + "=" + kv[key]
			m[key] = true
		}
	}
	var out []string
	out = append(out, lines...)
	for k, done := range m {
		if !done {
			out = append(out, k+"="+kv[k])
		}
	}
	_ = os.WriteFile(".env", []byte(strings.Join(out, "\n")), 0600)
}
func (s *Server) handleSSL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/api/ssl/")
	id, _ := strconv.Atoi(path)
	var expires sql.NullTime
	var issuer sql.NullString
	var days sql.NullInt64
	err := s.s.DB().QueryRow(`SELECT expires_at, issuer, days_left FROM ssl_info WHERE monitor_id=$1`, id).
		Scan(&expires, &issuer, &days)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	type resp struct {
		ExpiresAt string `json:"expires_at"`
		Issuer    string `json:"issuer"`
		DaysLeft  int    `json:"days_left"`
	}
	out := resp{}
	if expires.Valid {
		out.ExpiresAt = expires.Time.Format(time.RFC3339)
	}
	if issuer.Valid {
		out.Issuer = issuer.String
	}
	if days.Valid {
		out.DaysLeft = int(days.Int64)
	}
	writeJSON(w, out)
}

func (s *Server) handleGroups(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := s.s.DB().Query(`SELECT id,name,icon,color FROM monitor_groups ORDER BY id`)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()
		var list []model.MonitorGroup
		for rows.Next() {
			var g model.MonitorGroup
			if err := rows.Scan(&g.ID, &g.Name, &g.Icon, &g.Color); err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			list = append(list, g)
		}
		writeJSON(w, list)
	case http.MethodPost:
		if !s.adminOK(r) {
			http.Error(w, "unauthorized", 401)
			return
		}
		var g model.MonitorGroup
		if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		id := nextID()
		_, err := s.s.DB().Exec(`INSERT INTO monitor_groups(id,name,icon,color) VALUES($1,$2,$3,$4)`, id, g.Name, g.Icon, g.Color)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(201)
	default:
		w.WriteHeader(405)
	}
}

func (s *Server) handleSubscriptions(w http.ResponseWriter, r *http.Request) {
	if !s.adminOK(r) {
		http.Error(w, "unauthorized", 401)
		return
	}
	switch r.Method {
	case http.MethodGet:
		midStr := r.URL.Query().Get("monitor_id")
		type item struct {
			ID           int64  `json:"id"`
			MonitorID    int    `json:"monitor_id"`
			MonitorName  string `json:"monitor_name"`
			Email        string `json:"email"`
			NotifyEvents string `json:"notify_events"`
			Verified     bool   `json:"verified"`
			CreatedAt    string `json:"created_at"`
		}
		var list []item
		if strings.TrimSpace(midStr) == "" {
			rows, err := s.s.DB().Query(`SELECT s.id, s.monitor_id, m.name, s.email, s.notify_events, s.verified, s.created_at 
				FROM monitor_subscriptions s 
				JOIN monitors m ON m.id=s.monitor_id
				ORDER BY s.created_at DESC`)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			defer rows.Close()
			for rows.Next() {
				var it item
				var created time.Time
				if err := rows.Scan(&it.ID, &it.MonitorID, &it.MonitorName, &it.Email, &it.NotifyEvents, &it.Verified, &created); err != nil {
					http.Error(w, err.Error(), 500)
					return
				}
				it.CreatedAt = created.Format(time.RFC3339)
				list = append(list, it)
			}
		} else {
			mid, err := strconv.Atoi(midStr)
			if err != nil || mid <= 0 {
				http.Error(w, "invalid monitor_id", 400)
				return
			}
			rows, err := s.s.DB().Query(`SELECT s.id, s.monitor_id, m.name, s.email, s.notify_events, s.verified, s.created_at 
				FROM monitor_subscriptions s 
				JOIN monitors m ON m.id=s.monitor_id
				WHERE s.monitor_id=$1
				ORDER BY s.created_at DESC`, mid)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			defer rows.Close()
			for rows.Next() {
				var it item
				var created time.Time
				if err := rows.Scan(&it.ID, &it.MonitorID, &it.MonitorName, &it.Email, &it.NotifyEvents, &it.Verified, &created); err != nil {
					http.Error(w, err.Error(), 500)
					return
				}
				it.CreatedAt = created.Format(time.RFC3339)
				list = append(list, it)
			}
		}
		if list == nil {
			list = []item{}
		}
		writeJSON(w, list)
	case http.MethodPost:
		var in struct {
			MonitorID    int      `json:"monitor_id"`
			Email        string   `json:"email"`
			NotifyEvents []string `json:"notify_events"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		if in.MonitorID <= 0 || strings.TrimSpace(in.Email) == "" || len(in.NotifyEvents) == 0 {
			http.Error(w, "missing fields", 400)
			return
		}
		if !strings.Contains(in.Email, "@") {
			http.Error(w, "invalid email", 400)
			return
		}
		ev := strings.Join(in.NotifyEvents, ",")
		id := nextID()
		_, err := s.s.DB().Exec(`INSERT INTO monitor_subscriptions(id, monitor_id, email, notify_events) VALUES($1, $2, $3, $4)`, id, in.MonitorID, in.Email, ev)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(201)
	default:
		w.WriteHeader(405)
	}
}

func (s *Server) handleSubscriptionByID(w http.ResponseWriter, r *http.Request) {
	if !s.adminOK(r) {
		http.Error(w, "unauthorized", 401)
		return
	}
	idStr := strings.TrimPrefix(r.URL.Path, "/api/subscriptions/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		http.Error(w, "invalid id", 400)
		return
	}
	if r.Method == http.MethodDelete {
		_, err := s.s.DB().Exec(`DELETE FROM monitor_subscriptions WHERE id=$1`, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(204)
	} else {
		w.WriteHeader(405)
	}
}

// expose DB for internal queries in handlers
func (s *Server) DB() *sql.DB { return s.s.DB() }
