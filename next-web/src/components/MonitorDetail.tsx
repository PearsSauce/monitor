'use client'

import { useEffect, useState } from 'react'
import { Monitor, SSLInfo } from '@/types'
import { getHistory, getSSL } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, TooltipProps } from 'recharts'
import { ExternalLink, Clock, Globe, ShieldCheck, ShieldAlert, Activity } from 'lucide-react'

interface MonitorDetailProps {
  monitor: Monitor | null
  open: boolean
  onClose: () => void
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
        <p className="mb-1 text-sm font-semibold">{data.fullTime}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">响应时间:</span>
          <span className="font-mono font-medium">{data.ms}ms</span>
        </div>
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
  const [history, setHistory] = useState<any[]>([])
  const [ssl, setSsl] = useState<SSLInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (monitor && open) {
      setLoading(true)
      // Fetch history for last 24 hours (1 day)
      Promise.all([
        getHistory(monitor.id, 1).catch(() => []),
        getSSL(monitor.id).catch(() => null)
      ]).then(([h, s]) => {
        // Format history for chart
        // Assuming h has created_at and response_ms
        const formatted = h
          .map((item: any) => {
            const d = new Date(item.created_at)
            return {
              ts: d.getTime(),
              time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fullTime: d.toLocaleString(),
              ms: item.success ? item.response_ms : null,
              success: item.success
            }
          })
          .sort((a: any, b: any) => a.ts - b.ts)
        
        setHistory(formatted)
        setSsl(s)
        setLoading(false)
      })
    }
  }, [monitor, open])

  // 计算是否有有效数据（非全失败）
  const hasValidData = history.some(h => h.success && typeof h.ms === 'number')

  if (!monitor) return null

  // Chart colors based on theme, though CSS variables are preferred if they work
  // We use CSS variables in style props for Recharts to ensure they react to theme changes
  // Note: Recharts might need explicit colors for some elements in some environments
  
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
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : history.length > 0 ? (
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
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
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
