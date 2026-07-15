package server

import (
	"database/sql"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"

	serverdomain "vps-agent/internal/server/domain"

	_ "modernc.org/sqlite"
)

type SQLiteStore struct {
	mu   sync.Mutex
	db   *sql.DB
	path string
}

func NewSQLiteStore(path, importJSONPath string) (*SQLiteStore, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return nil, errors.New("sqlite DB path is required")
	}
	if path != ":memory:" && !strings.HasPrefix(path, "file:") {
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return nil, err
		}
	}
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	s := &SQLiteStore{db: db, path: path}
	if err := s.configure(); err != nil {
		db.Close()
		return nil, err
	}
	if err := s.initSchema(); err != nil {
		db.Close()
		return nil, err
	}
	empty, err := s.isEmpty()
	if err != nil {
		db.Close()
		return nil, err
	}
	if empty {
		if err := s.importJSONIfPresent(importJSONPath); err != nil {
			db.Close()
			return nil, err
		}
	}
	if err := s.ensureDefaultSettings(); err != nil {
		db.Close()
		return nil, err
	}
	return s, nil
}

func (s *SQLiteStore) configure() error {
	pragmas := []string{
		"PRAGMA busy_timeout = 5000",
		"PRAGMA foreign_keys = ON",
		"PRAGMA journal_mode = WAL",
		"PRAGMA synchronous = NORMAL",
	}
	for _, query := range pragmas {
		if _, err := s.db.Exec(query); err != nil {
			return err
		}
	}
	return nil
}

func (s *SQLiteStore) initSchema() error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			applied_at INTEGER NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS planned_nodes (
			node_id TEXT PRIMARY KEY,
			created_at INTEGER NOT NULL,
			token_hash TEXT NOT NULL DEFAULT ''
		)`,
		`CREATE TABLE IF NOT EXISTS host_infos (
			node_id TEXT PRIMARY KEY,
			info_json TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS reports (
			node_id TEXT PRIMARY KEY,
			ts INTEGER NOT NULL,
			metrics_json TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS traffic_stats (
			node_id TEXT PRIMARY KEY,
			reset_day INTEGER NOT NULL,
			period_start INTEGER NOT NULL,
			next_reset INTEGER NOT NULL,
			last_rx_bytes TEXT NOT NULL,
			last_tx_bytes TEXT NOT NULL,
			rx_total TEXT NOT NULL,
			tx_total TEXT NOT NULL,
			updated_at INTEGER NOT NULL
		)`,
		`INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (1, strftime('%s', 'now'))`,
	}
	for _, query := range statements {
		if _, err := s.db.Exec(query); err != nil {
			return err
		}
	}
	return nil
}

func (s *SQLiteStore) isEmpty() (bool, error) {
	for _, table := range []string{"settings", "planned_nodes", "host_infos", "reports", "traffic_stats"} {
		count, err := countRows(s.db, table)
		if err != nil {
			return false, err
		}
		if count > 0 {
			return false, nil
		}
	}
	return true, nil
}

func (s *SQLiteStore) importJSONIfPresent(path string) error {
	path = strings.TrimSpace(path)
	if path == "" || path == s.path {
		return nil
	}
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return nil
	} else if err != nil {
		return err
	}
	jsonStore, err := NewStore(path)
	if err != nil {
		return err
	}
	if !jsonStoreHasData(jsonStore) {
		return nil
	}
	return s.importJSONStore(jsonStore)
}

func jsonStoreHasData(store *Store) bool {
	return len(store.Reports) > 0 ||
		len(store.Infos) > 0 ||
		len(store.Planned) > 0 ||
		len(store.Traffic) > 0 ||
		store.Settings.SiteName != "" && store.Settings.SiteName != "Monitor Party"
}

func (s *SQLiteStore) importJSONStore(store *Store) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if err := upsertSettingTx(tx, "site_name", store.SiteName()); err != nil {
		return err
	}
	for _, planned := range store.Planned {
		if err := upsertPlannedTx(tx, planned); err != nil {
			return err
		}
	}
	for _, info := range store.Infos {
		info.AuthSecret = ""
		info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
		if err := upsertInfoTx(tx, info); err != nil {
			return err
		}
	}
	for _, metrics := range store.Reports {
		if err := upsertReportTx(tx, metrics); err != nil {
			return err
		}
	}
	for nodeID, stat := range store.Traffic {
		if err := upsertTrafficTx(tx, nodeID, stat); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *SQLiteStore) ensureDefaultSettings() error {
	_, err := s.db.Exec(`INSERT OR IGNORE INTO settings(key, value) VALUES ('site_name', 'Monitor Party')`)
	return err
}
