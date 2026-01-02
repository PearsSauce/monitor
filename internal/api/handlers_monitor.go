package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"monitor/internal/model"
)

// CreateMonitorRequest represents monitor creation payload
type CreateMonitorRequest struct {
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

// MonitorResultResponse represents a check result
type MonitorResultResponse struct {
	CheckedAt  string `json:"checked_at"`
	Online     bool   `json:"online"`
	StatusCode int    `json:"status_code"`
	ResponseMs int    `json:"response_ms"`
	Error      string `json:"error"`
}

// HistoryDayItem represents daily aggregated history
type HistoryDayItem struct {
	Day           string  `json:"day"`
	OnlineCount   int     `json:"online_count"`
	TotalCount    int     `json:"total_count"`
	AvgResponseMs float64 `json:"avg_response_ms"`
}

// HistoryItem represents a single history record
type HistoryItem struct {
	CheckedAt  string `json:"checked_at"`
	Online     bool   `json:"online"`
	StatusCode int    `json:"status_code"`
	ResponseMs int    `json:"response_ms"`
	Error      string `json:"error"`
}

// MonitorExportItem represents a monitor with its history for export
type MonitorExportItem struct {
	Name              string        `json:"name"`
	URL               string        `json:"url"`
	Method            string        `json:"method"`
	HeadersJSON       string        `json:"headers_json"`
	Body              string        `json:"body"`
	ExpectedStatusMin int           `json:"expected_status_min"`
	ExpectedStatusMax int           `json:"expected_status_max"`
	Keyword           string        `json:"keyword"`
	GroupID           *int          `json:"group_id,omitempty"`
	IntervalSeconds   int           `json:"interval_seconds"`
	History           []HistoryItem `json:"history"`
}

// ExportResponse represents the full export data
type ExportResponse struct {
	Version    string              `json:"version"`
	ExportedAt string              `json:"exported_at"`
	Monitors   []MonitorExportItem `json:"monitors"`
}

// handleMonitors handles GET/POST /api/monitors
func (s *Server) handleMonitors(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Check if export is requested
		if r.URL.Query().Get("export") == "true" {
			s.exportMonitors(w, r)
			return
		}
		s.listMonitors(w, r)
	case http.MethodPost:
		s.createMonitor(w, r)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) listMonitors(w http.ResponseWriter, r *http.Request) {
	ms, err := s.svc.ListMonitors()
	if err != nil {
		s.logger.Error("获取监控列表失败", "error", err)
		databaseError(w, err)
		return
	}
	writeJSON(w, ms)
}

func (s *Server) exportMonitors(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	// Get days parameter, default to 30
	days := 30
	if v := r.URL.Query().Get("days"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 365 {
			days = n
		}
	}

	// Get all monitors
	ms, err := s.svc.ListMonitors()
	if err != nil {
		s.logger.Error("获取监控列表失败", "error", err)
		databaseError(w, err)
		return
	}

	var exportItems []MonitorExportItem
	for _, m := range ms {
		// Get history for each monitor
		rows, err := s.svc.DB().Query(`SELECT checked_at, online, status_code, response_ms, error 
			FROM monitor_results WHERE monitor_id=$1 AND checked_at>=NOW() - ($2||' days')::interval
			ORDER BY checked_at DESC`, m.ID, days)
		if err != nil {
			s.logger.Error("获取监控历史失败", "monitor_id", m.ID, "error", err)
			continue
		}

		var history []HistoryItem
		for rows.Next() {
			var it HistoryItem
			var errStr sql.NullString
			var t time.Time
			if err := rows.Scan(&t, &it.Online, &it.StatusCode, &it.ResponseMs, &errStr); err != nil {
				continue
			}
			it.CheckedAt = t.Format(time.RFC3339)
			if errStr.Valid {
				it.Error = errStr.String
			}
			history = append(history, it)
		}
		rows.Close()

		if history == nil {
			history = []HistoryItem{}
		}

		exportItem := MonitorExportItem{
			Name:              m.Name,
			URL:               m.URL,
			Method:            m.Method,
			HeadersJSON:       m.HeadersJSON,
			Body:              m.Body,
			ExpectedStatusMin: m.ExpectedStatusMin,
			ExpectedStatusMax: m.ExpectedStatusMax,
			Keyword:           m.Keyword,
			IntervalSeconds:   m.IntervalSeconds,
			History:           history,
		}
		if m.GroupID != nil {
			exportItem.GroupID = m.GroupID
		}
		exportItems = append(exportItems, exportItem)
	}

	if exportItems == nil {
		exportItems = []MonitorExportItem{}
	}

	export := ExportResponse{
		Version:    "1.0",
		ExportedAt: time.Now().Format(time.RFC3339),
		Monitors:   exportItems,
	}

	s.logger.Info("导出监控数据", "monitors", len(exportItems), "days", days)
	writeJSON(w, export)
}

func (s *Server) createMonitor(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	var req CreateMonitorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	// Validation
	if strings.TrimSpace(req.Name) == "" {
		validationError(w, "名称不能为空", nil)
		return
	}
	if strings.TrimSpace(req.URL) == "" {
		validationError(w, "URL不能为空", nil)
		return
	}

	// Defaults
	if req.Method == "" {
		req.Method = "GET"
	}
	if req.ExpectedStatusMin == 0 && req.ExpectedStatusMax == 0 {
		req.ExpectedStatusMin = 200
		req.ExpectedStatusMax = 299
	}
	if strings.TrimSpace(req.HeadersJSON) == "" {
		req.HeadersJSON = "{}"
	} else {
		var tmp any
		if err := json.Unmarshal([]byte(req.HeadersJSON), &tmp); err != nil {
			validationError(w, "headers_json格式无效", nil)
			return
		}
	}

	id := nextID()
	_, err := s.svc.DB().Exec(`INSERT INTO monitors(id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,group_id,interval_seconds)
		VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		id, req.Name, req.URL, req.Method, req.HeadersJSON, req.Body, req.ExpectedStatusMin, req.ExpectedStatusMax, req.Keyword, req.GroupID, req.IntervalSeconds)
	if err != nil {
		s.logger.Error("创建监控失败", "error", err)
		databaseError(w, err)
		return
	}

	s.svc.StartLoop(int(id))
	go func() { _ = s.svc.CheckMonitor(int(id)) }()

	s.logger.Info("监控创建成功", "id", id, "name", req.Name)
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, map[string]int64{"id": id})
}

// handleMonitorByID handles /api/monitors/{id}/*
func (s *Server) handleMonitorByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/monitors/")
	parts := strings.Split(path, "/")
	if len(parts) == 0 || parts[0] == "" {
		notFound(w, "监控项不存在")
		return
	}

	id, err := strconv.Atoi(parts[0])
	if err != nil {
		badRequest(w, "无效的监控ID")
		return
	}

	// Route to sub-handlers
	if len(parts) > 1 {
		switch parts[1] {
		case "run":
			s.runMonitorCheck(w, r, id)
		case "latest":
			s.getLatestResult(w, r, id)
		case "history":
			s.getMonitorHistory(w, r, id)
		case "subscriptions":
			s.deleteMonitorSubscriptions(w, r, id)
		default:
			notFound(w, "未知的操作")
		}
		return
	}

	// Handle CRUD on monitor itself
	switch r.Method {
	case http.MethodGet:
		s.getMonitor(w, r, id)
	case http.MethodPut:
		s.updateMonitor(w, r, id)
	case http.MethodDelete:
		s.deleteMonitor(w, r, id)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) getMonitor(w http.ResponseWriter, r *http.Request, id int) {
	var m model.Monitor
	err := s.svc.DB().QueryRow(`SELECT id,name,url,method,headers,body,expected_status_min,expected_status_max,keyword,group_id,interval_seconds,last_online,last_checked_at FROM monitors WHERE id=$1`, id).
		Scan(&m.ID, &m.Name, &m.URL, &m.Method, &m.HeadersJSON, &m.Body, &m.ExpectedStatusMin, &m.ExpectedStatusMax, &m.Keyword, &m.GroupID, &m.IntervalSeconds, &m.LastOnline, &m.LastCheckedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			notFound(w, "监控项不存在")
		} else {
			databaseError(w, err)
		}
		return
	}
	writeJSON(w, m)
}

func (s *Server) updateMonitor(w http.ResponseWriter, r *http.Request, id int) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	var req CreateMonitorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	_, err := s.svc.DB().Exec(`UPDATE monitors SET name=$1,url=$2,method=$3,headers=$4,body=$5,expected_status_min=$6,expected_status_max=$7,keyword=$8,group_id=$9,interval_seconds=$10 WHERE id=$11`,
		req.Name, req.URL, req.Method, req.HeadersJSON, req.Body, req.ExpectedStatusMin, req.ExpectedStatusMax, req.Keyword, req.GroupID, req.IntervalSeconds, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.svc.RestartLoop(id)
	s.logger.Info("监控更新成功", "id", id)
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteMonitor(w http.ResponseWriter, r *http.Request, id int) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	_, err := s.svc.DB().Exec(`DELETE FROM monitors WHERE id=$1`, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.svc.StopLoop(id)
	s.logger.Info("监控删除成功", "id", id)
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) runMonitorCheck(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	if err := s.svc.CheckMonitor(id); err != nil {
		internalError(w, err.Error())
		return
	}

	result := s.getLatestResultData(id)
	writeJSON(w, result)
}

func (s *Server) getLatestResult(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	result := s.getLatestResultData(id)
	if result.CheckedAt == "" {
		notFound(w, "暂无检查记录")
		return
	}
	writeJSON(w, result)
}

func (s *Server) getLatestResultData(id int) MonitorResultResponse {
	var (
		t      time.Time
		on     bool
		sc     sql.NullInt64
		ms     sql.NullInt64
		errStr sql.NullString
	)
	err := s.svc.DB().QueryRow(`SELECT checked_at, online, status_code, response_ms, error FROM monitor_results WHERE monitor_id=$1 ORDER BY checked_at DESC LIMIT 1`, id).
		Scan(&t, &on, &sc, &ms, &errStr)
	if err != nil {
		return MonitorResultResponse{}
	}

	out := MonitorResultResponse{CheckedAt: t.Format(time.RFC3339), Online: on}
	if sc.Valid {
		out.StatusCode = int(sc.Int64)
	}
	if ms.Valid {
		out.ResponseMs = int(ms.Int64)
	}
	if errStr.Valid {
		out.Error = errStr.String
	}
	return out
}

func (s *Server) getMonitorHistory(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	days := 30
	if v := r.URL.Query().Get("days"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 365 {
			days = n
		}
	}

	if r.URL.Query().Get("group") == "day" {
		s.getHistoryByDay(w, id, days)
	} else {
		s.getHistoryRaw(w, id, days)
	}
}

func (s *Server) getHistoryByDay(w http.ResponseWriter, id, days int) {
	rows, err := s.svc.DB().Query(`SELECT date_trunc('day', checked_at) AS day,
		COUNT(*) FILTER (WHERE online) AS online_count,
		COUNT(*) AS total_count,
		COALESCE(AVG(NULLIF(response_ms,0)) FILTER (WHERE online), 0)
		FROM monitor_results
		WHERE monitor_id=$1 AND checked_at>=NOW() - ($2||' days')::interval
		GROUP BY day
		ORDER BY day DESC`, id, days)
	if err != nil {
		databaseError(w, err)
		return
	}
	defer rows.Close()

	var list []HistoryDayItem
	for rows.Next() {
		var it HistoryDayItem
		var t time.Time
		if err := rows.Scan(&t, &it.OnlineCount, &it.TotalCount, &it.AvgResponseMs); err != nil {
			databaseError(w, err)
			return
		}
		it.Day = t.Format("2006-01-02")
		list = append(list, it)
	}
	if list == nil {
		list = []HistoryDayItem{}
	}
	writeJSON(w, list)
}

func (s *Server) getHistoryRaw(w http.ResponseWriter, id, days int) {
	rows, err := s.svc.DB().Query(`SELECT checked_at, online, status_code, response_ms, error 
		FROM monitor_results WHERE monitor_id=$1 AND checked_at>=NOW() - ($2||' days')::interval
		ORDER BY checked_at DESC`, id, days)
	if err != nil {
		databaseError(w, err)
		return
	}
	defer rows.Close()

	var list []HistoryItem
	for rows.Next() {
		var it HistoryItem
		var errStr sql.NullString
		var t time.Time
		if err := rows.Scan(&t, &it.Online, &it.StatusCode, &it.ResponseMs, &errStr); err != nil {
			databaseError(w, err)
			return
		}
		it.CheckedAt = t.Format(time.RFC3339)
		if errStr.Valid {
			it.Error = errStr.String
		}
		list = append(list, it)
	}
	if list == nil {
		list = []HistoryItem{}
	}
	writeJSON(w, list)
}

func (s *Server) deleteMonitorSubscriptions(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodDelete {
		methodNotAllowed(w)
		return
	}
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	_, err := s.svc.DB().Exec(`DELETE FROM monitor_subscriptions WHERE monitor_id=$1`, id)
	if err != nil {
		databaseError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
