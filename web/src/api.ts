export async function getMonitors() {
  const res = await fetch('/api/monitors')
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getHistory(id: number, days: number) {
  const res = await fetch(`/api/monitors/${id}/history?days=${days}`)
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getHistoryByDay(id: number, days: number) {
  const res = await fetch(`/api/monitors/${id}/history?group=day&days=${days}`)
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getGroups() {
  const res = await fetch('/api/groups')
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
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  if (!res.ok) throw new Error(res.status === 401 ? '密码错误' : '登录失败')
  const data = await res.json()
  setToken(data.token)
}

export async function createGroup(payload: any) {
  const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('创建分组失败')
}

export async function updateGroup(id: number, payload: any) {
  const res = await fetch(`/api/groups/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新分组失败')
}

export async function deleteGroup(id: number) {
  const res = await fetch(`/api/groups/${id}`, { method: 'DELETE', headers: authHeader() })
  if (!res.ok) throw new Error('删除分组失败')
}

export async function getSSL(id: number) {
  const res = await fetch(`/api/ssl/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function createMonitor(payload: any) {
  const res = await fetch('/api/monitors', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('创建失败')
}

export async function updateMonitor(id: number, payload: any) {
  const res = await fetch(`/api/monitors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新失败')
}

export async function deleteMonitor(id: number) {
  const res = await fetch(`/api/monitors/${id}`, { method: 'DELETE', headers: authHeader() })
  if (!res.ok) throw new Error('删除失败')
}

export async function getSetupState() {
  const res = await fetch('/api/setup/state')
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function postSetup(payload: any) {
  const res = await fetch('/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('安装失败')
}

export async function getSettings() {
  const res = await fetch('/api/settings')
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function updateSettings(payload: any) {
  const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新设置失败')
}

export async function getNotifications(limit = 20) {
  const res = await fetch(`/api/notifications?limit=${limit}`)
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getGlobalTrend() {
  const res = await fetch('/api/stats/trend')
  if (!res.ok) throw new Error('网络错误')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getLatestResult(id: number) {
  const res = await fetch(`/api/monitors/${id}/latest`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}
