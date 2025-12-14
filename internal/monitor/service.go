package monitor

import (
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"strings"
	"time"

	"monitor/internal/config"
	"monitor/internal/model"
	"monitor/internal/notify"
	"strconv"
)

type Service struct {
	db  *sql.DB
	cfg config.Config
}

func NewService(db *sql.DB, cfg config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

func (s *Service) DB() *sql.DB { return s.db }

func (s *Service) SetDB(newdb *sql.DB) { s.db = newdb }

func (s *Service) StartScheduler() {
	for {
		monitors, err := s.ListMonitors()
		if err != nil {
			time.Sleep(5 * time.Second)
			continue
		}
		for _, m := range monitors {
			interval := time.Duration(m.IntervalSeconds) * time.Second
			if interval <= 0 {
				interval = s.cfg.DefaultCheckInterval
			}
			go s.runLoop(m.ID, interval)
		}
		time.Sleep(60 * time.Second)
	}
}

func (s *Service) runLoop(monitorID int, interval time.Duration) {
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		if err := s.CheckMonitor(monitorID); err != nil {
			// swallow error
		}
		<-t.C
	}
}

func (s *Service) CheckMonitor(id int) error {
	var m model.Monitor
	err := s.db.QueryRow(`SELECT id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,interval_seconds,last_online,last_checked_at
		FROM monitors WHERE id=$1`, id).Scan(
		&m.ID, &m.Name, &m.URL, &m.Method, &m.HeadersJSON, &m.Body, &m.ExpectedStatusMin, &m.ExpectedStatusMax, &m.Keyword, &m.IntervalSeconds, &m.LastOnline, &m.LastCheckedAt,
	)
	if err != nil {
		return err
	}

	start := time.Now()
	req, err := http.NewRequest(m.Method, m.URL, strings.NewReader(m.Body))
	if err != nil {
		return err
	}
	if m.HeadersJSON != "" && m.HeadersJSON != "{}" {
		var headers map[string]string
		_ = json.Unmarshal([]byte(m.HeadersJSON), &headers)
		for k, v := range headers {
			req.Header.Set(k, v)
		}
	}
	client := &http.Client{
		Timeout: time.Duration(m.IntervalSeconds) * time.Second,
	}
	resp, err := client.Do(req)
	var online bool
	var statusCode int
	var errStr string
	var bodyBytes []byte
	if err != nil {
		online = false
		errStr = err.Error()
	} else {
		defer resp.Body.Close()
		statusCode = resp.StatusCode
		online = statusCode >= m.ExpectedStatusMin && statusCode <= m.ExpectedStatusMax
		if m.Keyword != "" {
			bodyBytes, _ = io.ReadAll(resp.Body)
			if !strings.Contains(string(bodyBytes), m.Keyword) {
				online = false
			}
		}
	}
	duration := time.Since(start)

	_, _ = s.db.Exec(`INSERT INTO monitor_results(monitor_id,online,status_code,response_ms,error)
		VALUES($1,$2,$3,$4,$5)`, m.ID, online, statusCode, int(duration.Milliseconds()), nullIfEmpty(errStr))

	now := time.Now()
	_, _ = s.db.Exec(`UPDATE monitors SET last_online=$1, last_checked_at=$2 WHERE id=$3`, online, now, m.ID)

	if prev := m.LastOnline; prev != nil && *prev != online {
		notify.SendResend(s.cfg.ResendAPIKey, "monitor alert", s.alertEmailTo(), s.buildStatusChangeEmail(m, online, statusCode, errStr))
		_, _ = s.db.Exec(`INSERT INTO notifications(monitor_id,type,message) VALUES($1,$2,$3)`, m.ID, "status_change", s.buildStatusChangeEmail(m, online, statusCode, errStr))
	}

	if strings.HasPrefix(strings.ToLower(m.URL), "https") {
		s.checkSSL(&m)
	}
	return nil
}

func (s *Service) checkSSL(m *model.Monitor) {
	host := hostFromURL(m.URL)
	if host == "" {
		return
	}
	conn, err := tls.DialWithDialer(&net.Dialer{Timeout: 10 * time.Second}, "tcp", host+":443", &tls.Config{
		InsecureSkipVerify: true,
	})
	if err != nil {
		return
	}
	defer conn.Close()
	state := conn.ConnectionState()
	if len(state.PeerCertificates) == 0 {
		return
	}
	cert := state.PeerCertificates[0]
	expires := cert.NotAfter
	daysLeft := int(time.Until(expires).Hours() / 24)
	_, _ = s.db.Exec(`INSERT INTO ssl_info(monitor_id,expires_at,issuer,days_left)
		VALUES($1,$2,$3,$4)
		ON CONFLICT (monitor_id) DO UPDATE SET expires_at=EXCLUDED.expires_at, issuer=EXCLUDED.issuer, days_left=EXCLUDED.days_left`,
		m.ID, expires, cert.Issuer.CommonName, daysLeft)

	if daysLeft <= s.cfg.AlertBeforeDays {
		msg := s.buildSSLExpiryEmail(*m, daysLeft, expires)
		notify.SendResend(s.cfg.ResendAPIKey, "SSL 证书到期提醒", s.alertEmailTo(), msg)
		_, _ = s.db.Exec(`INSERT INTO notifications(monitor_id,type,message) VALUES($1,$2,$3)`, m.ID, "ssl_expiry", msg)
	}
}

func (s *Service) alertEmailTo() string {
	return "admin@example.com"
}

func (s *Service) buildStatusChangeEmail(m model.Monitor, online bool, code int, errStr string) string {
	status := "恢复在线"
	if !online {
		status = "发生异常"
	}
	return "站点「" + m.Name + "」" + status + "，状态码=" + strconvI(code) + ", 错误=" + errStr
}

func (s *Service) buildSSLExpiryEmail(m model.Monitor, daysLeft int, expires time.Time) string {
	return "站点「" + m.Name + "」SSL 证书还有 " + strconvI(daysLeft) + " 天过期（" + expires.Format(time.RFC3339) + "）"
}

func strconvI(i int) string { return strconv.Itoa(i) }

func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func hostFromURL(u string) string {
	if strings.HasPrefix(u, "https://") {
		u = strings.TrimPrefix(u, "https://")
	} else if strings.HasPrefix(u, "http://") {
		u = strings.TrimPrefix(u, "http://")
	}
	parts := strings.Split(u, "/")
	host := parts[0]
	if strings.Contains(host, ":") {
		host = strings.Split(host, ":")[0]
	}
	return host
}

func (s *Service) ListMonitors() ([]model.Monitor, error) {
	rows, err := s.db.Query(`SELECT id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,group_id,interval_seconds,last_online,last_checked_at FROM monitors ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var res []model.Monitor
	for rows.Next() {
		var m model.Monitor
		err = rows.Scan(&m.ID, &m.Name, &m.URL, &m.Method, &m.HeadersJSON, &m.Body, &m.ExpectedStatusMin, &m.ExpectedStatusMax, &m.Keyword, &m.GroupID, &m.IntervalSeconds, &m.LastOnline, &m.LastCheckedAt)
		if err != nil {
			return nil, err
		}
		res = append(res, m)
	}
	return res, nil
}
