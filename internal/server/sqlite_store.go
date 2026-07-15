package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"vps-agent/internal/agent"
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

func (s *SQLiteStore) SiteName() string {
	return s.GetSettings().SiteName
}

func (s *SQLiteStore) GetSettings() Settings {
	var siteName string
	err := s.db.QueryRow(`SELECT value FROM settings WHERE key = 'site_name'`).Scan(&siteName)
	if errors.Is(err, sql.ErrNoRows) || siteName == "" {
		return Settings{SiteName: "Monitor Party"}
	}
	if err != nil {
		log.Printf("sqlite site name read failed: %v", err)
		return Settings{SiteName: "Monitor Party"}
	}
	return Settings{SiteName: siteName}
}

func (s *SQLiteStore) UpdateSettings(settings Settings) error {
	if settings.SiteName == "" {
		settings.SiteName = "Monitor Party"
	}
	_, err := s.db.Exec(`INSERT OR REPLACE INTO settings(key, value) VALUES ('site_name', ?)`, settings.SiteName)
	return err
}

func (s *SQLiteStore) UpsertReport(metrics agent.Metrics, maxNodes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	exists, err := reportExistsTx(tx, metrics.NodeID)
	if err != nil {
		return err
	}
	if !exists {
		count, err := countRowsTx(tx, "reports")
		if err != nil {
			return err
		}
		if count >= maxNodes {
			return fmt.Errorf("max nodes reached")
		}
	}
	if err := upsertReportTx(tx, metrics); err != nil {
		return err
	}
	if err := insertPlannedIfMissingTx(tx, metrics.NodeID, time.Now().Unix()); err != nil {
		return err
	}
	if err := updateTrafficTx(tx, metrics, time.Now()); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *SQLiteStore) AddPlannedNode(nodeID string, maxNodes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	exists, err := plannedExistsTx(tx, nodeID)
	if err != nil {
		return err
	}
	if !exists {
		count, err := countRowsTx(tx, "planned_nodes")
		if err != nil {
			return err
		}
		if count >= maxNodes {
			return fmt.Errorf("max nodes reached")
		}
	}
	if err := upsertPlannedTx(tx, PlannedNode{NodeID: nodeID, CreatedAt: time.Now().Unix()}); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *SQLiteStore) SetNodeToken(nodeID, tokenHash string, maxNodes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	exists, err := plannedExistsTx(tx, nodeID)
	if err != nil {
		return err
	}
	if !exists {
		count, err := countRowsTx(tx, "planned_nodes")
		if err != nil {
			return err
		}
		if count >= maxNodes {
			return fmt.Errorf("max nodes reached")
		}
	}
	if _, err := tx.Exec(`
		INSERT INTO planned_nodes(node_id, created_at, token_hash)
		VALUES (?, ?, ?)
		ON CONFLICT(node_id) DO UPDATE SET token_hash = excluded.token_hash
	`, nodeID, time.Now().Unix(), tokenHash); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *SQLiteStore) ValidNodeToken(nodeID, tokenHash string) bool {
	var stored string
	err := s.db.QueryRow(`SELECT token_hash FROM planned_nodes WHERE node_id = ?`, nodeID).Scan(&stored)
	if errors.Is(err, sql.ErrNoRows) || stored == "" || tokenHash == "" {
		return false
	}
	if err != nil {
		log.Printf("sqlite token read failed: %v", err)
		return false
	}
	return constantEqual(stored, tokenHash)
}

