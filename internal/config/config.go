package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Addr                 string
	DatabaseURL          string
	ResendAPIKey         string
	AlertBeforeDays      int
	DefaultCheckInterval time.Duration
	AdminPassword        string
	RetentionDays        int
	FlapThreshold        int
}

func Load() Config {
	loadFromEnvFile()
	addr := getenvDefault("ADDR", ":8080")
	dbURL := getenvDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/monitor?sslmode=disable")
	resend := getenvDefault("RESEND_API_KEY", "")
	alertDays := getenvIntDefault("ALERT_BEFORE_DAYS", 14)
	intervalSec := getenvIntDefault("CHECK_INTERVAL_SECONDS", 60)
	adminPw := getenvDefault("ADMIN_PASSWORD", "")
	retention := getenvIntDefault("RETENTION_DAYS", 30)
	flap := getenvIntDefault("FLAP_THRESHOLD", 2)

	return Config{
		Addr:                 addr,
		DatabaseURL:          dbURL,
		ResendAPIKey:         resend,
		AlertBeforeDays:      alertDays,
		DefaultCheckInterval: time.Duration(intervalSec) * time.Second,
		AdminPassword:        adminPw,
		RetentionDays:        retention,
		FlapThreshold:        flap,
	}
}

func loadFromEnvFile() {
	b, err := os.ReadFile(".env")
	if err != nil {
		return
	}
	lines := splitLines(string(b))
	for _, ln := range lines {
		kv := parseKV(ln)
		if kv[0] == "" {
			continue
		}
		_ = os.Setenv(kv[0], kv[1])
	}
}

func splitLines(s string) []string {
	var out []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '\n' || s[i] == '\r' {
			out = append(out, s[start:i])
			if s[i] == '\r' && i+1 < len(s) && s[i+1] == '\n' {
				i++
			}
			start = i + 1
		}
	}
	if start <= len(s) {
		out = append(out, s[start:])
	}
	return out
}

func parseKV(line string) [2]string {
	i := 0
	for i < len(line) && (line[i] == ' ' || line[i] == '\t') {
		i++
	}
	if i >= len(line) || line[i] == '#' {
		return [2]string{"", ""}
	}
	keyStart := i
	for i < len(line) && line[i] != '=' {
		i++
	}
	if i >= len(line) {
		return [2]string{"", ""}
	}
	key := line[keyStart:i]
	i++
	val := line[i:]
	if len(val) >= 2 && val[0] == '"' && val[len(val)-1] == '"' {
		val = val[1 : len(val)-1]
	}
	return [2]string{trimSpace(key), trimSpace(val)}
}

func trimSpace(s string) string {
	start := 0
	for start < len(s) && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	end := len(s) - 1
	for end >= start && (s[end] == ' ' || s[end] == '\t') {
		end--
	}
	return s[start : end+1]
}

func getenvDefault(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

func getenvIntDefault(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}
