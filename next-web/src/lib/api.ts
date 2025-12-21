export const API_BASE = ''

function prefix(u: string) {
  return `${API_BASE}${u}`
}

export async function getMonitors() {
  const res = await fetch(prefix('/api/monitors'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getHistory(id: number, days: number) {
  const res = await fetch(prefix(`/api/monitors/${id}/history?days=${days}`))
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getHistoryByDay(id: number, days: number) {
  const res = await fetch(prefix(`/api/monitors/${id}/history?group=day&days=${days}`))
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getGroups() {
  const res = await fetch(prefix('/api/groups'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

let TOKEN = ''
try {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('AUTH_TOKEN') : null
  if (saved) TOKEN = saved
} catch {}

export function setToken(t: string) {
  TOKEN = t || ''
  try {
    if (t) localStorage.setItem('AUTH_TOKEN', t)
    else localStorage.removeItem('AUTH_TOKEN')
  } catch {}
}

export function getToken() {
  return TOKEN
}

function authHeader(): Record<string, string> {
  if (TOKEN) return { 'Authorization': `Bearer ${TOKEN}` }
  return {}
}

export async function login(password: string) {
  const res = await fetch(prefix('/api/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  if (!res.ok) throw new Error(res.status === 401 ? '密码错误' : '登录失败')
  const data = await res.json()
  setToken(data.token)
}

async function request(url: string, options: RequestInit = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) }
  const res = await fetch(prefix(url), { ...options, headers })
  if (res.status === 401) {
    setToken('')
    // Ideally redirect to login or handle expiration
    throw new Error('登录已过期，请刷新页面重新登录')
  }
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || res.statusText)
  }
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

export async function createGroup(payload: any) {
  await request('/api/groups', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateGroup(id: number, payload: any) {
  await request(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteGroup(id: number) {
  await request(`/api/groups/${id}`, { method: 'DELETE' })
}

export async function getSSL(id: number) {
  const res = await fetch(prefix(`/api/ssl/${id}`))
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function createMonitor(payload: any) {
  await request('/api/monitors', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateMonitor(id: number, payload: any) {
  await request(`/api/monitors/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteMonitor(id: number) {
  await request(`/api/monitors/${id}`, { method: 'DELETE' })
}

export async function getSetupState() {
  const res = await fetch(prefix('/api/setup/state'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function postSetup(payload: any) {
  const res = await fetch(prefix('/api/setup'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('安装失败')
}

export async function getSettings() {
  const res = await fetch(prefix('/api/settings'))
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function updateSettings(payload: any) {
  const res = await fetch(prefix('/api/settings'), { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新设置失败')
}

export async function getNotifications(page = 1, limit = 20, type = '') {
  const res = await fetch(prefix(`/api/notifications?page=${page}&limit=${limit}&type=${type}`))
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? { items: data, total: data.length } : data
}

export async function getSubscriptions(monitorId: number) {
  return request(`/api/subscriptions?monitor_id=${monitorId}`)
}

export async function addSubscription(monitorId: number, email: string, events: string[]) {
  await request('/api/subscriptions', { method: 'POST', body: JSON.stringify({ monitor_id: monitorId, email, notify_events: events }) })
}

export async function deleteSubscription(id: number) {
  await request(`/api/subscriptions/${id}`, { method: 'DELETE' })
}

export async function publicSubscribe(monitorId: number, email: string, events: string[]) {
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

export async function getAllSubscriptions() {
  return request('/api/subscriptions')
}

export async function deleteSubscriptionsForMonitor(monitorId: number) {
  await request(`/api/monitors/${monitorId}/subscriptions`, { method: 'DELETE' })
}


export async function getLatestResult(id: number) {
  const res = await fetch(prefix(`/api/monitors/${id}/latest`))
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}
