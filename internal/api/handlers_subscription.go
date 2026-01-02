package api

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"monitor/internal/notify"
)

// SubscriptionItem represents a subscription record
type SubscriptionItem struct {
	ID           int64  `json:"id"`
	MonitorID    int    `json:"monitor_id"`
	MonitorName  string `json:"monitor_name"`
	Email        string `json:"email"`
	NotifyEvents string `json:"notify_events"`
	Verified     bool   `json:"verified"`
	CreatedAt    string `json:"created_at"`
}

// PublicSubscribeRequest represents public subscription request
type PublicSubscribeRequest struct {
	MonitorID    int      `json:"monitor_id"`
	Email        string   `json:"email"`
	NotifyEvents []string `json:"notify_events"`
}

// handlePublicSubscribe handles POST /api/public/subscribe
func (s *Server) handlePublicSubscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	var in PublicSubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	// Validation
	if in.MonitorID <= 0 {
		validationError(w, "监控ID无效", nil)
		return
	}
	if strings.TrimSpace(in.Email) == "" {
		validationError(w, "邮箱不能为空", nil)
		return
	}
	if !strings.Contains(in.Email, "@") {
		validationError(w, "邮箱格式无效", nil)
		return
	}
	if len(in.NotifyEvents) == 0 {
		validationError(w, "请选择至少一个通知事件", nil)
		return
	}

	// Get monitor info
	var name, url string
	err := s.svc.DB().QueryRow(`SELECT COALESCE(name,''), COALESCE(url,'') FROM monitors WHERE id=$1`, in.MonitorID).Scan(&name, &url)
	if err != nil {
		notFound(w, "监控项不存在")
		return
	}

	// Get SMTP settings
	smtpConfig := s.getSMTPConfig()
	if !smtpConfig.isValid() {
		smtpError(w, "SMTP未配置")
		return
	}

	// Generate verification token
	token := hex.EncodeToString(sha256.New().Sum([]byte(strconv.Itoa(in.MonitorID) + "|" + in.Email + "|" + strconv.FormatInt(time.Now().UnixNano(), 10))))
	expires := time.Now().Add(24 * time.Hour)
	ev := strings.Join(in.NotifyEvents, ",")

	// Delete existing unverified subscription
	_, _ = s.svc.DB().Exec(`DELETE FROM monitor_subscriptions WHERE monitor_id=$1 AND email=$2`, in.MonitorID, in.Email)

	// Create new subscription
	id := nextID()
	_, err = s.svc.DB().Exec(`INSERT INTO monitor_subscriptions(id, monitor_id, email, notify_events, verified, verify_token, verify_expires) VALUES($1,$2,$3,$4,false,$5,$6)`,
		id, in.MonitorID, in.Email, ev, token, expires)
	if err != nil {
		databaseError(w, err)
		return
	}

	// Send verification email
	proto := "http"
	if strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		proto = "https"
	}
	verifyURL := proto + "://" + r.Host + "/api/subscriptions/verify?token=" + token
	subject := "订阅验证 · " + name + " ｜ " + smtpConfig.siteName
	html := notify.BodySubscriptionVerify(smtpConfig.siteName, name, verifyURL)

	go notify.SendSMTP(smtpConfig.host, smtpConfig.port, smtpConfig.user, smtpConfig.pass, smtpConfig.from, in.Email, subject, html)

	s.logger.Info("订阅创建成功", "monitor_id", in.MonitorID, "email", in.Email)
	w.WriteHeader(http.StatusCreated)
}

// handleSubscriptionVerify handles GET /api/subscriptions/verify
func (s *Server) handleSubscriptionVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	token := r.URL.Query().Get("token")
	if strings.TrimSpace(token) == "" {
		badRequest(w, "缺少验证令牌")
		return
	}

	var id int64
	var expires time.Time
	err := s.svc.DB().QueryRow(`SELECT id, verify_expires FROM monitor_subscriptions WHERE verify_token=$1`, token).Scan(&id, &expires)
	if err != nil {
		badRequest(w, "无效的验证令牌")
		return
	}

	if time.Now().After(expires) {
		badRequest(w, "验证令牌已过期")
		return
	}

	_, err = s.svc.DB().Exec(`UPDATE monitor_subscriptions SET verified=true, verify_token=NULL, verify_expires=NULL WHERE id=$1`, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	// Return success page
	var siteName sql.NullString
	_ = s.svc.DB().QueryRow(`SELECT site_name FROM app_settings ORDER BY id DESC LIMIT 1`).Scan(&siteName)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write([]byte(notify.PageSubscriptionVerifySuccess(ifNullStr(siteName, "服务监控系统"))))
}

