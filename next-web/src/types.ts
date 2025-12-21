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

export interface HistoryItem {
  checked_at: string
  online: boolean
  status_code: number
  response_ms: number
  error?: string
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

export interface NotificationItem {
  id: number
  monitor_id: number
  created_at: string
  type: string
  message: string
  monitor_name: string
}
