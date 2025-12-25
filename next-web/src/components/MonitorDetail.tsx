'use client'

import { useEffect, useState } from 'react'
import { Monitor, SSLInfo } from '@/types'
import { getHistory, getSSL } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ExternalLink, Clock, Globe, ShieldCheck, ShieldAlert, Activity } from 'lucide-react'

interface MonitorDetailProps {
  monitor: Monitor | null
  open: boolean
  onClose: () => void
}

interface ApiHistoryItem {
  created_at?: string
  checked_at?: string
  success?: boolean
  online?: boolean
  response_ms?: number
}

interface AggPoint {
  ts: number
  time: string
  fullTime: string
  ms: number | null
  success: boolean
  p95?: number
  p99?: number
  min?: number
  max?: number
  count?: number
  failures?: number
}

function percentile(values: number[], p: number): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

interface RawPoint {
  ts: number
  time: string
  fullTime: string
  ms: number | null
  success: boolean
}

function aggregateHistory(items: RawPoint[], intervalMinutes = 5): AggPoint[] {
  const intervalMs = intervalMinutes * 60 * 1000
  const buckets: Record<number, { times: number[]; successes: number[]; count: number; failures: number }> = {}
  for (const it of items) {
    const key = Math.floor(it.ts / intervalMs) * intervalMs
    if (!buckets[key]) buckets[key] = { times: [], successes: [], count: 0, failures: 0 }
    buckets[key].count += 1
    buckets[key].times.push(it.ts)
    if (typeof it.ms === 'number') buckets[key].successes.push(it.ms)
    else buckets[key].failures += 1
  }
  const result: AggPoint[] = Object.keys(buckets)
    .map(k => Number(k))
    .sort((a, b) => a - b)
    .map(ts => {
      const b = buckets[ts]
      const avg = b.successes.length ? Math.round(b.successes.reduce((s, v) => s + v, 0) / b.successes.length) : null
      const p95 = percentile(b.successes, 95)
      const p99 = percentile(b.successes, 99)
      const min = b.successes.length ? Math.min(...b.successes) : null
      const max = b.successes.length ? Math.max(...b.successes) : null
      const d = new Date(ts)
      return {
        ts,
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTime: d.toLocaleString(),
        ms: avg,
        success: !!b.successes.length,
        p95: p95 ?? undefined,
        p99: p99 ?? undefined,
        min: min ?? undefined,
        max: max ?? undefined,
        count: b.count,
        failures: b.failures,
      }
    })
  return result
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: AggPoint }[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
        <p className="mb-1 text-sm font-semibold">{data.fullTime}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">响应时间:</span>
          <span className="font-mono font-medium">{data.ms}ms</span>
        </div>
        {typeof data.p95 === 'number' && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">P95:</span>
            <span className="font-mono font-medium">{data.p95}ms</span>
          </div>
        )}
        {typeof data.p99 === 'number' && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">P99:</span>
            <span className="font-mono font-medium">{data.p99}ms</span>
          </div>
        )}
        {typeof data.count === 'number' && (
          <div className="pt-1 mt-1 border-t text-[10px] text-muted-foreground">
            5分钟时段统计 (样本: {data.count})
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">状态:</span>
          <Badge variant={data.success ? "default" : "destructive"} className={`h-5 px-1.5 text-[10px] ${data.success ? "bg-green-600" : ""}`}>
            {data.success ? '正常' : '异常'}
          </Badge>
        </div>
      </div>
    )
  }
  return null
}

export function MonitorDetail({ monitor, open, onClose }: MonitorDetailProps) {
  type ChartPoint = AggPoint | RawPoint
  const [history, setHistory] = useState<ChartPoint[]>([])
  const [ssl, setSsl] = useState<SSLInfo | null>(null)

  useEffect(() => {
    if (monitor && open) {
      Promise.all([
        getHistory(monitor.id, 1).catch(() => []),
        getSSL(monitor.id).catch(() => null)
      ]).then(([h, s]) => {
        const formatted: RawPoint[] = (Array.isArray(h) ? h : [])
          .map((item: ApiHistoryItem) => {
            const dateStr = item.created_at ?? item.checked_at ?? ''
            const d = new Date(dateStr)
            const ok = typeof item.success === 'boolean' ? item.success : !!item.online
            const msVal = ok && typeof item.response_ms === 'number' ? item.response_ms : null
            return {
              ts: d.getTime(),
              time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fullTime: d.toLocaleString(),
              ms: msVal,
              success: ok
            }
          })
          .sort((a, b) => a.ts - b.ts)
        const aggregated = aggregateHistory(formatted, 5)
        const hasAgg = aggregated.some(pt => typeof pt.ms === 'number')
        const hasRaw = formatted.some(pt => typeof pt.ms === 'number')
        const chartData: ChartPoint[] = hasAgg ? aggregated : hasRaw ? formatted : []
        setHistory(chartData)
        setSsl(s)
      })
    }
  }, [monitor, open])

  const hasValidData = history.some(h => typeof h.ms === 'number')

  if (!monitor) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">{monitor.name}</DialogTitle>
              <Badge variant={monitor.last_online ? "default" : "destructive"} className={monitor.last_online ? "bg-green-600" : ""}>
                {monitor.last_online ? '在线' : '离线'}
              </Badge>
            </div>
          </div>
          <DialogDescription className="hidden">Monitor Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-muted-foreground">URL</p>
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{monitor.url}</span>
                  <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">最近检查</p>
                <p className="font-medium">
                  {monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleString() : '从未'}
                </p>
              </div>
            </div>

            {ssl && (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50 md:col-span-2">
                {(ssl.days_left ?? 0) > 7 ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">SSL 证书</p>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{ssl.issuer || 'Unknown'}</span>
                    <span className="text-sm text-muted-foreground">剩余 {ssl.days_left ?? '-'} 天</span>
                    {ssl.expires_at && <span className="text-xs text-muted-foreground">({new Date(ssl.expires_at).toLocaleDateString()})</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Response Time Chart */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>响应时间 (24h)</span>
            </div>
            <div className="h-[250px] w-full rounded-lg border p-4 bg-card">
              {history.length > 0 ? (
                hasValidData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}ms`}
                        width={50}
                        domain={[0, 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="ms"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
                        connectNulls={true}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Activity className="h-8 w-8 opacity-20" />
                    <span className="text-sm">该时间段内无成功响应数据</span>
                  </div>
                )
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Activity className="h-8 w-8 opacity-20" />
                  <span className="text-sm">暂无监控数据</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