func (s *SQLiteStore) UpsertInfo(info HostInfo) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	info.AuthSecret = ""
	info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
	if err := upsertInfoTx(tx, info); err != nil {
		return err
	}
	if err := syncTrafficResetDayTx(tx, info.Name, info.TrafficResetDay, time.Now()); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *SQLiteStore) Delete(name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for _, query := range []string{
		`DELETE FROM reports WHERE node_id = ?`,
		`DELETE FROM planned_nodes WHERE node_id = ?`,
		`DELETE FROM host_infos WHERE node_id = ?`,
		`DELETE FROM traffic_stats WHERE node_id = ?`,
	} {
		if _, err := tx.Exec(query, name); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *SQLiteStore) InfoList() []HostInfo {
	infos, err := s.loadInfos()
	if err != nil {
		log.Printf("sqlite info list failed: %v", err)
		return nil
	}
	out := make([]HostInfo, 0, len(infos))
	for _, info := range infos {
		out = append(out, info)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}

func (s *SQLiteStore) AkileHosts() []AkileHost {
	reports, err := s.loadReports()
	if err != nil {
		log.Printf("sqlite reports read failed: %v", err)
		return nil
	}
	planned, err := s.loadPlanned()
	if err != nil {
		log.Printf("sqlite planned read failed: %v", err)
		return nil
	}
	traffic, err := s.loadTraffic()
	if err != nil {
		log.Printf("sqlite traffic read failed: %v", err)
		return nil
	}
	out := make([]AkileHost, 0, len(planned)+len(reports))
	for _, metrics := range reports {
		out = append(out, toAkileHost(metrics, traffic[metrics.NodeID]))
	}
	for name := range planned {
		if _, ok := reports[name]; ok {
			continue
		}
		out = append(out, offlineAkileHost(name))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Host.Name < out[j].Host.Name })
	return out
}

func (s *SQLiteStore) AdminNodes(offlineWait time.Duration) []AdminNode {
	planned, err := s.loadPlanned()
	if err != nil {
		log.Printf("sqlite planned read failed: %v", err)
		return nil
	}
	reports, err := s.loadReports()
	if err != nil {
		log.Printf("sqlite reports read failed: %v", err)
		return nil
	}
	infos, err := s.loadInfos()
	if err != nil {
		log.Printf("sqlite infos read failed: %v", err)
		return nil
	}
	now := time.Now().Unix()
	threshold := int64(offlineWait.Seconds())
	seen := map[string]bool{}
	out := make([]AdminNode, 0, len(planned)+len(reports))
	for name, plannedNode := range planned {
		report, hasReport := reports[name]
		lastSeen := int64(0)
		online := false
		if hasReport {
			lastSeen = report.Timestamp
			online = report.Timestamp > 0 && now-report.Timestamp <= threshold
		}
		out = append(out, AdminNode{NodeID: name, Online: online, LastSeen: lastSeen, CreatedAt: plannedNode.CreatedAt, Info: infos[name]})
		seen[name] = true
	}
	for name, report := range reports {
		if seen[name] {
			continue
		}
		online := report.Timestamp > 0 && now-report.Timestamp <= threshold
		out = append(out, AdminNode{NodeID: name, Online: online, LastSeen: report.Timestamp, Info: infos[name]})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].NodeID < out[j].NodeID })
	return out
}

func (s *SQLiteStore) ExportNodes() NodeBackup {
	planned, err := s.loadPlanned()
	if err != nil {
		log.Printf("sqlite planned export failed: %v", err)
		return NodeBackup{Version: 1, ExportedAt: time.Now().Unix()}
	}
	infos, err := s.loadInfos()
	if err != nil {
		log.Printf("sqlite infos export failed: %v", err)
		return NodeBackup{Version: 1, ExportedAt: time.Now().Unix()}
	}
	reports, err := s.loadReports()
	if err != nil {
		log.Printf("sqlite reports export failed: %v", err)
		return NodeBackup{Version: 1, ExportedAt: time.Now().Unix()}
	}
	names := map[string]bool{}
	for name := range planned {
		names[name] = true
	}
	for name := range infos {
		names[name] = true
	}
	for name := range reports {
		names[name] = true
	}
	out := NodeBackup{Version: 1, ExportedAt: time.Now().Unix(), Nodes: make([]NodeBackupRecord, 0, len(names))}
	for name := range names {
		info := infos[name]
		info.AuthSecret = ""
		info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
		out.Nodes = append(out.Nodes, NodeBackupRecord{NodeID: name, CreatedAt: planned[name].CreatedAt, TokenHash: planned[name].TokenHash, Info: info})
	}
	sort.Slice(out.Nodes, func(i, j int) bool { return out.Nodes[i].NodeID < out.Nodes[j].NodeID })
	return out
}

