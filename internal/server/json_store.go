package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"vps-agent/internal/agent"
)

type Store struct {
	mu       sync.RWMutex
	path     string
	Reports  map[string]agent.Metrics `json:"reports"`
	Infos    map[string]HostInfo      `json:"infos"`
	Planned  map[string]PlannedNode   `json:"planned"`
	Settings Settings                 `json:"settings"`
	Traffic  map[string]TrafficStat   `json:"traffic"`

	lastTrafficSave time.Time `json:"-"`
}

func NewStore(path string) (*Store, error) {
	s := &Store{path: path, Reports: map[string]agent.Metrics{}, Infos: map[string]HostInfo{}, Planned: map[string]PlannedNode{}, Settings: Settings{SiteName: "Monitor Party"}, Traffic: map[string]TrafficStat{}}
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return s, nil
	}
	if err != nil {
		return nil, err
	}
	if len(data) > 0 {
		if err := json.Unmarshal(data, s); err != nil {
			return nil, err
		}
	}
	if s.Reports == nil {
		s.Reports = map[string]agent.Metrics{}
	}
	if s.Infos == nil {
		s.Infos = map[string]HostInfo{}
	}
	if s.Planned == nil {
		s.Planned = map[string]PlannedNode{}
	}
	if s.Traffic == nil {
		s.Traffic = map[string]TrafficStat{}
	}
	if s.Settings.SiteName == "" {
		s.Settings.SiteName = "Monitor Party"
	}
	return s, nil
}

func (s *Store) SiteName() string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.Settings.SiteName == "" {
		return "Monitor Party"
	}
	return s.Settings.SiteName
}

func (s *Store) GetSettings() Settings {
	s.mu.RLock()
	defer s.mu.RUnlock()
	settings := s.Settings
	if settings.SiteName == "" {
		settings.SiteName = "Monitor Party"
	}
	return settings
}

func (s *Store) UpdateSettings(settings Settings) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Settings = settings
	return s.saveLocked()
}

func (s *Store) UpsertReport(metrics agent.Metrics, maxNodes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.Reports[metrics.NodeID]; !exists && len(s.Reports) >= maxNodes {
		return fmt.Errorf("max nodes reached")
	}
	s.Reports[metrics.NodeID] = metrics
	if _, ok := s.Planned[metrics.NodeID]; !ok {
		s.Planned[metrics.NodeID] = PlannedNode{NodeID: metrics.NodeID, CreatedAt: time.Now().Unix()}
	}
	return s.updateTrafficLocked(metrics)
}

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

func (s *Store) UpsertInfo(info HostInfo) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	info.AuthSecret = ""
	info.TrafficResetDay = normalizeTrafficResetDay(info.TrafficResetDay)
	s.Infos[info.Name] = info
	s.syncTrafficResetDayLocked(info.Name, info.TrafficResetDay)
	return s.saveLocked()
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

func (s *Store) InfoList() []HostInfo {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]HostInfo, 0, len(s.Infos))
	for _, info := range s.Infos {
		out = append(out, info)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}

func (s *Store) AkileHosts() []AkileHost {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]AkileHost, 0, len(s.Planned)+len(s.Reports))
	for _, m := range s.Reports {
		out = append(out, toAkileHost(m, s.Traffic[m.NodeID]))
	}
	for name := range s.Planned {
		if _, ok := s.Reports[name]; ok {
			continue
		}
		out = append(out, offlineAkileHost(name))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Host.Name < out[j].Host.Name })
	return out
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
		info.TrafficResetDay = normalizeTrafficResetDay(info.TrafficResetDay)
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
		info.TrafficResetDay = normalizeTrafficResetDay(info.TrafficResetDay)
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

func (s *Store) updateTrafficLocked(metrics agent.Metrics) error {
	now := time.Now()
	resetDay := normalizeTrafficResetDay(s.Infos[metrics.NodeID].TrafficResetDay)
	stat := s.Traffic[metrics.NodeID]
	if stat.ResetDay == 0 {
		start, next := trafficPeriod(now, resetDay)
		stat = TrafficStat{ResetDay: resetDay, PeriodStart: start.Unix(), NextReset: next.Unix(), LastRxBytes: metrics.Network.RxBytes, LastTxBytes: metrics.Network.TxBytes, UpdatedAt: now.Unix()}
		s.Traffic[metrics.NodeID] = stat
		return s.saveTrafficLocked(false, now)
	}
	if stat.ResetDay != resetDay {
		stat.ResetDay = resetDay
		stat.NextReset = nextTrafficReset(now, resetDay).Unix()
	}
	resetHappened := false
	if stat.NextReset == 0 || now.Unix() >= stat.NextReset {
		start, next := trafficPeriod(now, resetDay)
		stat.PeriodStart = start.Unix()
		stat.NextReset = next.Unix()
		stat.RxTotal = 0
		stat.TxTotal = 0
		stat.LastRxBytes = metrics.Network.RxBytes
		stat.LastTxBytes = metrics.Network.TxBytes
		stat.UpdatedAt = now.Unix()
		s.Traffic[metrics.NodeID] = stat
		return s.saveTrafficLocked(true, now)
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
	s.Traffic[metrics.NodeID] = stat
	return s.saveTrafficLocked(resetHappened, now)
}

func (s *Store) syncTrafficResetDayLocked(nodeID string, resetDay int) {
	resetDay = normalizeTrafficResetDay(resetDay)
	stat := s.Traffic[nodeID]
	if stat.ResetDay == resetDay {
		return
	}
	now := time.Now()
	stat.ResetDay = resetDay
	stat.NextReset = nextTrafficReset(now, resetDay).Unix()
	if stat.PeriodStart == 0 {
		start, next := trafficPeriod(now, resetDay)
		stat.PeriodStart = start.Unix()
		stat.NextReset = next.Unix()
	}
	s.Traffic[nodeID] = stat
}

func (s *Store) saveTrafficLocked(force bool, now time.Time) error {
	if !force && !s.lastTrafficSave.IsZero() && now.Sub(s.lastTrafficSave) < time.Minute {
		return nil
	}
	s.lastTrafficSave = now
	return s.saveLocked()
}

func (s *Store) saveLocked() error {
	if s.path == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(s.path), 0755); err != nil {
		return fmt.Errorf("save mkdir failed: %w", err)
	}
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return fmt.Errorf("save marshal failed: %w", err)
	}
	if err := os.WriteFile(s.path, data, 0600); err != nil {
		return fmt.Errorf("save failed: %w", err)
	}
	return nil
}
