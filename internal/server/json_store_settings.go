package server

func (s *Store) SiteName() string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.Settings.SiteName == "" {
		return "Monitor Party"
	}
	return s.Settings.SiteName
}

func (s *Store) GetSettings() Settings {
	s.mu.RLock()
	defer s.mu.RUnlock()
	settings := s.Settings
	if settings.SiteName == "" {
		settings.SiteName = "Monitor Party"
	}
	return settings
}

func (s *Store) UpdateSettings(settings Settings) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Settings = settings
	return s.saveLocked()
}
