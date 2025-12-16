package monitor

import (
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"io"
	"log"
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
	evt chan<- Update
}

func NewService(db *sql.DB, cfg config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

func (s *Service) DB() *sql.DB { return s.db }

func (s *Service) SetDB(newdb *sql.DB) { s.db = newdb }

func (s *Service) StartScheduler() {
	log.Printf("任务调度启动")
	go func() {
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month(), now.Day(), 4, 0, 0, 0, now.Location())
			if !next.After(now) {
				next = next.Add(24 * time.Hour)
			}
			time.Sleep(next.Sub(now))
			_ = s.RunSSLCheckAll()
			s.CleanupOldResults()
			log.Printf("每日任务完成：SSL检测与数据清理")
		}
	}()
	loops := map[int]struct {
		interval time.Duration
		stop     chan struct{}
	}{}
	for {
		monitors, err := s.ListMonitors()
		if err != nil {
			time.Sleep(5 * time.Second)
			continue
		}
		active := map[int]struct{}{}
		for _, m := range monitors {
			interval := time.Duration(m.IntervalSeconds) * time.Second
			if interval <= 0 {
				interval = s.cfg.DefaultCheckInterval
			}
			active[m.ID] = struct{}{}
			if lp, ok := loops[m.ID]; !ok {
				stop := make(chan struct{})
				loops[m.ID] = struct {
					interval time.Duration
					stop     chan struct{}
				}{interval: interval, stop: stop}
				go s.runLoopWithStop(m.ID, interval, stop)
			} else if lp.interval != interval {
				close(lp.stop)
				stop := make(chan struct{})
				loops[m.ID] = struct {
					interval time.Duration
					stop     chan struct{}
				}{interval: interval, stop: stop}
				go s.runLoopWithStop(m.ID, interval, stop)
			}
		}
		for id, lp := range loops {
			if _, ok := active[id]; !ok {
				close(lp.stop)
				delete(loops, id)
			}
		}
		time.Sleep(60 * time.Second)
	}
}

func (s *Service) RunSSLCheckAll() error {
	ms, err := s.ListMonitors()
	if err != nil {
		return err
	}
	for _, m := range ms {
		if strings.HasPrefix(strings.ToLower(m.URL), "https") {
			s.checkSSL(&m)
		}
	}
	return nil
}

type Update struct {
	MonitorID   int
	CheckedAt   time.Time
	Online      bool
	StatusCode  int
	ResponseMs  int
	Error       string
	EventType   string
	Message     string
	MonitorName string
}

func (s *Service) SetEventSink(ch chan<- Update) {
	s.evt = ch
}

func (s *Service) CleanupOldResults() {
	days := s.cfg.RetentionDays
	if days <= 0 {
		days = 30
	}
	_, _ = s.db.Exec(`DELETE FROM monitor_results WHERE checked_at < NOW() - ($1||' days')::interval`, days)
}

func (s *Service) runLoopWithStop(monitorID int, interval time.Duration, stop chan struct{}) {
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-t.C:
			_ = s.CheckMonitor(monitorID)
		case <-stop:
			return
		}
	}
}

