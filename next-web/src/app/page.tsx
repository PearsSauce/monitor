'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Monitor, Group, SSLInfo, NotificationItem } from '@/types'
import { getMonitors, getGroups, getSSL, getNotifications, getLatestResult, getSetupState, getSettings, API_BASE, getToken } from '@/lib/api'
import { NotificationTicker } from '@/components/NotificationTicker'
import { MonitorList } from '@/components/MonitorList'
import { MonitorDetail } from '@/components/MonitorDetail'
import { SubscribeModal } from '@/components/SubscribeModal'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Monitor as MonitorIcon, CheckCircle, XCircle, Clock, Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

// Simple theme management if next-themes not installed, but I'll assume I should use class manipulation or install next-themes. 
// shadcn usually uses next-themes. I'll install it.

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Monitor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [sslMap, setSslMap] = useState<Record<number, SSLInfo>>({})
  const [latest, setLatest] = useState<Record<number, number>>({})
  const [notices, setNotices] = useState<NotificationItem[]>([])
  const [noticeTotal, setNoticeTotal] = useState(0)
  const [siteName, setSiteName] = useState('服务监控面板')
  const [subtitle, setSubtitle] = useState('')
  const [showUnifiedSubscribe, setShowUnifiedSubscribe] = useState(false)
  const [detailMonitor, setDetailMonitor] = useState<Monitor | null>(null)
  const sseBufferRef = useRef<{ latest: Record<number, number>; list: Record<number, { online: boolean; checked_at: string }>; notices: NotificationItem[] }>({ latest: {}, list: {}, notices: [] })
  const sseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const listRef = useRef(list)

  useEffect(() => {
    listRef.current = list
  }, [list])

  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getMonitors()
      setList(Array.isArray(data) ? data : [])
      const gs = await getGroups()
      setGroups(Array.isArray(gs) ? gs : [])
      
      const sslEntries: Record<number, SSLInfo> = {}
      await Promise.all((Array.isArray(data) ? data : []).map(async (m: Monitor) => { 
        sslEntries[m.id] = await getSSL(m.id).catch(()=>null) 
      }))
      setSslMap(sslEntries)
      
      const nsRes = await getNotifications(1, 20).catch(()=>({ items: [], total: 0 }))
      setNotices(nsRes.items || [])
      setNoticeTotal(nsRes.total || 0)
      
      const latestMap: Record<number, number> = {}
      await Promise.all((Array.isArray(data) ? data : []).map(async (m: Monitor) => {
        const lr = await getLatestResult(m.id).catch(()=>null)
        if (lr && typeof lr.response_ms === 'number') latestMap[m.id] = lr.response_ms
      }))
      setLatest(latestMap)
    } catch (e: any) {
      console.error(e)
      toast.error("获取数据失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSetupState().then(s => { 
      if (s.installed) fetchData() 
    }).catch(()=>fetchData())
    
    getSettings().then(s => {
      setSiteName(s.site_name || '服务监控面板')
      setSubtitle(s.subtitle || '')
      if (s.tab_subtitle) document.title = `${s.site_name} - ${s.tab_subtitle}`
      else document.title = s.site_name
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    const es = new EventSource(`/api/events`) // Proxy handles /api
    es.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        const b = sseBufferRef.current
        b.latest[ev.MonitorID] = ev.ResponseMs
        b.list[ev.MonitorID] = { online: !!ev.Online, checked_at: new Date(ev.CheckedAt).toISOString() }
        
        if (ev.EventType === 'status_change' || ev.EventType === 'ssl_expiry') {
          const name = ev.MonitorName || (listRef.current.find(m=>m.id===ev.MonitorID)?.name) || ''
          b.notices.unshift({
            id: Date.now(),
            monitor_id: ev.MonitorID,
            created_at: new Date(ev.CheckedAt).toISOString(),
            type: ev.EventType,
            message: ev.Message || '',
            monitor_name: name
          })
          if (b.notices.length > 50) b.notices.length = 50
        }
        
        if (!sseTimerRef.current) {
          sseTimerRef.current = setTimeout(() => {
            const buf = sseBufferRef.current
            if (Object.keys(buf.list).length) {
              setList(prev => prev.map(m => {
                const u = buf.list[m.id]
                return u ? { ...m, last_online: u.online, last_checked_at: u.checked_at } : m
              }))
            }
            if (Object.keys(buf.latest).length) {
              setLatest(prev => {
                const next = { ...prev }
                for (const k of Object.keys(buf.latest)) next[Number(k)] = buf.latest[Number(k)]
                return next
              })
            }
            if (buf.notices.length) {
              setNotices(prev => [...buf.notices, ...prev].slice(0, 50))
            }
            sseBufferRef.current = { latest: {}, list: {}, notices: [] }
            sseTimerRef.current = null
          }, 1000)
        }
      } catch {}
    }
    return () => {
      console.log('SSE Cleanup')
      es.close()
      if (sseTimerRef.current) {
        clearTimeout(sseTimerRef.current)
        sseTimerRef.current = null
      }
    }
  }, [])

  const totalCount = list.length
  const onlineCount = list.filter(i => !!i.last_online).length
  const offlineCount = Math.max(totalCount - onlineCount, 0)
  
  const avgRespAll = useMemo(() => {
    const values = Object.entries(latest).map(([id,v]) => ({ id: Number(id), v }))
    const used = values.filter(x => typeof x.v === 'number' && x.v >= 0)
    if (!used.length) return '-'
    const sum = used.reduce((s, x) => s + x.v, 0)
    return Math.round(sum / used.length)
  }, [latest])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-slate-200 dark:border-neutral-800 px-4 md:px-6 h-16 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3 group cursor-default">
            <img src="/img/favicon.svg" alt="logo" className="w-8 h-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 dark:text-neutral-200 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 m-0 leading-none">{siteName}</h1>
              {subtitle && <span className="text-slate-500 dark:text-neutral-400 text-xs mt-1 hidden sm:block">{subtitle}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              {mounted && (
                <>
                  <Switch checked={resolvedTheme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
                  {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </>
              )}
            </div>
            <Link href={mounted && getToken() ? '/admin' : '/login'}>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-4">
        <div className="w-full max-w-screen-xl mx-auto space-y-4">
          <NotificationTicker notices={notices} loading={loading} onClick={() => {}} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground">总站点数</p>
                  <div className="text-3xl md:text-4xl mt-2 font-bold">
                    {loading ? <Skeleton className="h-9 w-24" /> : <AnimatedCounter value={totalCount} />}
                  </div>
                </div>
                <MonitorIcon className="absolute -right-4 -bottom-4 text-8xl text-blue-500 opacity-10 transform rotate-12" />
              </CardContent>
            </Card>
            <Card className="hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground">在线站点</p>
                  <div className="text-3xl md:text-4xl mt-2 font-bold text-green-600">
                    {loading ? <Skeleton className="h-9 w-24" /> : <AnimatedCounter value={onlineCount} />}
                  </div>
                </div>
                <CheckCircle className="absolute -right-4 -bottom-4 text-8xl text-green-500 opacity-10 transform rotate-12" />
              </CardContent>
            </Card>
            <Card className="hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground">离线站点</p>
                  <div className="text-3xl md:text-4xl mt-2 font-bold text-red-600">
                    {loading ? <Skeleton className="h-9 w-24" /> : <AnimatedCounter value={offlineCount} />}
                  </div>
                </div>
                <XCircle className="absolute -right-4 -bottom-4 text-8xl text-red-500 opacity-10 transform rotate-12" />
              </CardContent>
            </Card>
            <Card className="hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground">平均响应</p>
                  <div className="text-3xl md:text-4xl mt-2 font-bold text-indigo-600">
                    {loading ? <Skeleton className="h-9 w-24" /> : <AnimatedCounter value={avgRespAll} suffix=" ms" />}
                  </div>
                </div>
                <Clock className="absolute -right-4 -bottom-4 text-8xl text-indigo-500 opacity-10 transform rotate-12" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>监控列表</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowUnifiedSubscribe(true)}>统一订阅</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MonitorList 
                monitors={list} 
                groups={groups} 
                latest={latest} 
                sslMap={sslMap} 
                loading={loading}
                onDetail={(m) => setDetailMonitor(m)}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <MonitorDetail 
        monitor={detailMonitor} 
        open={!!detailMonitor} 
        onClose={() => setDetailMonitor(null)} 
      />

      <SubscribeModal
        visible={showUnifiedSubscribe}
        onClose={() => setShowUnifiedSubscribe(false)}
        monitor={null}
        monitors={list}
      />
    </div>
  )
}