func (s *SQLiteStore) ImportNodes(backup NodeBackup, maxNodes int) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	tx, err := s.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()
	if backup.Version == 0 {
		backup.Version = 1
	}
	if backup.Version != 1 {
		return 0, fmt.Errorf("unsupported backup version")
	}
	imported := 0
	now := time.Now().Unix()
	plannedCount, err := countRowsTx(tx, "planned_nodes")
	if err != nil {
		return 0, err
	}
	for _, record := range backup.Nodes {
		nodeID := strings.TrimSpace(record.NodeID)
		if nodeID == "" && record.Info.Name != "" {
			nodeID = strings.TrimSpace(record.Info.Name)
		}
		if !validNodeID(nodeID) {
			return imported, fmt.Errorf("invalid node_id: %s", nodeID)
		}
		planned, exists, err := getPlannedTx(tx, nodeID)
		if err != nil {
			return imported, err
		}
		if !exists {
			if plannedCount >= maxNodes {
				return imported, fmt.Errorf("max nodes reached")
			}
			plannedCount++
		}
		planned.NodeID = nodeID
		if record.CreatedAt > 0 {
			planned.CreatedAt = record.CreatedAt
		} else if planned.CreatedAt == 0 {
			planned.CreatedAt = now
		}
		if record.TokenHash != "" {
			planned.TokenHash = strings.TrimSpace(record.TokenHash)
		}
		if err := upsertPlannedTx(tx, planned); err != nil {
			return imported, err
		}
		info := record.Info
		info.Name = nodeID
		info.AuthSecret = ""
		info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
		if err := upsertInfoTx(tx, info); err != nil {
			return imported, err
		}
		if err := syncTrafficResetDayTx(tx, nodeID, info.TrafficResetDay, time.Now()); err != nil {
			return imported, err
		}
		imported++
	}
	if err := tx.Commit(); err != nil {
		return imported, err
	}
	return imported, nil
}

func (s *SQLiteStore) loadPlanned() (map[string]PlannedNode, error) {
	rows, err := s.db.Query(`SELECT node_id, created_at, token_hash FROM planned_nodes`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]PlannedNode{}
	for rows.Next() {
		var planned PlannedNode
		if err := rows.Scan(&planned.NodeID, &planned.CreatedAt, &planned.TokenHash); err != nil {
			return nil, err
		}
		out[planned.NodeID] = planned
	}
	return out, rows.Err()
}

func (s *SQLiteStore) loadInfos() (map[string]HostInfo, error) {
	rows, err := s.db.Query(`SELECT node_id, info_json FROM host_infos`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]HostInfo{}
	for rows.Next() {
		var nodeID, payload string
		if err := rows.Scan(&nodeID, &payload); err != nil {
			return nil, err
		}
		var info HostInfo
		if err := json.Unmarshal([]byte(payload), &info); err != nil {
			return nil, err
		}
		info.Name = nodeID
		info.AuthSecret = ""
		info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
		out[nodeID] = info
	}
	return out, rows.Err()
}

func (s *SQLiteStore) loadReports() (map[string]agent.Metrics, error) {
	rows, err := s.db.Query(`SELECT node_id, metrics_json FROM reports`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]agent.Metrics{}
	for rows.Next() {
		var nodeID, payload string
		if err := rows.Scan(&nodeID, &payload); err != nil {
			return nil, err
		}
		var metrics agent.Metrics
		if err := json.Unmarshal([]byte(payload), &metrics); err != nil {
			return nil, err
		}
		metrics.NodeID = nodeID
		out[nodeID] = metrics
	}
	return out, rows.Err()
}

func (s *SQLiteStore) loadTraffic() (map[string]TrafficStat, error) {
	rows, err := s.db.Query(`SELECT node_id, reset_day, period_start, next_reset, last_rx_bytes, last_tx_bytes, rx_total, tx_total, updated_at FROM traffic_stats`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]TrafficStat{}
	for rows.Next() {
		var nodeID string
		var stat TrafficStat
		var lastRx, lastTx, rxTotal, txTotal string
		if err := rows.Scan(&nodeID, &stat.ResetDay, &stat.PeriodStart, &stat.NextReset, &lastRx, &lastTx, &rxTotal, &txTotal, &stat.UpdatedAt); err != nil {
			return nil, err
		}
		var err error
		if stat.LastRxBytes, err = parseUintText(lastRx); err != nil {
			return nil, err
		}
		if stat.LastTxBytes, err = parseUintText(lastTx); err != nil {
			return nil, err
		}
		if stat.RxTotal, err = parseUintText(rxTotal); err != nil {
			return nil, err
		}
		if stat.TxTotal, err = parseUintText(txTotal); err != nil {
			return nil, err
		}
		out[nodeID] = stat
	}
	return out, rows.Err()
}

