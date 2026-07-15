package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"vps-agent/internal/agent"
	serverdomain "vps-agent/internal/server/domain"
)

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
