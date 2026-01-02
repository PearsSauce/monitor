// Base entity types
export interface Monitor {
  id: number
  name: string
  url: string
  method: string
  headers_json: string
  body: string
  expected_status_min: number
  expected_status_max: number
  keyword: string
  group_id?: number
  interval_seconds: number
  last_online?: boolean
  last_checked_at?: string
}

export interface Group {
  id: number
  name: string
  icon?: string
  color?: string
}

export interface SSLInfo {
  expires_at?: string
  issuer?: string
  days_left?: number
}

export interface HistoryItem {
  checked_at: string
  online: boolean
  status_code: number
  response_ms: number
  error?: string
}

export interface DayHistoryItem {
  day: string
  online_count: number
  total_count: number
  avg_response_ms: number
}

export interface NotificationItem {
  id: number
  monitor_id: number
  created_at: string
  type: 'status_change' | 'ssl_expiry'
  message: string
  monitor_name: string
}

export interface Subscription {
  id: number
  monitor_id: number
  monitor_name?: string
  email: string
  notify_events: string
  created_at: string
  verified: boolean
}

// SSE Event type
export interface SSEEvent {
  MonitorID: number
  CheckedAt: string
  Online: boolean
  StatusCode: number
  ResponseMs: number
  Error: string
  EventType?: 'status_change' | 'ssl_expiry'
  Message?: string
  MonitorName?: string
}

// Note: Import from specific files for API types (@/types/api) and store types (@/types/store)
