export async function getMonitors() {
  const res = await fetch('/api/monitors')
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getHistory(id: number, days: number) {
  const res = await fetch(`/api/monitors/${id}/history?days=${days}`)
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getHistoryByDay(id: number, days: number) {
  const res = await fetch(`/api/monitors/${id}/history?group=day&days=${days}`)
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function getGroups() {
  const res = await fetch('/api/groups')
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function createGroup(payload: any) {
  const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('创建分组失败')
}

export async function updateGroup(id: number, payload: any) {
  const res = await fetch(`/api/groups/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新分组失败')
}

export async function deleteGroup(id: number) {
  const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('删除分组失败')
}

export async function getSSL(id: number) {
  const res = await fetch(`/api/ssl/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('网络错误')
  return res.json()
}

export async function createMonitor(payload: any) {
  const res = await fetch('/api/monitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('创建失败')
}

export async function updateMonitor(id: number, payload: any) {
  const res = await fetch(`/api/monitors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('更新失败')
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
