package server

import (
	"fmt"
	"sort"
	"time"

	"vps-agent/internal/agent"
	serverapp "vps-agent/internal/server/application"
	serverdomain "vps-agent/internal/server/domain"
)

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

func (s *Store) UpsertInfo(info HostInfo) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	info.AuthSecret = ""
	info.TrafficResetDay = serverdomain.NormalizeTrafficResetDay(info.TrafficResetDay)
	s.Infos[info.Name] = info
	s.syncTrafficResetDayLocked(info.Name, info.TrafficResetDay)
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
		out = append(out, serverapp.ToAkileHost(m, s.Traffic[m.NodeID]))
	}
	for name := range s.Planned {
		if _, ok := s.Reports[name]; ok {
			continue
		}
		out = append(out, serverapp.OfflineAkileHost(name))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Host.Name < out[j].Host.Name })
	return out
}