// handleSubscriptions handles GET/POST /api/subscriptions
func (s *Server) handleSubscriptions(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	switch r.Method {
	case http.MethodGet:
		s.listSubscriptions(w, r)
	case http.MethodPost:
		s.createSubscription(w, r)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) listSubscriptions(w http.ResponseWriter, r *http.Request) {
	midStr := r.URL.Query().Get("monitor_id")

	var list []SubscriptionItem
	var rows *sql.Rows
	var err error

	if strings.TrimSpace(midStr) == "" {
		rows, err = s.svc.DB().Query(`SELECT s.id, s.monitor_id, m.name, s.email, s.notify_events, s.verified, s.created_at 
			FROM monitor_subscriptions s 
			JOIN monitors m ON m.id=s.monitor_id
			ORDER BY s.created_at DESC`)
	} else {
		mid, parseErr := strconv.Atoi(midStr)
		if parseErr != nil || mid <= 0 {
			badRequest(w, "无效的监控ID")
			return
		}
		rows, err = s.svc.DB().Query(`SELECT s.id, s.monitor_id, m.name, s.email, s.notify_events, s.verified, s.created_at 
			FROM monitor_subscriptions s 
			JOIN monitors m ON m.id=s.monitor_id
			WHERE s.monitor_id=$1
			ORDER BY s.created_at DESC`, mid)
	}

	if err != nil {
		databaseError(w, err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var it SubscriptionItem
		var created time.Time
		if err := rows.Scan(&it.ID, &it.MonitorID, &it.MonitorName, &it.Email, &it.NotifyEvents, &it.Verified, &created); err != nil {
			databaseError(w, err)
			return
		}
		it.CreatedAt = created.Format(time.RFC3339)
		list = append(list, it)
	}

	if list == nil {
		list = []SubscriptionItem{}
	}
	writeJSON(w, list)
}

func (s *Server) createSubscription(w http.ResponseWriter, r *http.Request) {
	var in struct {
		MonitorID    int      `json:"monitor_id"`
		Email        string   `json:"email"`
		NotifyEvents []string `json:"notify_events"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	// Validation
	if in.MonitorID <= 0 {
		validationError(w, "监控ID无效", nil)
		return
	}
	if strings.TrimSpace(in.Email) == "" || !strings.Contains(in.Email, "@") {
		validationError(w, "邮箱格式无效", nil)
		return
	}
	if len(in.NotifyEvents) == 0 {
		validationError(w, "请选择至少一个通知事件", nil)
		return
	}

	ev := strings.Join(in.NotifyEvents, ",")
	id := nextID()
	_, err := s.svc.DB().Exec(`INSERT INTO monitor_subscriptions(id, monitor_id, email, notify_events, verified) VALUES($1, $2, $3, $4, true)`, id, in.MonitorID, in.Email, ev)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.logger.Info("管理员创建订阅", "monitor_id", in.MonitorID, "email", in.Email)
	w.WriteHeader(http.StatusCreated)
}

// handleSubscriptionByID handles DELETE /api/subscriptions/{id}
func (s *Server) handleSubscriptionByID(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	idStr := strings.TrimPrefix(r.URL.Path, "/api/subscriptions/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		badRequest(w, "无效的订阅ID")
		return
	}

	if r.Method != http.MethodDelete {
		methodNotAllowed(w)
		return
	}

	_, err = s.svc.DB().Exec(`DELETE FROM monitor_subscriptions WHERE id=$1`, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.logger.Info("订阅删除成功", "id", id)
	w.WriteHeader(http.StatusNoContent)
}

// smtpConfig holds SMTP configuration
type smtpConfig struct {
	host     string
	port     int
	user     string
	pass     string
	from     string
	siteName string
}

func (c *smtpConfig) isValid() bool {
	return strings.TrimSpace(c.host) != "" &&
		c.port > 0 &&
		strings.TrimSpace(c.user) != "" &&
		strings.TrimSpace(c.pass) != "" &&
		strings.TrimSpace(c.from) != ""
}

func (s *Server) getSMTPConfig() smtpConfig {
	var smtpServer, smtpUser, smtpPassword, fromEmail, siteName sql.NullString
	var smtpPort sql.NullInt64

	_ = s.svc.DB().QueryRow(`SELECT smtp_server, smtp_port, smtp_user, smtp_password, from_email, site_name FROM app_settings ORDER BY id DESC LIMIT 1`).
		Scan(&smtpServer, &smtpPort, &smtpUser, &smtpPassword, &fromEmail, &siteName)

	return smtpConfig{
		host:     ifNullStr(smtpServer, ""),
		port:     ifNullInt(smtpPort, 0),
		user:     ifNullStr(smtpUser, ""),
		pass:     ifNullStr(smtpPassword, ""),
		from:     ifNullStr(fromEmail, ""),
		siteName: ifNullStr(siteName, "服务监控系统"),
	}
}
