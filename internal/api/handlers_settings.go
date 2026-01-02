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

	"monitor/internal/db"
)

// SettingsResponse represents app settings
type SettingsResponse struct {
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
	ShowSystemStatus     bool     `json:"show_system_status"`
	StatusMonitorID      int64    `json:"status_monitor_id"`
}

// UpdateSettingsRequest represents settings update payload
type UpdateSettingsRequest struct {
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
	ShowSystemStatus     *bool    `json:"show_system_status"`
	StatusMonitorID      *int64   `json:"status_monitor_id"`
}

// SetupRequest represents initial setup payload
type SetupRequest struct {
	DatabaseURL         string `json:"database_url"`
	Addr                string `json:"addr"`
	AdminEmail          string `json:"admin_email"`
	AdminPassword       string `json:"admin_password"`
	ResendAPIKey        string `json:"resend_api_key"`
	AlertBeforeDays     int    `json:"alert_before_days"`
	CheckIntervalSecond int    `json:"check_interval_seconds"`
}

// handleSettings handles GET/PUT /api/settings
func (s *Server) handleSettings(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.getSettings(w, r)
	case http.MethodPut:
		s.updateSettings(w, r)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) getSettings(w http.ResponseWriter, r *http.Request) {
	var (
		siteName, subtitle, tabSubtitle, notifyEvents, smtpServer, smtpUser, smtpPassword, fromEmail sql.NullString
		debounce, smtpPort, retentionDays, flapThreshold, checkInterval                              sql.NullInt64
		enable                                                                                       sql.NullBool
		toEmails                                                                                     sql.NullString
		showSystemStatus                                                                             sql.NullBool
		statusMonitorID                                                                              sql.NullInt64
	)

	_ = s.svc.DB().QueryRow(`SELECT site_name, subtitle, tab_subtitle, debounce_seconds, enable_notifications, notify_events, smtp_server, smtp_port, smtp_user, smtp_password, from_email, to_emails, retention_days, flap_threshold, check_interval_seconds, show_system_status, status_monitor_id FROM app_settings ORDER BY id DESC LIMIT 1`).
		Scan(&siteName, &subtitle, &tabSubtitle, &debounce, &enable, &notifyEvents, &smtpServer, &smtpPort, &smtpUser, &smtpPassword, &fromEmail, &toEmails, &retentionDays, &flapThreshold, &checkInterval, &showSystemStatus, &statusMonitorID)

	out := SettingsResponse{
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
		ShowSystemStatus:     ifNullBool(showSystemStatus, false),
		StatusMonitorID:      ifNullInt64(statusMonitorID, 0),
	}
	writeJSON(w, out)
}

