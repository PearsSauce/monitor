export const CHART_POINT_LIMIT = 60

export const normalizeAPIURL = (value) => {
  return (value || '').replace(/\/$/, '')
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
  if (!charts[hostName]) {
    charts[hostName] = {
      cpu: [],
      mem: [],
      net_in: [],
      net_out: []
    }
  }
  return charts[hostName]
}

export const trimChartData = (points, limit = CHART_POINT_LIMIT) => {
  if (points.length > limit) {
    points.splice(0, points.length - limit)
  }
}

export const appendHostChartPoint = (charts, host, limit = CHART_POINT_LIMIT) => {
  const name = host?.Host?.Name
  if (!name) {
    return
  }

  const state = host.State || {}
  const timestamp = (Number(host.TimeStamp) || 0) * 1000
  const series = ensureHostChartSeries(charts, name)

  series.cpu.push([timestamp, Number(state.CPU) || 0])
  series.mem.push([timestamp, Number(state.MemUsed) || 0])
  series.net_in.push([timestamp, Number(state.NetOutSpeed) || 0])
  series.net_out.push([timestamp, Number(state.NetInSpeed) || 0])

  trimChartData(series.cpu, limit)
  trimChartData(series.mem, limit)
  trimChartData(series.net_in, limit)
  trimChartData(series.net_out, limit)
}

export const normalizeMonitorHosts = (hosts, now, offlineWait, charts) => {
  const list = (Array.isArray(hosts) ? hosts : []).filter((host) => host && typeof host === 'object')
  return {
    areas: collectHostAreas(list),
    hosts: list.map((host) => {
      appendHostChartPoint(charts, host)
      return {
        ...host,
        status: hostOnlineStatus(host, now, offlineWait)
      }
    })
  }
}
