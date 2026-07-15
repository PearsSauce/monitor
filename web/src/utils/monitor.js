export const CHART_POINT_LIMIT = 60

export const normalizeAPIURL = (value) => {
  return (value || '').replace(/\/$/, '')
}

export const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const hostArea = (host) => {
  return String(host?.Host?.Name || '').slice(0, 2)
}

export const normalizeRegionCode = (value) => {
  const code = String(value || '').trim().slice(0, 2).toUpperCase()
  return code === 'UK' ? 'GB' : code
}

export const regionFlag = (value) => {
  const code = normalizeRegionCode(value)
  if (!/^[A-Z]{2}$/.test(code)) {
    return ''
  }
  const base = 0x1F1E6
  return String.fromCodePoint(...[...code].map((char) => base + char.charCodeAt(0) - 65))
}

export const hostOnlineStatus = (host, now, offlineWait) => {
  const timestamp = Number(host?.TimeStamp) || 0
  const waitSeconds = Number(offlineWait) || 60
  return timestamp > 0 && now - timestamp <= waitSeconds ? 1 : 0
}

export const collectHostAreas = (hosts) => {
  const areas = (Array.isArray(hosts) ? hosts : []).map(hostArea).filter(Boolean)
  return Array.from(new Set(areas))
}

export const ensureHostChartSeries = (charts, hostName) => {
  if (!charts || !hostName) {
    return createEmptyChartSeries()
  }

  const current = charts[hostName] || {}
  if (!charts[hostName]) {
    charts[hostName] = createEmptyChartSeries()
  } else {
    charts[hostName] = {
      cpu: Array.isArray(current.cpu) ? current.cpu : [],
      mem: Array.isArray(current.mem) ? current.mem : [],
      net_in: Array.isArray(current.net_in) ? current.net_in : [],
      net_out: Array.isArray(current.net_out) ? current.net_out : []
    }
  }
  return charts[hostName]
}

export const createEmptyChartSeries = () => ({
  cpu: [],
  mem: [],
  net_in: [],
  net_out: []
})

export const getHostChartSeries = (charts, hostName) => {
  return charts?.[hostName] || createEmptyChartSeries()
}

export const trimChartData = (points, limit = CHART_POINT_LIMIT) => {
  if (points.length > limit) {
    points.splice(0, points.length - limit)
  }
}

export const normalizeDisk = (disk) => {
  const source = disk && typeof disk === 'object' ? disk : {}
  return {
    ...source,
    mount: String(source.mount || source.Mount || ''),
    fs_type: String(source.fs_type || source.FSType || ''),
    total: toFiniteNumber(source.total ?? source.Total),
    used: toFiniteNumber(source.used ?? source.Used),
    free: toFiniteNumber(source.free ?? source.Free),
    used_percent: toFiniteNumber(source.used_percent ?? source.UsedPercent)
  }
}

export const normalizeHostMeta = (host) => {
  const source = host && typeof host === 'object' ? host : {}
  return {
    ...source,
    Name: String(source.Name || ''),
    Hostname: String(source.Hostname || ''),
    Platform: String(source.Platform || 'unknown'),
    PlatformVersion: String(source.PlatformVersion || ''),
    Kernel: String(source.Kernel || ''),
    Arch: String(source.Arch || ''),
    Virtualization: String(source.Virtualization || ''),
    CPU: Array.isArray(source.CPU) ? source.CPU : [],
    CPUModel: String(source.CPUModel || ''),
    PhysicalCores: toFiniteNumber(source.PhysicalCores),
    LogicalCores: toFiniteNumber(source.LogicalCores),
    MemTotal: toFiniteNumber(source.MemTotal),
    SwapTotal: toFiniteNumber(source.SwapTotal)
  }
}

export const normalizeHostState = (state) => {
  const source = state && typeof state === 'object' ? state : {}
  return {
    ...source,
    CPU: toFiniteNumber(source.CPU),
    MemUsed: toFiniteNumber(source.MemUsed),
    SwapUsed: toFiniteNumber(source.SwapUsed),
    DiskUsed: toFiniteNumber(source.DiskUsed),
    DiskTotal: toFiniteNumber(source.DiskTotal),
    Disks: Array.isArray(source.Disks) ? source.Disks.map(normalizeDisk) : [],
    NetInTransfer: toFiniteNumber(source.NetInTransfer),
    NetOutTransfer: toFiniteNumber(source.NetOutTransfer),
    NetInSpeed: toFiniteNumber(source.NetInSpeed),
    NetOutSpeed: toFiniteNumber(source.NetOutSpeed),
    DiskReadSpeed: toFiniteNumber(source.DiskReadSpeed),
    DiskWriteSpeed: toFiniteNumber(source.DiskWriteSpeed),
    TCP: toFiniteNumber(source.TCP),
    UDP: toFiniteNumber(source.UDP),
    Processes: toFiniteNumber(source.Processes),
    Load1: toFiniteNumber(source.Load1),
    Load5: toFiniteNumber(source.Load5),
    Load15: toFiniteNumber(source.Load15),
    Uptime: toFiniteNumber(source.Uptime),
    CycleNetInTransfer: toFiniteNumber(source.CycleNetInTransfer),
    CycleNetOutTransfer: toFiniteNumber(source.CycleNetOutTransfer),
    TrafficResetDay: toFiniteNumber(source.TrafficResetDay, 1),
    TrafficPeriodStart: toFiniteNumber(source.TrafficPeriodStart),
    TrafficNextReset: toFiniteNumber(source.TrafficNextReset)
  }
}

export const normalizeMonitorHost = (host, now, offlineWait, charts) => {
  const source = host && typeof host === 'object' ? host : {}
  const normalized = {
    ...source,
    Host: normalizeHostMeta(source.Host),
    State: normalizeHostState(source.State),
    TimeStamp: toFiniteNumber(source.TimeStamp)
  }

  appendHostChartPoint(charts, normalized)

  return {
    ...normalized,
    status: hostOnlineStatus(normalized, now, offlineWait)
  }
}

export const appendHostChartPoint = (charts, host, limit = CHART_POINT_LIMIT) => {
  const name = host?.Host?.Name
  if (!name) {
    return
  }

  const state = host.State || {}
  const timestamp = toFiniteNumber(host.TimeStamp) * 1000
  const series = ensureHostChartSeries(charts, name)

  series.cpu.push([timestamp, toFiniteNumber(state.CPU)])
  series.mem.push([timestamp, toFiniteNumber(state.MemUsed)])
  series.net_in.push([timestamp, toFiniteNumber(state.NetOutSpeed)])
  series.net_out.push([timestamp, toFiniteNumber(state.NetInSpeed)])

  trimChartData(series.cpu, limit)
  trimChartData(series.mem, limit)
  trimChartData(series.net_in, limit)
  trimChartData(series.net_out, limit)
}

export const normalizeMonitorHosts = (hosts, now, offlineWait, charts) => {
  const list = (Array.isArray(hosts) ? hosts : []).filter((host) => host && typeof host === 'object')
  const normalizedHosts = list
    .map((host) => normalizeMonitorHost(host, now, offlineWait, charts))
    .filter((host) => host.Host.Name)
  return {
    areas: collectHostAreas(normalizedHosts),
    hosts: normalizedHosts
  }
}