func (s *Server) updateSettings(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	var in UpdateSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	var count int
	_ = s.svc.DB().QueryRow(`SELECT COUNT(*) FROM app_settings`).Scan(&count)

	if count == 0 {
		_, _ = s.svc.DB().Exec(`INSERT INTO app_settings(id, site_name, subtitle, tab_subtitle, debounce_seconds, enable_notifications, notify_events, smtp_server, smtp_port, smtp_user, smtp_password, from_email, to_emails, retention_days, flap_threshold, check_interval_seconds, show_system_status, status_monitor_id)
			VALUES(1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
			in.SiteName, in.Subtitle, in.TabSubtitle, in.DebounceSeconds, in.EnableNotifications, strings.Join(in.NotifyEvents, ","), in.SMTPServer, in.SMTPPort, in.SMTPUser, in.SMTPPassword, in.FromEmail, in.ToEmails, nullIfZero(in.RetentionDays), nullIfZero(in.FlapThreshold), nullIfZero(in.CheckIntervalSeconds), in.ShowSystemStatus, in.StatusMonitorID)
	} else {
		_, _ = s.svc.DB().Exec(`UPDATE app_settings SET 
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
			check_interval_seconds=COALESCE($15, check_interval_seconds),
			show_system_status=COALESCE($16, show_system_status),
			status_monitor_id=COALESCE($17, status_monitor_id)
		WHERE id=(SELECT id FROM app_settings ORDER BY id DESC LIMIT 1)`,
			in.SiteName, in.Subtitle, in.TabSubtitle, in.DebounceSeconds, in.EnableNotifications, strings.Join(in.NotifyEvents, ","), in.SMTPServer, in.SMTPPort, in.SMTPUser, in.SMTPPassword, in.FromEmail, in.ToEmails, nullIfZero(in.RetentionDays), nullIfZero(in.FlapThreshold), nullIfZero(in.CheckIntervalSeconds), in.ShowSystemStatus, in.StatusMonitorID)
	}

	s.logger.Info("设置更新成功")
	w.WriteHeader(http.StatusNoContent)
}

// handleSetupState handles GET /api/setup/state
func (s *Server) handleSetupState(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
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
	if err := s.svc.DB().QueryRow(`SELECT COUNT(*) FROM admin_users`).Scan(&count); err != nil {
		writeJSON(w, resp{Installed: false})
		return
	}
	writeJSON(w, resp{Installed: count > 0})
}

// handleSetup handles POST /api/setup
func (s *Server) handleSetup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	var in SetupRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	// Validation
	if in.DatabaseURL == "" {
		validationError(w, "数据库URL不能为空", nil)
		return
	}
	if in.AdminEmail == "" {
		validationError(w, "管理员邮箱不能为空", nil)
		return
	}
	if in.AdminPassword == "" {
		validationError(w, "管理员密码不能为空", nil)
		return
	}

	tmpdb, err := db.Open(in.DatabaseURL)
	if err != nil {
		badRequest(w, "数据库连接失败")
		return
	}

	if err := db.Migrate(tmpdb); err != nil {
		internalError(w, "数据库迁移失败")
		return
	}

	// Create admin user
	salt := make([]byte, 16)
	_, _ = rand.Read(salt)
	hashed := sha256.Sum256(append(salt, []byte(in.AdminPassword)...))
	pw := hex.EncodeToString(salt) + "$" + hex.EncodeToString(hashed[:])

	_, err = tmpdb.Exec(`INSERT INTO admin_users(email, password_hash) VALUES($1,$2)
		ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash`, in.AdminEmail, pw)
	if err != nil {
		internalError(w, "创建管理员失败")
		return
	}

	_, _ = tmpdb.Exec(`INSERT INTO app_settings(addr,database_url,resend_api_key,alert_before_days,check_interval_seconds)
		VALUES($1,$2,$3,$4,$5)`, in.Addr, in.DatabaseURL, in.ResendAPIKey, in.AlertBeforeDays, in.CheckIntervalSecond)

	// Write .env file
	env := "ADDR=" + defaultStr(in.Addr, ":8080") + "\n" +
		"DATABASE_URL=" + in.DatabaseURL + "\n" +
		"RESEND_API_KEY=" + in.ResendAPIKey + "\n" +
		"ALERT_BEFORE_DAYS=" + strconv.Itoa(defaultInt(in.AlertBeforeDays, 14)) + "\n" +
		"CHECK_INTERVAL_SECONDS=" + strconv.Itoa(defaultInt(in.CheckIntervalSecond, 60)) + "\n"
	_ = os.WriteFile(".env", []byte(env), 0600)

	prev := s.svc.DB()
	s.svc.SetDB(tmpdb)
	if prev != nil {
		_ = prev.Close()
	}

	s.logger.Info("系统初始化完成", "admin_email", in.AdminEmail)
	w.WriteHeader(http.StatusCreated)
}

// handleHealth handles GET /api/health
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	// Check database connection
	dbStatus := "healthy"
	if err := s.svc.DB().Ping(); err != nil {
		dbStatus = "unhealthy: " + err.Error()
	}

	type resp struct {
		Name     string `json:"name"`
		Version  string `json:"version"`
		Status   string `json:"status"`
		Database string `json:"database"`
	}

	status := "running"
	if dbStatus != "healthy" {
		status = "degraded"
	}

	writeJSON(w, resp{
		Name:     "Monitor Backend",
		Version:  "0.2.0",
		Status:   status,
		Database: dbStatus,
	})
}
