package model

import "time"

type MonitorGroup struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

type Monitor struct {
	ID                int        `json:"id"`
	Name              string     `json:"name"`
	URL               string     `json:"url"`
	Method            string     `json:"method"`
	HeadersJSON       string     `json:"headers_json"`
	Body              string     `json:"body"`
	ExpectedStatusMin int        `json:"expected_status_min"`
	ExpectedStatusMax int        `json:"expected_status_max"`
	Keyword           string     `json:"keyword"`
	GroupID           *int       `json:"group_id"`
	IntervalSeconds   int        `json:"interval_seconds"`
	LastOnline        *bool      `json:"last_online"`
	LastCheckedAt     *time.Time `json:"last_checked_at"`
}

type Result struct {
	ID         int64     `json:"id"`
	MonitorID  int       `json:"monitor_id"`
	CheckedAt  time.Time `json:"checked_at"`
	Online     bool      `json:"online"`
	StatusCode int       `json:"status_code"`
	ResponseMs int       `json:"response_ms"`
	Error      string    `json:"error"`
}

type SSLInfo struct {
	MonitorID int        `json:"monitor_id"`
	ExpiresAt *time.Time `json:"expires_at"`
	Issuer    string     `json:"issuer"`
	DaysLeft  *int       `json:"days_left"`
}