func upsertSettingTx(tx *sql.Tx, key, value string) error {
	_, err := tx.Exec(`INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)`, key, value)
	return err
}

func upsertPlannedTx(tx *sql.Tx, planned PlannedNode) error {
	_, err := tx.Exec(`INSERT OR REPLACE INTO planned_nodes(node_id, created_at, token_hash) VALUES (?, ?, ?)`, planned.NodeID, planned.CreatedAt, planned.TokenHash)
	return err
}

func insertPlannedIfMissingTx(tx *sql.Tx, nodeID string, createdAt int64) error {
	_, err := tx.Exec(`INSERT OR IGNORE INTO planned_nodes(node_id, created_at, token_hash) VALUES (?, ?, '')`, nodeID, createdAt)
	return err
}

func getPlannedTx(tx *sql.Tx, nodeID string) (PlannedNode, bool, error) {
	var planned PlannedNode
	err := tx.QueryRow(`SELECT node_id, created_at, token_hash FROM planned_nodes WHERE node_id = ?`, nodeID).Scan(&planned.NodeID, &planned.CreatedAt, &planned.TokenHash)
	if errors.Is(err, sql.ErrNoRows) {
		return PlannedNode{}, false, nil
	}
	if err != nil {
		return PlannedNode{}, false, err
	}
	return planned, true, nil
}

func plannedExistsTx(tx *sql.Tx, nodeID string) (bool, error) {
	_, exists, err := getPlannedTx(tx, nodeID)
	return exists, err
}

func upsertInfoTx(tx *sql.Tx, info HostInfo) error {
	payload, err := json.Marshal(info)
	if err != nil {
		return err
	}
	_, err = tx.Exec(`INSERT OR REPLACE INTO host_infos(node_id, info_json) VALUES (?, ?)`, info.Name, string(payload))
	return err
}

func upsertReportTx(tx *sql.Tx, metrics agent.Metrics) error {
	payload, err := json.Marshal(metrics)
	if err != nil {
		return err
	}
	_, err = tx.Exec(`INSERT OR REPLACE INTO reports(node_id, ts, metrics_json) VALUES (?, ?, ?)`, metrics.NodeID, metrics.Timestamp, string(payload))
	return err
}

func reportExistsTx(tx *sql.Tx, nodeID string) (bool, error) {
	var exists int
	err := tx.QueryRow(`SELECT 1 FROM reports WHERE node_id = ?`, nodeID).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

func updateTrafficTx(tx *sql.Tx, metrics agent.Metrics, now time.Time) error {
	resetDay, err := trafficResetDayTx(tx, metrics.NodeID)
	if err != nil {
		return err
	}
	stat, exists, err := getTrafficTx(tx, metrics.NodeID)
	if err != nil {
		return err
	}
	if !exists || stat.ResetDay == 0 {
		start, next := serverdomain.TrafficPeriod(now, resetDay)
		return upsertTrafficTx(tx, metrics.NodeID, TrafficStat{ResetDay: resetDay, PeriodStart: start.Unix(), NextReset: next.Unix(), LastRxBytes: metrics.Network.RxBytes, LastTxBytes: metrics.Network.TxBytes, UpdatedAt: now.Unix()})
	}
	if stat.ResetDay != resetDay {
		stat.ResetDay = resetDay
		stat.NextReset = serverdomain.NextTrafficReset(now, resetDay).Unix()
	}
	if stat.NextReset == 0 || now.Unix() >= stat.NextReset {
		start, next := serverdomain.TrafficPeriod(now, resetDay)
		stat.PeriodStart = start.Unix()
		stat.NextReset = next.Unix()
		stat.RxTotal = 0
		stat.TxTotal = 0
		stat.LastRxBytes = metrics.Network.RxBytes
		stat.LastTxBytes = metrics.Network.TxBytes
		stat.UpdatedAt = now.Unix()
		return upsertTrafficTx(tx, metrics.NodeID, stat)
	}
	if metrics.Network.RxBytes >= stat.LastRxBytes {
		stat.RxTotal += metrics.Network.RxBytes - stat.LastRxBytes
	}
	if metrics.Network.TxBytes >= stat.LastTxBytes {
		stat.TxTotal += metrics.Network.TxBytes - stat.LastTxBytes
	}
	stat.LastRxBytes = metrics.Network.RxBytes
	stat.LastTxBytes = metrics.Network.TxBytes
	stat.UpdatedAt = now.Unix()
	return upsertTrafficTx(tx, metrics.NodeID, stat)
}

func syncTrafficResetDayTx(tx *sql.Tx, nodeID string, resetDay int, now time.Time) error {
	resetDay = serverdomain.NormalizeTrafficResetDay(resetDay)
	stat, exists, err := getTrafficTx(tx, nodeID)
	if err != nil {
		return err
	}
	if exists && stat.ResetDay == resetDay {
		return nil
	}
	stat.ResetDay = resetDay
	stat.NextReset = serverdomain.NextTrafficReset(now, resetDay).Unix()
	if stat.PeriodStart == 0 {
		start, next := serverdomain.TrafficPeriod(now, resetDay)
		stat.PeriodStart = start.Unix()
		stat.NextReset = next.Unix()
	}
	return upsertTrafficTx(tx, nodeID, stat)
}

func trafficResetDayTx(tx *sql.Tx, nodeID string) (int, error) {
	var payload string
	err := tx.QueryRow(`SELECT info_json FROM host_infos WHERE node_id = ?`, nodeID).Scan(&payload)
	if errors.Is(err, sql.ErrNoRows) {
		return 1, nil
	}
	if err != nil {
		return 1, err
	}
	var info HostInfo
	if err := json.Unmarshal([]byte(payload), &info); err != nil {
		return 1, err
	}
	return serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay), nil
}

