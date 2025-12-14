package main

import (
	"log"
	"monitor/internal/api"
	"monitor/internal/config"
	"monitor/internal/db"
	"monitor/internal/monitor"
)

func main() {
	cfg := config.Load()

	pool, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database open error: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(pool); err != nil {
		log.Fatalf("database migrate error: %v", err)
	}

	s := monitor.NewService(pool, cfg)
	go s.StartScheduler()

	server := api.NewServer(s, cfg)
	if err := server.Start(); err != nil {
		log.Fatalf("server start error: %v", err)
	}
}

