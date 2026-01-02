// API Input Types
export interface CreateMonitorInput {
  name: string
  url: string
  method?: string
  headers_json?: string
  body?: string
  expected_status_min?: number
  expected_status_max?: number
  keyword?: string
  group_id?: number
  interval_seconds?: number
}

export interface UpdateMonitorInput extends Partial<CreateMonitorInput> {}

export interface CreateGroupInput {
  name: string
  icon?: string
  color?: string
}

export interface UpdateGroupInput extends Partial<CreateGroupInput> {}

export interface SettingsInput {
  site_name?: string
  subtitle?: string
  tab_subtitle?: string
  retention_days?: number
  check_interval_seconds?: number
  smtp_host?: string
  smtp_port?: number
  smtp_user?: string
  smtp_pass?: string
  smtp_from?: string
  smtp_ssl?: boolean
  allow_public_subscribe?: boolean
  show_system_status?: boolean
  status_monitor_id?: number
}

export interface LoginInput {
  password: string
}

export interface SetupInput {
  password: string
  site_name?: string
}

export interface SubscriptionInput {
  monitor_id: number
  email: string
  notify_events: string[]
}

// API Response Types
export interface LoginResponse {
  token: string
}

export interface SetupStateResponse {
  initialized: boolean
  installed: boolean
}

export interface SettingsResponse {
  site_name: string
  subtitle: string
  tab_subtitle: string
  retention_days: number
  check_interval_seconds: number
  history_days_frontend: number
  debounce_seconds: number
  flap_threshold: number
  enable_notifications: boolean
  notify_events: string[]
  smtp_server: string
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  smtp_from: string
  from_email: string
  to_emails: string
  smtp_ssl: boolean
  allow_public_subscribe: boolean
  show_system_status: boolean
  status_monitor_id: number
}

export interface HistoryResponse {
  checked_at: string
  online: boolean
  status_code: number
  response_ms: number
  error?: string
}

export interface DayHistoryResponse {
  day: string
  online_count: number
  total_count: number
  avg_response_ms: number
}

export interface NotificationsResponse {
  items: NotificationItemResponse[]
  total: number
}

export interface NotificationItemResponse {
  id: number
  monitor_id: number
  created_at: string
  type: 'status_change' | 'ssl_expiry'
  message: string
  monitor_name: string
}

export interface LatestResultResponse {
  checked_at: string
  online: boolean
  status_code: number
  response_ms: number
  error?: string
}

export interface SSLResponse {
  expires_at?: string
  issuer?: string
  days_left?: number
}

// API Error type
export interface APIError {
  message: string
  status?: number
}
