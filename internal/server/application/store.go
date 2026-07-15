package application

import (
	"time"

	"vps-agent/internal/agent"
	"vps-agent/internal/server/domain"
)

type Store interface {
	SiteName() string
	GetSettings() domain.Settings
	UpdateSettings(domain.Settings) error
	UpsertReport(agent.Metrics, int) error
	AddPlannedNode(string, int) error
	SetNodeToken(string, string, int) error
	ValidNodeToken(string, string) bool
	UpsertInfo(domain.HostInfo) error
	Delete(string) error
	InfoList() []domain.HostInfo
	AkileHosts() []AkileHost
	AdminNodes(time.Duration) []domain.AdminNode
	ExportNodes() domain.NodeBackup
	ImportNodes(domain.NodeBackup, int) (int, error)
}

type AkileHost struct {
	Host      AkileHostMeta  `json:"Host"`
	State     AkileHostState `json:"State"`
	TimeStamp int64          `json:"TimeStamp"`
}

type AkileHostMeta struct {
	Name            string `json:"Name"`
	Hostname        string `json:"Hostname"`
	Platform        string `json:"Platform"`
	PlatformVersion string `json:"PlatformVersion"`
	Kernel          string `json:"Kernel"`
	Arch            string `json:"Arch"`
	Virtualization  string `json:"Virtualization"`
	CPU             []int  `json:"CPU"`
	CPUModel        string `json:"CPUModel"`
	PhysicalCores   int    `json:"PhysicalCores"`
	LogicalCores    int    `json:"LogicalCores"`
	MemTotal        uint64 `json:"MemTotal"`
	SwapTotal       uint64 `json:"SwapTotal"`
}

type AkileHostState struct {
	CPU                 float64      `json:"CPU"`
	MemUsed             uint64       `json:"MemUsed"`
	SwapUsed            uint64       `json:"SwapUsed"`
	DiskUsed            uint64       `json:"DiskUsed"`
	DiskTotal           uint64       `json:"DiskTotal"`
	Disks               []agent.Disk `json:"Disks"`
	NetInTransfer       uint64       `json:"NetInTransfer"`
	NetOutTransfer      uint64       `json:"NetOutTransfer"`
	NetInSpeed          uint64       `json:"NetInSpeed"`
	NetOutSpeed         uint64       `json:"NetOutSpeed"`
	DiskReadSpeed       uint64       `json:"DiskReadSpeed"`
	DiskWriteSpeed      uint64       `json:"DiskWriteSpeed"`
	TCP                 int          `json:"TCP"`
	UDP                 int          `json:"UDP"`
	Processes           int          `json:"Processes"`
	Load1               float64      `json:"Load1"`
	Load5               float64      `json:"Load5"`
	Load15              float64      `json:"Load15"`
	Uptime              uint64       `json:"Uptime"`
	CycleNetInTransfer  uint64       `json:"CycleNetInTransfer"`
	CycleNetOutTransfer uint64       `json:"CycleNetOutTransfer"`
	TrafficResetDay     int          `json:"TrafficResetDay"`
	TrafficPeriodStart  int64        `json:"TrafficPeriodStart"`
	TrafficNextReset    int64        `json:"TrafficNextReset"`
}
