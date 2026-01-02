package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"monitor/internal/notify"
)

// NotificationItem represents a notification record
type NotificationItem struct {
	ID          int    `json:"id"`
	MonitorID   int    `json:"monitor_id"`
	CreatedAt   string `json:"created_at"`
	Type        string `json:"type"`
	Message     string `json:"message"`
	MonitorName string `json:"monitor_name"`
}

// NotificationListResponse represents paginated notification list
type NotificationListResponse struct {
	Items []NotificationItem `json:"items"`
	Total int                `json:"total"`
}

// TestNotificationRequest represents test notification payload
type TestNotificationRequest struct {
	Type      string `json:"type"`
	MonitorID int    `json:"monitor_id"`
}

// handleNotifications handles GET /api/notifications
func (s *Server) handleNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	// Parse pagination
	page := 1
	limit := 20
	if v := r.URL.Query().Get("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 200 {
			limit = n
		}
	}
	offset := (page - 1) * limit

	// Build filter
	filterType := r.URL.Query().Get("type")
	whereClause := ""
	switch filterType {
	case "offline":
		whereClause = "WHERE n.type='status_change' AND n.message LIKE '%发生异常%'"
	case "recovery":
		whereClause = "WHERE n.type='status_change' AND n.message LIKE '%恢复在线%'"
	case "ssl_expiry":
		whereClause = "WHERE n.type='ssl_expiry'"
	}

	// Get total count
	var total int
	countQuery := "SELECT COUNT(*) FROM notifications n " + whereClause
	if err := s.svc.DB().QueryRow(countQuery).Scan(&total); err != nil {
		databaseError(w, err)
		return
	}

	// Get items
	query := `SELECT n.id, n.monitor_id, n.created_at, n.type, n.message, m.name
		FROM notifications n
		JOIN monitors m ON m.id = n.monitor_id ` +
		whereClause +
		` ORDER BY n.created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := s.svc.DB().Query(query, limit, offset)
	if err != nil {
		databaseError(w, err)
		return
	}
	defer rows.Close()

	var list []NotificationItem
	for rows.Next() {
		var it NotificationItem
		var t time.Time
		if err := rows.Scan(&it.ID, &it.MonitorID, &t, &it.Type, &it.Message, &it.MonitorName); err != nil {
			databaseError(w, err)
			return
		}
		it.CreatedAt = t.Format(time.RFC3339)
		list = append(list, it)
	}

	if list == nil {
		list = []NotificationItem{}
	}

	writeJSON(w, NotificationListResponse{
		Items: list,
		Total: total,
	})
}

// handleNotificationByID handles DELETE /api/notifications/{id}
func (s *Server) handleNotificationByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/notifications/")
	id, err := strconv.Atoi(path)
	if err != nil || id <= 0 {
		notFound(w, "通知不存在")
		return
	}

	if r.Method != http.MethodDelete {
		methodNotAllowed(w)
		return
	}

	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	_, err = s.svc.DB().Exec(`DELETE FROM notifications WHERE id=$1`, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// handleNotificationsTest handles POST /api/notifications/test
func (s *Server) handleNotificationsTest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	var in TestNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	// Validation
	if in.MonitorID <= 0 {
		validationError(w, "监控ID无效", nil)
		return
	}
	if in.Type != "online" && in.Type != "offline" && in.Type != "ssl_expiry" {
		validationError(w, "通知类型无效，必须是 online、offline 或 ssl_expiry", nil)
		return
	}

	// Get monitor info
	var name, url string
	err := s.svc.DB().QueryRow(`SELECT COALESCE(name,''), COALESCE(url,'') FROM monitors WHERE id=$1`, in.MonitorID).Scan(&name, &url)
	if err != nil {
		notFound(w, "监控项不存在")
		return
	}

	// Get notification settings
	var enable sql.NullBool
	var notifyEvents sql.NullString
	var smtpServer, smtpUser, smtpPassword, fromEmail, toEmails sql.NullString
	var smtpPort sql.NullInt64

	_ = s.svc.DB().QueryRow(`SELECT enable_notifications, notify_events, smtp_server, smtp_port, smtp_user, smtp_password, from_email, to_emails FROM app_settings ORDER BY id DESC LIMIT 1`).
		Scan(&enable, &notifyEvents, &smtpServer, &smtpPort, &smtpUser, &smtpPassword, &fromEmail, &toEmails)

	// Determine notification type and message
	var insertType, msg string
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

	// Insert notification record
	_, err = s.svc.DB().Exec(`INSERT INTO notifications(monitor_id,type,message) VALUES($1,$2,$3)`, in.MonitorID, insertType, msg)
	if err != nil {
		databaseError(w, err)
		return
	}

	// Check if notifications are enabled
	enabled := ifNullBool(enable, true)
	if !enabled {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Check if this event type is enabled
	events := ifNullCSV(notifyEvents, []string{"online", "offline", "ssl_expiry"})
	want := false
	for _, e := range events {
		if strings.TrimSpace(e) == in.Type {
			want = true
			break
		}
	}

	if !want {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Get recipients
	recips := s.getRecipients(toEmails)

	if len(recips) > 0 {
		var siteName sql.NullString
		_ = s.svc.DB().QueryRow(`SELECT site_name FROM app_settings ORDER BY id DESC LIMIT 1`).Scan(&siteName)

		subject := notify.SubjectTest(in.Type, name, ifNullStr(siteName, "服务监控系统"))
		html := notify.BodyTest(ifNullStr(siteName, "服务监控系统"), name, url, in.Type, time.Now().Format(time.RFC3339))

		host := ifNullStr(smtpServer, "")
		user := ifNullStr(smtpUser, "")
		pass := ifNullStr(smtpPassword, "")
		port := ifNullInt(smtpPort, 0)
		from := ifNullStr(fromEmail, "")

		if strings.TrimSpace(host) == "" || port <= 0 || strings.TrimSpace(user) == "" || strings.TrimSpace(pass) == "" || strings.TrimSpace(from) == "" {
			smtpError(w, "SMTP配置不完整")
			return
		}

		for _, to := range recips {
			if err := notify.SendSMTP(host, port, user, pass, from, to, subject, html); err != nil {
				s.logger.Error("SMTP发送失败", "error", err, "to", to)
				smtpError(w, "SMTP发送失败: "+err.Error())
				return
			}
			s.logger.Info("测试通知发送成功", "to", to, "type", in.Type)
		}
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) getRecipients(toEmails sql.NullString) []string {
	var recips []string

	if toEmails.Valid && strings.TrimSpace(toEmails.String) != "" {
		for _, p := range strings.Split(toEmails.String, ",") {
			p = strings.TrimSpace(p)
			if p != "" {
				recips = append(recips, p)
			}
		}
	} else {
		var to string
		_ = s.svc.DB().QueryRow(`SELECT email FROM admin_users ORDER BY id LIMIT 1`).Scan(&to)
		if to != "" {
			recips = append(recips, to)
		}
	}

	return recips
}