func (s *Service) CheckMonitor(id int) error {
	var m model.Monitor
	err := s.db.QueryRow(`SELECT id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,interval_seconds,flap_threshold,notify_cooldown_minutes,last_online,last_checked_at
		FROM monitors WHERE id=$1`, id).Scan(
		&m.ID, &m.Name, &m.URL, &m.Method, &m.HeadersJSON, &m.Body, &m.ExpectedStatusMin, &m.ExpectedStatusMax, &m.Keyword, &m.IntervalSeconds, &m.FlapThreshold, &m.NotifyCooldownMin, &m.LastOnline, &m.LastCheckedAt,
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
	log.Printf("监控结果 name=%s online=%v code=%d 耗时=%dms 错误=%s", m.Name, online, statusCode, int(duration.Milliseconds()), errStr)

	now := time.Now()
	_, _ = s.db.Exec(`UPDATE monitors SET last_online=$1, last_checked_at=$2 WHERE id=$3`, online, now, m.ID)

	var lastReported sql.NullBool
	var onStreak int
	var offStreak int
	_ = s.db.QueryRow(`SELECT last_reported_online, online_streak, offline_streak FROM monitor_state WHERE monitor_id=$1`, m.ID).
		Scan(&lastReported, &onStreak, &offStreak)
	if online {
		onStreak++
		offStreak = 0
	} else {
		offStreak++
		onStreak = 0
	}
	_, _ = s.db.Exec(`INSERT INTO monitor_state(monitor_id,last_reported_online,online_streak,offline_streak)
		VALUES($1,$2,$3,$4)
		ON CONFLICT (monitor_id) DO UPDATE SET online_streak=EXCLUDED.online_streak, offline_streak=EXCLUDED.offline_streak`, m.ID, lastReported.Bool, onStreak, offStreak)
	// thresholds and cooldowns
	thresh := m.FlapThreshold
	if thresh <= 0 {
		thresh = s.cfg.FlapThreshold
	}
	cooldownMin := m.NotifyCooldownMin
	if cooldownMin <= 0 {
		cooldownMin = s.cfg.NotifyCooldownMinutes
	}
	stabilize := s.cfg.StabilizeCount
	if stabilize < 0 {
		stabilize = 0
	}

	shouldNotify := false
	if !lastReported.Valid {
		if stabilize <= 1 {
			_, _ = s.db.Exec(`UPDATE monitor_state SET last_reported_online=$1 WHERE monitor_id=$2`, online, m.ID)
		} else {
			if online && onStreak >= stabilize {
				_, _ = s.db.Exec(`UPDATE monitor_state SET last_reported_online=true WHERE monitor_id=$1`, m.ID)
			}
			if !online && offStreak >= stabilize {
				_, _ = s.db.Exec(`UPDATE monitor_state SET last_reported_online=false WHERE monitor_id=$1`, m.ID)
			}
		}
	} else if lastReported.Bool != online {
		if online && onStreak >= thresh {
			shouldNotify = true
			_, _ = s.db.Exec(`UPDATE monitor_state SET last_reported_online=true WHERE monitor_id=$1`, m.ID)
		}
		if !online && offStreak >= thresh {
			shouldNotify = true
			_, _ = s.db.Exec(`UPDATE monitor_state SET last_reported_online=false WHERE monitor_id=$1`, m.ID)
		}
	}
	if shouldNotify {
		// cooldown and initial recovery gating
		if online {
			// only send recovery if there was an offline notice before
			if !s.hadPrevOfflineNotice(m.ID) {
				shouldNotify = false
			}
		}
		if shouldNotify && !s.allowedToNotify(m.ID, "status_change", cooldownMin) {
			shouldNotify = false
		}
		if shouldNotify {
			notify.SendResend(s.cfg.ResendAPIKey, "monitor alert", s.alertEmailTo(), s.buildStatusChangeEmail(m, online, statusCode, errStr))
			_, _ = s.db.Exec(`INSERT INTO notifications(monitor_id,type,message) VALUES($1,$2,$3)`, m.ID, "status_change", s.buildStatusChangeEmail(m, online, statusCode, errStr))
		}
		if s.evt != nil {
			msg := s.buildStatusChangeEmail(m, online, statusCode, errStr)
			select {
			case s.evt <- Update{
				MonitorID:   m.ID,
				CheckedAt:   now,
				Online:      online,
				StatusCode:  statusCode,
				ResponseMs:  int(duration.Milliseconds()),
				Error:       errStr,
				EventType:   "status_change",
				Message:     msg,
				MonitorName: m.Name,
			}:
			default:
			}
		}
	}

	if strings.HasPrefix(strings.ToLower(m.URL), "https") {
		s.checkSSL(&m)
	}
	if s.evt != nil {
		select {
		case s.evt <- Update{
			MonitorID:   m.ID,
			CheckedAt:   now,
			Online:      online,
			StatusCode:  statusCode,
			ResponseMs:  int(duration.Milliseconds()),
			Error:       errStr,
			MonitorName: m.Name,
		}:
		default:
		}
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
		// apply cooldown for ssl notifications too
		if s.allowedToNotify(m.ID, "ssl_expiry", s.cfg.NotifyCooldownMinutes) {
			notify.SendResend(s.cfg.ResendAPIKey, "SSL 证书到期提醒", s.alertEmailTo(), msg)
			_, _ = s.db.Exec(`INSERT INTO notifications(monitor_id,type,message) VALUES($1,$2,$3)`, m.ID, "ssl_expiry", msg)
		}
		if s.evt != nil {
			select {
			case s.evt <- Update{
				MonitorID:   m.ID,
				CheckedAt:   time.Now(),
				Online:      true,
				StatusCode:  0,
				ResponseMs:  0,
				Error:       "",
				EventType:   "ssl_expiry",
				Message:     msg,
				MonitorName: m.Name,
			}:
			default:
			}
		}
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

func (s *Service) allowedToNotify(monitorID int, typ string, cooldownMinutes int) bool {
	if cooldownMinutes <= 0 {
		return true
	}
	var t sql.NullTime
	_ = s.db.QueryRow(`SELECT created_at FROM notifications WHERE monitor_id=$1 AND type=$2 ORDER BY created_at DESC LIMIT 1`,
		monitorID, typ).Scan(&t)
	if !t.Valid {
		return true
	}
	return time.Since(t.Time) >= time.Duration(cooldownMinutes)*time.Minute
}

func (s *Service) hadPrevOfflineNotice(monitorID int) bool {
	var exists bool
	_ = s.db.QueryRow(`SELECT EXISTS(
		SELECT 1 FROM notifications WHERE monitor_id=$1 AND type='status_change' AND message LIKE '%发生异常%' LIMIT 1
	)`, monitorID).Scan(&exists)
	return exists
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
