package application

import (
	"vps-agent/internal/agent"
	"vps-agent/internal/server/domain"
)

func ToAkileHost(metrics agent.Metrics, traffic domain.TrafficStat) AkileHost {
	diskUsed := uint64(0)
	diskTotal := uint64(0)
	for _, disk := range metrics.Disks {
		diskUsed += disk.Used
		diskTotal += disk.Total
	}
	platform := metrics.OS
	if metrics.OSName != "" {
		platform = metrics.OSName
	}
	if platform == "" {
		platform = "unknown"
	}
	conns := agent.Connections{}
	if metrics.Conns != nil {
		conns = *metrics.Conns
	}
	return AkileHost{
		Host: AkileHostMeta{
			Name:            metrics.NodeID,
			Hostname:        metrics.Hostname,
			Platform:        platform,
			PlatformVersion: metrics.Kernel,
			Kernel:          metrics.Kernel,
			Arch:            metrics.Arch,
			Virtualization:  metrics.Virtualization,
			CPU:             make([]int, metrics.CPU.Cores),
			CPUModel:        metrics.CPU.ModelName,
			PhysicalCores:   metrics.CPU.PhysicalCores,
			LogicalCores:    metrics.CPU.Cores,
			MemTotal:        metrics.Memory.Total,
			SwapTotal:       metrics.Swap.Total,
		},
		State: AkileHostState{
			CPU:                 metrics.CPU.UsagePercent,
			MemUsed:             metrics.Memory.Used,
			SwapUsed:            metrics.Swap.Used,
			DiskUsed:            diskUsed,
			DiskTotal:           diskTotal,
			Disks:               metrics.Disks,
			NetInTransfer:       metrics.Network.RxBytes,
			NetOutTransfer:      metrics.Network.TxBytes,
			NetInSpeed:          metrics.Network.RxRate,
			NetOutSpeed:         metrics.Network.TxRate,
			DiskReadSpeed:       metrics.DiskIO.ReadRate,
			DiskWriteSpeed:      metrics.DiskIO.WriteRate,
			TCP:                 conns.TCP,
			UDP:                 conns.UDP,
			Processes:           metrics.Processes,
			Load1:               metrics.Load.Load1,
			Load5:               metrics.Load.Load5,
			Load15:              metrics.Load.Load15,
			Uptime:              metrics.Uptime,
			CycleNetInTransfer:  traffic.RxTotal,
			CycleNetOutTransfer: traffic.TxTotal,
			TrafficResetDay:     domain.NormalizeTrafficResetDay(traffic.ResetDay),
			TrafficPeriodStart:  traffic.PeriodStart,
			TrafficNextReset:    traffic.NextReset,
		},
		TimeStamp: metrics.Timestamp,
	}
}

func OfflineAkileHost(name string) AkileHost {
	return AkileHost{
		Host:      AkileHostMeta{Name: name, Platform: "pending", PlatformVersion: "", CPU: []int{}, MemTotal: 1},
		State:     AkileHostState{},
		TimeStamp: 0,
	}
}
