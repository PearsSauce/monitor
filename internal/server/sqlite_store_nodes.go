package server

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	serverdomain "vps-agent/internal/server/domain"
)

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