func getTrafficTx(tx *sql.Tx, nodeID string) (TrafficStat, bool, error) {
	var stat TrafficStat
	var lastRx, lastTx, rxTotal, txTotal string
	err := tx.QueryRow(`SELECT reset_day, period_start, next_reset, last_rx_bytes, last_tx_bytes, rx_total, tx_total, updated_at FROM traffic_stats WHERE node_id = ?`, nodeID).Scan(&stat.ResetDay, &stat.PeriodStart, &stat.NextReset, &lastRx, &lastTx, &rxTotal, &txTotal, &stat.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return TrafficStat{}, false, nil
	}
	if err != nil {
		return TrafficStat{}, false, err
	}
	var parseErr error
	if stat.LastRxBytes, parseErr = parseUintText(lastRx); parseErr != nil {
		return TrafficStat{}, false, parseErr
	}
	if stat.LastTxBytes, parseErr = parseUintText(lastTx); parseErr != nil {
		return TrafficStat{}, false, parseErr
	}
	if stat.RxTotal, parseErr = parseUintText(rxTotal); parseErr != nil {
		return TrafficStat{}, false, parseErr
	}
	if stat.TxTotal, parseErr = parseUintText(txTotal); parseErr != nil {
		return TrafficStat{}, false, parseErr
	}
	return stat, true, nil
}

func upsertTrafficTx(tx *sql.Tx, nodeID string, stat TrafficStat) error {
	stat.ResetDay = serverdomain.NormalizeTrafficResetDay(stat.ResetDay)
	_, err := tx.Exec(`
		INSERT OR REPLACE INTO traffic_stats(node_id, reset_day, period_start, next_reset, last_rx_bytes, last_tx_bytes, rx_total, tx_total, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, nodeID, stat.ResetDay, stat.PeriodStart, stat.NextReset, uintText(stat.LastRxBytes), uintText(stat.LastTxBytes), uintText(stat.RxTotal), uintText(stat.TxTotal), stat.UpdatedAt)
	return err
}

func countRows(db *sql.DB, table string) (int, error) {
	switch table {
	case "settings", "planned_nodes", "host_infos", "reports", "traffic_stats":
	default:
		return 0, fmt.Errorf("unsupported table %q", table)
	}
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&count)
	return count, err
}

func countRowsTx(tx *sql.Tx, table string) (int, error) {
	switch table {
	case "planned_nodes", "reports":
	default:
		return 0, fmt.Errorf("unsupported table %q", table)
	}
	var count int
	err := tx.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&count)
	return count, err
}

func uintText(value uint64) string {
	return strconv.FormatUint(value, 10)
}

func parseUintText(value string) (uint64, error) {
	if value == "" {
		return 0, nil
	}
	return strconv.ParseUint(value, 10, 64)
}
