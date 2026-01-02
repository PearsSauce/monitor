import type {
  Monitor,
  Group,
  SSLInfo,
  HistoryItem,
  DayHistoryItem,
  NotificationItem,
  Subscription,
} from '@/types/index'

import type {
  CreateMonitorInput,
  UpdateMonitorInput,
  CreateGroupInput,
  UpdateGroupInput,
  SettingsInput,
  LoginResponse,
  SetupStateResponse,
  SettingsResponse,
  LatestResultResponse,
  NotificationsResponse,
  SubscriptionInput,
  SetupInput,
} from '@/types/api'

export const API_BASE = ''

function prefix(u: string): string {
  return `${API_BASE}${u}`
}

// Token management
let TOKEN = ''
try {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('AUTH_TOKEN') : null
  if (saved) TOKEN = saved
} catch {}

export function setToken(t: string): void {
  TOKEN = t || ''
  try {
    if (t) localStorage.setItem('AUTH_TOKEN', t)
    else localStorage.removeItem('AUTH_TOKEN')
  } catch {}
}

export function getToken(): string {
  return TOKEN
}

function authHeader(): Record<string, string> {
  if (TOKEN) return { 'Authorization': `Bearer ${TOKEN}` }
  return {}
}

// Generic request helper with type safety
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) }
  const res = await fetch(prefix(url), { ...options, headers })
  
  if (res.status === 401) {
    setToken('')
    throw new Error('登录已过期，请刷新页面重新登录')
  }
  
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || res.statusText)
  }
  
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return res.text() as unknown as T
}

// Public API (no auth required)
export async function getMonitors(): Promise<Monitor[]> {
  const res = await fetch(prefix('/api/monitors'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getHistory(id: number, days: number): Promise<HistoryItem[]> {
  const res = await fetch(prefix(`/api/monitors/${id}/history?days=${days}`))
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getHistoryByDay(id: number, days: number): Promise<DayHistoryItem[]> {
  const res = await fetch(prefix(`/api/monitors/${id}/history?group=day&days=${days}`))
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getGroups(): Promise<Group[]> {
  const res = await fetch(prefix('/api/groups'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getSSL(id: number): Promise<SSLInfo | null> {
  const res = await fetch(prefix(`/api/ssl/${id}`))
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getLatestResult(id: number): Promise<LatestResultResponse | null> {
  const res = await fetch(prefix(`/api/monitors/${id}/latest`))
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getSettings(): Promise<SettingsResponse> {
  const res = await fetch(prefix('/api/settings'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getSetupState(): Promise<SetupStateResponse> {
  const res = await fetch(prefix('/api/setup/state'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getNotifications(
  page = 1,
  limit = 20,
  type = ''
): Promise<NotificationsResponse> {
  const res = await fetch(prefix(`/api/notifications?page=${page}&limit=${limit}&type=${type}`))
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? { items: data, total: data.length } : data
}

// Auth
export async function login(password: string): Promise<void> {
  const res = await fetch(prefix('/api/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  if (!res.ok) throw new Error(res.status === 401 ? '密码错误' : '登录失败')
  const data: LoginResponse = await res.json()
  setToken(data.token)
}

export async function postSetup(payload: SetupInput): Promise<void> {
  const res = await fetch(prefix('/api/setup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('安装失败')
}

// Monitor CRUD (auth required)
export async function createMonitor(payload: CreateMonitorInput): Promise<void> {
  await request<void>('/api/monitors', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateMonitor(id: number, payload: UpdateMonitorInput): Promise<void> {
  await request<void>(`/api/monitors/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteMonitor(id: number): Promise<void> {
  await request<void>(`/api/monitors/${id}`, { method: 'DELETE' })
}

// Group CRUD (auth required)
export async function createGroup(payload: CreateGroupInput): Promise<void> {
  await request<void>('/api/groups', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateGroup(id: number, payload: UpdateGroupInput): Promise<void> {
  await request<void>(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteGroup(id: number): Promise<void> {
  await request<void>(`/api/groups/${id}`, { method: 'DELETE' })
}

// Settings (auth required)
export async function updateSettings(payload: SettingsInput): Promise<void> {
  const res = await fetch(prefix('/api/settings'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('更新设置失败')
}

// Notifications (auth required)
export async function deleteNotification(id: number): Promise<void> {
  await request<void>(`/api/notifications/${id}`, { method: 'DELETE' })
}

// Subscriptions (auth required)
export async function getSubscriptions(monitorId: number): Promise<Subscription[]> {
  return request<Subscription[]>(`/api/subscriptions?monitor_id=${monitorId}`)
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  return request<Subscription[]>('/api/subscriptions')
}

export async function addSubscription(
  monitorId: number,
  email: string,
  events: string[]
): Promise<void> {
  const payload: SubscriptionInput = {
    monitor_id: monitorId,
    email,
    notify_events: events
  }
  await request<void>('/api/subscriptions', { method: 'POST', body: JSON.stringify(payload) })
}

export async function deleteSubscription(id: number): Promise<void> {
  await request<void>(`/api/subscriptions/${id}`, { method: 'DELETE' })
}

export async function deleteSubscriptionsForMonitor(monitorId: number): Promise<void> {
  await request<void>(`/api/monitors/${monitorId}/subscriptions`, { method: 'DELETE' })
}

// Public subscription (no auth)
export async function publicSubscribe(
  monitorId: number,
  email: string,
  events: string[]
): Promise<void> {
  const res = await fetch(prefix('/api/public/subscribe'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monitor_id: monitorId, email, notify_events: events })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || '订阅失败')
  }
}
