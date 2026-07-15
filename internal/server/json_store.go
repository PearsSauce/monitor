package server

import (
	"encoding/json"
	"errors"
	"os"
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
