package db

import (
	"database/sql"

	_ "github.com/lib/pq"
)

func Open(dsn string) (*sql.DB, error) {
	return sql.Open("postgres", dsn)
}

func Migrate(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS monitor_groups (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			icon TEXT,
			color TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS monitors (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			url TEXT NOT NULL,
			method TEXT NOT NULL DEFAULT 'GET',
			headers JSONB DEFAULT '{}'::jsonb,
			body TEXT,
			expected_status_min INT DEFAULT 200,
			expected_status_max INT DEFAULT 299,
			keyword TEXT,
			group_id INT REFERENCES monitor_groups(id) ON DELETE SET NULL,
			interval_seconds INT NOT NULL DEFAULT 60,
			last_online BOOLEAN,
			last_checked_at TIMESTAMPTZ
		);`,
		`CREATE TABLE IF NOT EXISTS monitor_results (
			id BIGSERIAL PRIMARY KEY,
			monitor_id INT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
			checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			online BOOLEAN NOT NULL,
			status_code INT,
			response_ms INT,
			error TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS ssl_info (
			monitor_id INT PRIMARY KEY REFERENCES monitors(id) ON DELETE CASCADE,
			expires_at TIMESTAMPTZ,
			issuer TEXT,
			days_left INT
		);`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id BIGSERIAL PRIMARY KEY,
			monitor_id INT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			type TEXT NOT NULL,
			message TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS admin_users (
			id SERIAL PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS app_settings (
			id SERIAL PRIMARY KEY,
			addr TEXT,
			database_url TEXT,
			resend_api_key TEXT,
			alert_before_days INT,
			check_interval_seconds INT
		);`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}
	return nil
}
