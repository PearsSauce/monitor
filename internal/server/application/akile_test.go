package application

import (
	"testing"

	"vps-agent/internal/agent"
	"vps-agent/internal/server/domain"
)

func TestToAkileHostMapsMetricsAndTraffic(t *testing.T) {
	conns := &agent.Connections{TCP: 3, UDP: 4}
	host := ToAkileHost(agent.Metrics{
		NodeID:         "node-1",
		Timestamp:      1234,
		OS:             "linux",
		OSName:         "Ubuntu",
		Arch:           "amd64",
		Hostname:       "host-1",
		Kernel:         "6.1",
		Virtualization: "kvm",
		CPU:            agent.CPU{UsagePercent: 42.5, Cores: 4, PhysicalCores: 2, ModelName: "Test CPU"},
		Memory:         agent.Memory{Total: 1024, Used: 512},
		Swap:           agent.Memory{Total: 128, Used: 64},
		Load:           agent.Load{Load1: 0.1, Load5: 0.2, Load15: 0.3},
		Uptime:         99,
		Disks: []agent.Disk{
			{Mount: "/", Used: 10, Total: 100},
			{Mount: "/data", Used: 20, Total: 200},
		},
		Network:   agent.Network{RxBytes: 1000, TxBytes: 2000, RxRate: 10, TxRate: 20},
		DiskIO:    agent.DiskIO{ReadRate: 30, WriteRate: 40},
		Conns:     conns,
		Processes: 7,
	}, domain.TrafficStat{ResetDay: 40, PeriodStart: 111, NextReset: 222, RxTotal: 333, TxTotal: 444})

	if host.Host.Name != "node-1" || host.Host.Platform != "Ubuntu" || host.Host.LogicalCores != 4 {
		t.Fatalf("host meta = %#v", host.Host)
	}
	if len(host.Host.CPU) != 4 {
		t.Fatalf("cpu slots = %d", len(host.Host.CPU))
	}
	if host.State.DiskUsed != 30 || host.State.DiskTotal != 300 {
		t.Fatalf("disk totals = used %d total %d", host.State.DiskUsed, host.State.DiskTotal)
	}
	if host.State.TCP != 3 || host.State.UDP != 4 {
		t.Fatalf("connections = tcp %d udp %d", host.State.TCP, host.State.UDP)
	}
	if host.State.TrafficResetDay != 31 || host.State.CycleNetInTransfer != 333 || host.TimeStamp != 1234 {
		t.Fatalf("traffic/time = %#v timestamp=%d", host.State, host.TimeStamp)
	}
}

func TestToAkileHostDefaultsPlatformAndConnections(t *testing.T) {
	host := ToAkileHost(agent.Metrics{NodeID: "node-2"}, domain.TrafficStat{})
	if host.Host.Platform != "unknown" {
		t.Fatalf("platform = %q", host.Host.Platform)
	}
	if host.State.TCP != 0 || host.State.UDP != 0 {
		t.Fatalf("connections = tcp %d udp %d", host.State.TCP, host.State.UDP)
	}
	if host.State.TrafficResetDay != 1 {
		t.Fatalf("traffic reset day = %d", host.State.TrafficResetDay)
	}
}

func TestOfflineAkileHost(t *testing.T) {
	host := OfflineAkileHost("pending-node")
	if host.Host.Name != "pending-node" || host.Host.Platform != "pending" || host.Host.MemTotal != 1 {
		t.Fatalf("offline host = %#v", host)
	}
	if len(host.Host.CPU) != 0 || host.TimeStamp != 0 {
		t.Fatalf("offline host cpu/time = %#v timestamp=%d", host.Host.CPU, host.TimeStamp)
	}
}
