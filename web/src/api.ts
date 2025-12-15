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

let ADMIN_PASSWORD = ''
try {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('ADMIN_PASSWORD') : null
  if (saved) ADMIN_PASSWORD = saved
} catch {}
export function setAdminPassword(pw: string) {
  ADMIN_PASSWORD = pw || ''
  try {
    if (pw) localStorage.setItem('ADMIN_PASSWORD', pw)
    else localStorage.removeItem('ADMIN_PASSWORD')
  } catch {}
}
function adminHeaders(): Record<string, string> {
  const h: Record<string, string> = {}
  if (ADMIN_PASSWORD) h['X-Admin-Password'] = ADMIN_PASSWORD
  return h
}

export async function createGroup(payload: any) {
  const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json', ...adminHeaders() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('创建分组失败')
}

export async function updateGroup(id: number, payload: any) {
  const res = await fetch(`/api/groups/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...adminHeaders() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新分组失败')
}

export async function deleteGroup(id: number) {
  const res = await fetch(`/api/groups/${id}`, { method: 'DELETE', headers: adminHeaders() })
  if (!res.ok) throw new Error('删除分组失败')
}

export async function getSSL(id: number) {
  const res = await fetch(`/api/ssl/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function createMonitor(payload: any) {
  const res = await fetch('/api/monitors', { method: 'POST', headers: { 'Content-Type': 'application/json', ...adminHeaders() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('创建失败')
}

export async function updateMonitor(id: number, payload: any) {
  const res = await fetch(`/api/monitors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...adminHeaders() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新失败')
}

export async function deleteMonitor(id: number) {
  const res = await fetch(`/api/monitors/${id}`, { method: 'DELETE', headers: adminHeaders() })
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
  const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...adminHeaders() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新设置失败')
}

export async function verifyAdmin(pw: string) {
  const res = await fetch('/api/admin/verify', { method: 'GET', headers: { 'X-Admin-Password': pw } })
  if (res.status === 204) return true
  if (res.status === 401) throw new Error('密码错误')
  if (!res.ok) throw new Error('网络错误')
  return true
}

export async function getNotifications(limit = 20) {
  const res = await fetch(`/api/notifications?limit=${limit}`)
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
