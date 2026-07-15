package domain

type Settings struct {
	SiteName string `json:"site_name"`
}

type PlannedNode struct {
	NodeID    string `json:"node_id"`
	CreatedAt int64  `json:"created_at"`
	TokenHash string `json:"token_hash,omitempty"`
}

type AdminNode struct {
	NodeID    string   `json:"node_id"`
	Online    bool     `json:"online"`
	LastSeen  int64    `json:"last_seen"`
	CreatedAt int64    `json:"created_at"`
	Info      HostInfo `json:"info"`
}

type NodeBackup struct {
	Version    int                `json:"version"`
	ExportedAt int64              `json:"exported_at"`
	Nodes      []NodeBackupRecord `json:"nodes"`
}

type NodeBackupRecord struct {
	NodeID    string   `json:"node_id"`
	CreatedAt int64    `json:"created_at"`
	TokenHash string   `json:"token_hash,omitempty"`
	Info      HostInfo `json:"info"`
}

type HostInfo struct {
	Name            string `json:"name"`
	DueTime         int64  `json:"due_time"`
	BuyURL          string `json:"buy_url"`
	Seller          string `json:"seller"`
	Price           string `json:"price"`
	Cycle           string `json:"cycle"`
	Bandwidth       string `json:"bandwidth"`
	Traffic         string `json:"traffic"`
	TrafficResetDay int    `json:"traffic_reset_day"`
	Show            bool   `json:"show_purchase_info"`
	AuthSecret      string `json:"auth_secret,omitempty"`
}

type TrafficStat struct {
	ResetDay    int    `json:"reset_day"`
	PeriodStart int64  `json:"period_start"`
	NextReset   int64  `json:"next_reset"`
	LastRxBytes uint64 `json:"last_rx_bytes"`
	LastTxBytes uint64 `json:"last_tx_bytes"`
	RxTotal     uint64 `json:"rx_total"`
	TxTotal     uint64 `json:"tx_total"`
	UpdatedAt   int64  `json:"updated_at"`
}
