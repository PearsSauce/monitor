package server

import (
	serverapp "vps-agent/internal/server/application"
	"vps-agent/internal/server/domain"
)

type Settings = domain.Settings
type PlannedNode = domain.PlannedNode
type AdminNode = domain.AdminNode
type NodeBackup = domain.NodeBackup
type NodeBackupRecord = domain.NodeBackupRecord
type HostInfo = domain.HostInfo
type TrafficStat = domain.TrafficStat

type AkileHost = serverapp.AkileHost
type AkileHostMeta = serverapp.AkileHostMeta
type AkileHostState = serverapp.AkileHostState

type dataStore = serverapp.Store

var (
	_ serverapp.Store = (*Store)(nil)
	_ serverapp.Store = (*SQLiteStore)(nil)
)
