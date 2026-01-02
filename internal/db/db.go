package db

import (
	"database/sql"
	"time"

	_ "github.com/lib/pq"
)

// Open opens a database connection with optimized pool settings
func Open(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)                 // Maximum open connections
	db.SetMaxIdleConns(10)                 // Maximum idle connections
	db.SetConnMaxLifetime(5 * time.Minute) // Connection max lifetime
	db.SetConnMaxIdleTime(1 * time.Minute) // Idle connection max lifetime

	// Verify connection
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}

func Migrate(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS monitor_groups (
			id BIGINT PRIMARY KEY,
			name TEXT NOT NULL,
			icon TEXT,
			color TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS monitors (
			id BIGINT PRIMARY KEY,
			name TEXT NOT NULL,
			url TEXT NOT NULL,
			method TEXT NOT NULL DEFAULT 'GET',
			headers JSONB DEFAULT '{}'::jsonb,
			body TEXT,
			expected_status_min INT DEFAULT 200,
			expected_status_max INT DEFAULT 299,
			keyword TEXT,
			group_id BIGINT REFERENCES monitor_groups(id) ON DELETE SET NULL,
			interval_seconds INT NOT NULL DEFAULT 60,
			flap_threshold INT,
			notify_cooldown_minutes INT,
			last_online BOOLEAN,
			last_checked_at TIMESTAMPTZ
		);`,
		`CREATE TABLE IF NOT EXISTS monitor_results (
			id BIGSERIAL PRIMARY KEY,
			monitor_id BIGINT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
			checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			online BOOLEAN NOT NULL,
			status_code INT,
			response_ms INT,
			error TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS monitor_state (
			monitor_id BIGINT PRIMARY KEY REFERENCES monitors(id) ON DELETE CASCADE,
			last_reported_online BOOLEAN,
			online_streak INT NOT NULL DEFAULT 0,
			offline_streak INT NOT NULL DEFAULT 0
		);`,
		`CREATE TABLE IF NOT EXISTS ssl_info (
			monitor_id BIGINT PRIMARY KEY REFERENCES monitors(id) ON DELETE CASCADE,
			expires_at TIMESTAMPTZ,
			issuer TEXT,
			days_left INT
		);`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id BIGSERIAL PRIMARY KEY,
			monitor_id BIGINT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			type TEXT NOT NULL,
			message TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS monitor_subscriptions (
			id BIGSERIAL PRIMARY KEY,
			monitor_id BIGINT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
			email TEXT NOT NULL,
			notify_events TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			verified BOOLEAN DEFAULT FALSE,
			verify_token TEXT,
			verify_expires TIMESTAMPTZ
		);`,
		`CREATE INDEX IF NOT EXISTS idx_sub_monitor ON monitor_subscriptions(monitor_id);`,
		// Performance indexes
		`CREATE INDEX IF NOT EXISTS idx_monitor_results_monitor_id ON monitor_results(monitor_id);`,
		`CREATE INDEX IF NOT EXISTS idx_monitor_results_checked_at ON monitor_results(checked_at DESC);`,
		`CREATE INDEX IF NOT EXISTS idx_monitor_results_monitor_checked ON monitor_results(monitor_id, checked_at DESC);`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_monitor_id ON notifications(monitor_id);`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);`,
		`CREATE INDEX IF NOT EXISTS idx_sub_email ON monitor_subscriptions(email);`,
		`CREATE INDEX IF NOT EXISTS idx_sub_verify_token ON monitor_subscriptions(verify_token) WHERE verify_token IS NOT NULL;`,
		`CREATE INDEX IF NOT EXISTS idx_monitors_group_id ON monitors(group_id);`,
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
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS site_name TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS subtitle TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS tab_subtitle TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS debounce_seconds INT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS notify_events TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS smtp_server TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS smtp_port INT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS smtp_user TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS smtp_password TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS from_email TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS retention_days INT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS flap_threshold INT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS to_emails TEXT;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS show_system_status BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS status_monitor_id BIGINT;`,
		// Alter existing columns to BIGINT for snowflake IDs (safe if already BIGINT)
		`DO $$
		BEGIN
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitor_groups' AND column_name='id' AND data_type='integer') THEN
				ALTER TABLE monitor_groups ALTER COLUMN id TYPE BIGINT;
			END IF;
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitors' AND column_name='id' AND data_type='integer') THEN
				ALTER TABLE monitors ALTER COLUMN id TYPE BIGINT;
			END IF;
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitors' AND column_name='group_id' AND data_type='integer') THEN
				ALTER TABLE monitors ALTER COLUMN group_id TYPE BIGINT;
			END IF;
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitor_results' AND column_name='monitor_id' AND data_type='integer') THEN
				ALTER TABLE monitor_results ALTER COLUMN monitor_id TYPE BIGINT;
			END IF;
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitor_state' AND column_name='monitor_id' AND data_type='integer') THEN
				ALTER TABLE monitor_state ALTER COLUMN monitor_id TYPE BIGINT;
			END IF;
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ssl_info' AND column_name='monitor_id' AND data_type='integer') THEN
				ALTER TABLE ssl_info ALTER COLUMN monitor_id TYPE BIGINT;
			END IF;
			IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='monitor_id' AND data_type='integer') THEN
				ALTER TABLE notifications ALTER COLUMN monitor_id TYPE BIGINT;
			END IF;
		END $$;`,
		// Add new optional columns if not exist
		`ALTER TABLE monitors ADD COLUMN IF NOT EXISTS flap_threshold INT;`,
		`ALTER TABLE monitors ADD COLUMN IF NOT EXISTS notify_cooldown_minutes INT;`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}
	return nil
}
