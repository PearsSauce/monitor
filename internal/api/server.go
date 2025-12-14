package api

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"monitor/internal/config"
	"monitor/internal/db"
	"monitor/internal/model"
	"monitor/internal/monitor"
)

type Server struct {
	s   *monitor.Service
	cfg config.Config
	mux *http.ServeMux
}

func NewServer(s *monitor.Service, cfg config.Config) *Server {
	srv := &Server{s: s, cfg: cfg, mux: http.NewServeMux()}
	srv.routes()
	return srv
}

func (s *Server) Start() error {
	return http.ListenAndServe(s.cfg.Addr, s.mux)
}

func (s *Server) routes() {
	s.mux.HandleFunc("/api/monitors", s.handleMonitors)
	s.mux.HandleFunc("/api/monitors/", s.handleMonitorByID)
	s.mux.HandleFunc("/api/groups", s.handleGroups)
	s.mux.HandleFunc("/api/groups/", s.handleGroupByID)
	s.mux.HandleFunc("/api/ssl/", s.handleSSL)
	s.mux.HandleFunc("/api/setup/state", s.handleSetupState)
	s.mux.HandleFunc("/api/setup", s.handleSetup)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
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
		_, err := s.s.DB().Exec(`INSERT INTO monitors(name,url,method,headers,body,expected_status_min,expected_status_max,keyword,group_id,interval_seconds)
			VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
			m.Name, m.URL, m.Method, m.HeadersJSON, m.Body, m.ExpectedStatusMin, m.ExpectedStatusMax, m.Keyword, m.GroupID, m.IntervalSeconds)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
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
	defer tmpdb.Close()
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
	s.s.SetDB(tmpdb)
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
		w.WriteHeader(204)
	case http.MethodDelete:
		_, err := s.s.DB().Exec(`DELETE FROM monitors WHERE id=$1`, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(204)
	default:
		w.WriteHeader(405)
	}
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
		var g model.MonitorGroup
		if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}
		_, err := s.s.DB().Exec(`INSERT INTO monitor_groups(name,icon,color) VALUES($1,$2,$3)`, g.Name, g.Icon, g.Color)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(201)
	default:
		w.WriteHeader(405)
	}
}

// expose DB for internal queries in handlers
func (s *Server) DB() *sql.DB { return s.s.DB() }
