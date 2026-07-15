package server

import (
	"fmt"
	"sort"
	"strings"
	"time"

	serverdomain "vps-agent/internal/server/domain"
)

func (s *Store) AddPlannedNode(nodeID string, maxNodes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.Planned[nodeID]; !exists && len(s.Planned) >= maxNodes {
		return fmt.Errorf("max nodes reached")
	}
	s.Planned[nodeID] = PlannedNode{NodeID: nodeID, CreatedAt: time.Now().Unix()}
	return s.saveLocked()
}

func (s *Store) SetNodeToken(nodeID, tokenHash string, maxNodes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.Planned[nodeID]; !exists && len(s.Planned) >= maxNodes {
		return fmt.Errorf("max nodes reached")
	}
	planned := s.Planned[nodeID]
	planned.NodeID = nodeID
	if planned.CreatedAt == 0 {
		planned.CreatedAt = time.Now().Unix()
	}
	planned.TokenHash = tokenHash
	s.Planned[nodeID] = planned
	return s.saveLocked()
}

func (s *Store) ValidNodeToken(nodeID, tokenHash string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	planned, ok := s.Planned[nodeID]
	if !ok || planned.TokenHash == "" || tokenHash == "" {
		return false
	}
	return constantEqual(planned.TokenHash, tokenHash)
}

func (s *Store) Delete(name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.Reports, name)
	delete(s.Planned, name)
	delete(s.Infos, name)
	delete(s.Traffic, name)
	return s.saveLocked()
}

func (s *Store) AdminNodes(offlineWait time.Duration) []AdminNode {
	s.mu.RLock()
	defer s.mu.RUnlock()
	now := time.Now().Unix()
	threshold := int64(offlineWait.Seconds())
	seen := map[string]bool{}
	out := make([]AdminNode, 0, len(s.Planned)+len(s.Reports))
	for name, planned := range s.Planned {
		report, hasReport := s.Reports[name]
		lastSeen := int64(0)
		online := false
		if hasReport {
			lastSeen = report.Timestamp
			online = report.Timestamp > 0 && now-report.Timestamp <= threshold
		}
		out = append(out, AdminNode{NodeID: name, Online: online, LastSeen: lastSeen, CreatedAt: planned.CreatedAt, Info: s.Infos[name]})
		seen[name] = true
	}
	for name, report := range s.Reports {
		if seen[name] {
			continue
		}
		online := report.Timestamp > 0 && now-report.Timestamp <= threshold
		out = append(out, AdminNode{NodeID: name, Online: online, LastSeen: report.Timestamp, Info: s.Infos[name]})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].NodeID < out[j].NodeID })
	return out
}

func (s *Store) ExportNodes() NodeBackup {
	s.mu.RLock()
	defer s.mu.RUnlock()
	names := map[string]bool{}
	for name := range s.Planned {
		names[name] = true
	}
	for name := range s.Infos {
		names[name] = true
	}
	for name := range s.Reports {
		names[name] = true
	}
	out := NodeBackup{Version: 1, ExportedAt: time.Now().Unix(), Nodes: make([]NodeBackupRecord, 0, len(names))}
	for name := range names {
		planned := s.Planned[name]
		info := s.Infos[name]
		info.AuthSecret = ""
		info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
		out.Nodes = append(out.Nodes, NodeBackupRecord{NodeID: name, CreatedAt: planned.CreatedAt, TokenHash: planned.TokenHash, Info: info})
	}
	sort.Slice(out.Nodes, func(i, j int) bool { return out.Nodes[i].NodeID < out.Nodes[j].NodeID })
	return out
}

func (s *Store) ImportNodes(backup NodeBackup, maxNodes int) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if backup.Version == 0 {
		backup.Version = 1
	}
	if backup.Version != 1 {
		return 0, fmt.Errorf("unsupported backup version")
	}
	imported := 0
	now := time.Now().Unix()
	for _, record := range backup.Nodes {
		nodeID := strings.TrimSpace(record.NodeID)
		if nodeID == "" && record.Info.Name != "" {
			nodeID = strings.TrimSpace(record.Info.Name)
		}
		if !validNodeID(nodeID) {
			return imported, fmt.Errorf("invalid node_id: %s", nodeID)
		}
		if _, exists := s.Planned[nodeID]; !exists && len(s.Planned) >= maxNodes {
			return imported, fmt.Errorf("max nodes reached")
		}
		planned := s.Planned[nodeID]
		planned.NodeID = nodeID
		if record.CreatedAt > 0 {
			planned.CreatedAt = record.CreatedAt
		} else if planned.CreatedAt == 0 {
			planned.CreatedAt = now
		}
		if record.TokenHash != "" {
			planned.TokenHash = strings.TrimSpace(record.TokenHash)
		}
		s.Planned[nodeID] = planned
		info := record.Info
		info.Name = nodeID
		info.AuthSecret = ""
		info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
		s.Infos[nodeID] = info
		s.syncTrafficResetDayLocked(nodeID, info.TrafficResetDay)
		imported++
	}
	if imported > 0 {
		if err := s.saveLocked(); err != nil {
			return imported, err
		}
	}
	return imported, nil
}
