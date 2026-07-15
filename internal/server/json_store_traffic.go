package server

import (
	"time"

	"vps-agent/internal/agent"
	serverdomain "vps-agent/internal/server/domain"
)

func (s *Store) updateTrafficLocked(metrics agent.Metrics) error {
	now := time.Now()
	resetDay := serverdomain.NormalizeTrafficResetDay(s.Infos[metrics.NodeID].TrafficResetDay)
	stat := s.Traffic[metrics.NodeID]
	if stat.ResetDay == 0 {
		start, next := serverdomain.TrafficPeriod(now, resetDay)
		stat = TrafficStat{ResetDay: resetDay, PeriodStart: start.Unix(), NextReset: next.Unix(), LastRxBytes: metrics.Network.RxBytes, LastTxBytes: metrics.Network.TxBytes, UpdatedAt: now.Unix()}
		s.Traffic[metrics.NodeID] = stat
		return s.saveTrafficLocked(false, now)
	}
	if stat.ResetDay != resetDay {
		stat.ResetDay = resetDay
		stat.NextReset = serverdomain.NextTrafficReset(now, resetDay).Unix()
	}
	resetHappened := false
	if stat.NextReset == 0 || now.Unix() >= stat.NextReset {
		start, next := serverdomain.TrafficPeriod(now, resetDay)
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
	resetDay = serverdomain.NormalizeTrafficResetDay(resetDay)
	stat := s.Traffic[nodeID]
	if stat.ResetDay == resetDay {
		return
	}
	now := time.Now()
	stat.ResetDay = resetDay
	stat.NextReset = serverdomain.NextTrafficReset(now, resetDay).Unix()
	if stat.PeriodStart == 0 {
		start, next := serverdomain.TrafficPeriod(now, resetDay)
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
