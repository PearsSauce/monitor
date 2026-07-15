package server

import (
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"time"

	"vps-agent/internal/agent"
	serverapp "vps-agent/internal/server/application"
	serverdomain "vps-agent/internal/server/domain"
)

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
		out = append(out, serverapp.ToAkileHost(metrics, traffic[metrics.NodeID]))
	}
	for name := range planned {
		if _, ok := reports[name]; ok {
			continue
		}
		out = append(out, serverapp.OfflineAkileHost(name))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Host.Name < out[j].Host.Name })
	return out
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
