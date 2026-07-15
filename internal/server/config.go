package server

import (
	"errors"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	serverapp "vps-agent/internal/server/application"
)

type Config struct {
	Addr        string
	AuthSecret  string
	AdminUser   string
	AdminPass   string
	DataPath    string
	StoreDriver string
	DBPath      string
	PublicURL   string
	CORSOrigins []string
	OfflineWait time.Duration
	MaxNodes    int
}

func normalizeConfig(cfg Config) (Config, error) {
	if isWeakSecret(cfg.AuthSecret) {
		return Config{}, errors.New("AUTH_SECRET must not be empty or change-me")
	}
	if cfg.AdminUser == "" {
		cfg.AdminUser = "admin"
	}
	if isWeakSecret(cfg.AdminPass) {
		return Config{}, errors.New("ADMIN_PASS must not be empty or change-me")
	}
	if cfg.PublicURL != "" {
		publicURL, err := cleanPublicURL(cfg.PublicURL)
		if err != nil {
			return Config{}, err
		}
		cfg.PublicURL = publicURL
	}
	if cfg.DataPath == "" {
		cfg.DataPath = "data/server.json"
	}
	if cfg.OfflineWait == 0 {
		cfg.OfflineWait = 10 * time.Second
	}
	if cfg.MaxNodes == 0 {
		cfg.MaxNodes = 2000
	}
	if cfg.OfflineWait < time.Second {
		return Config{}, errors.New("OFFLINE_WAIT must be >= 1s")
	}
	if cfg.MaxNodes <= 0 {
		return Config{}, errors.New("MAX_NODES must be positive")
	}
	origins, err := cleanOriginList(cfg.CORSOrigins)
	if err != nil {
		return Config{}, err
	}
	cfg.CORSOrigins = origins
	return cfg, nil
}

func newStoreBackend(cfg Config) (serverapp.Store, error) {
	driver := strings.ToLower(strings.TrimSpace(cfg.StoreDriver))
	if driver == "" && cfg.DBPath != "" {
		driver = "sqlite"
	}
	if driver == "" {
		driver = "json"
	}
	switch driver {
	case "json", "file":
		return NewStore(cfg.DataPath)
	case "sqlite", "sqlite3":
		dbPath := strings.TrimSpace(cfg.DBPath)
		if dbPath == "" {
			dbPath = defaultSQLitePath(cfg.DataPath)
		}
		return NewSQLiteStore(dbPath, cfg.DataPath)
	default:
		return nil, fmt.Errorf("unsupported STORE_DRIVER %q", cfg.StoreDriver)
	}
}

func defaultSQLitePath(dataPath string) string {
	if dataPath == "" {
		return "data/server.db"
	}
	ext := filepath.Ext(dataPath)
	if ext == "" {
		return dataPath + ".db"
	}
	return strings.TrimSuffix(dataPath, ext) + ".db"
}

func isWeakSecret(value string) bool {
	value = strings.TrimSpace(value)
	return value == "" || value == "change-me"
}

func cleanPublicURL(value string) (string, error) {
	value = strings.TrimRight(strings.TrimSpace(value), "/")
	u, err := url.Parse(value)
	if err != nil || u.Host == "" || (u.Scheme != "https" && u.Scheme != "http") {
		return "", errors.New("PUBLIC_URL must be an absolute http or https URL")
	}
	if u.Scheme != "https" && !strings.HasPrefix(u.Host, "127.0.0.1") && !strings.HasPrefix(u.Host, "localhost") {
		return "", errors.New("PUBLIC_URL must use https outside localhost")
	}
	u.Path = strings.TrimRight(u.Path, "/")
	u.RawQuery = ""
	u.Fragment = ""
	return u.String(), nil
}

func cleanOriginList(values []string) ([]string, error) {
	out := make([]string, 0, len(values))
	seen := map[string]bool{}
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		if value == "*" {
			if !seen[value] {
				out = append(out, value)
				seen[value] = true
			}
			continue
		}
		origin, err := cleanOrigin(value)
		if err != nil {
			return nil, err
		}
		if !seen[origin] {
			out = append(out, origin)
			seen[origin] = true
		}
	}
	return out, nil
}

func cleanOrigin(value string) (string, error) {
	u, err := url.Parse(strings.TrimSpace(value))
	if err != nil || u.Host == "" || (u.Scheme != "https" && u.Scheme != "http") {
		return "", fmt.Errorf("CORS_ORIGINS contains invalid origin %q", value)
	}
	u.Path = ""
	u.RawQuery = ""
	u.Fragment = ""
	return strings.TrimRight(u.String(), "/"), nil
}
