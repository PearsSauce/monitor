package main

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"vps-agent/internal/server"
)

func main() {
	cfg := server.Config{
		Addr:        env("ADDR", ":3000"),
		AuthSecret:  os.Getenv("AUTH_SECRET"),
		AdminUser:   env("ADMIN_USER", "admin"),
		AdminPass:   os.Getenv("ADMIN_PASS"),
		DataPath:    env("DATA_PATH", "data/server.json"),
		StoreDriver: os.Getenv("STORE_DRIVER"),
		DBPath:      os.Getenv("DB_PATH"),
		PublicURL:   os.Getenv("PUBLIC_URL"),
		CORSOrigins: envList("CORS_ORIGINS"),
		OfflineWait: envDuration("OFFLINE_WAIT", 60*time.Second),
		MaxNodes:    envInt("MAX_NODES", 2000),
	}

	srv, err := server.New(cfg)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("center server listening on %s", cfg.Addr)
	log.Fatal(srv.ListenAndServe())
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func envDuration(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	if seconds, err := strconv.Atoi(value); err == nil {
		return time.Duration(seconds) * time.Second
	}
	if d, err := time.ParseDuration(value); err == nil {
		return d
	}
	return fallback
}

func envInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	n, err := strconv.Atoi(value)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}

func envList(key string) []string {
	value := os.Getenv(key)
	if value == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}
