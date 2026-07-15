package server

import (
	"database/sql"
	"errors"
	"log"
)

func (s *SQLiteStore) SiteName() string {
	return s.GetSettings().SiteName
}

func (s *SQLiteStore) GetSettings() Settings {
	var siteName string
	err := s.db.QueryRow(`SELECT value FROM settings WHERE key = 'site_name'`).Scan(&siteName)
	if errors.Is(err, sql.ErrNoRows) || siteName == "" {
		return Settings{SiteName: "Monitor Party"}
	}
	if err != nil {
		log.Printf("sqlite site name read failed: %v", err)
		return Settings{SiteName: "Monitor Party"}
	}
	return Settings{SiteName: siteName}
}

func (s *SQLiteStore) UpdateSettings(settings Settings) error {
	if settings.SiteName == "" {
		settings.SiteName = "Monitor Party"
	}
	_, err := s.db.Exec(`INSERT OR REPLACE INTO settings(key, value) VALUES ('site_name', ?)`, settings.SiteName)
	return err
}
