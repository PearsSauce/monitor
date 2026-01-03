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
import { Monitor as MonitorIcon, CheckCircle, XCircle, Clock, Moon, Sun, User, BellRing, Github } from 'lucide-react'
import { SystemStatus } from '@/components/SystemStatus'
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
  const [sslMap, setSslMap] = useState<Record<number, SSLInfo | null>>({})
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
      
      const sslEntries: Record<number, SSLInfo | null> = {}
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
    const used = values.filter(x => typeof x.v === 'number' && x.v > 0)
    if (!used.length) return '-'
    const sum = used.reduce((s, x) => s + x.v, 0)
    return Math.round(sum / used.length)
  }, [latest])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black transition-colors duration-300">
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-neutral-800 px-4 md:px-6 h-16 sticky top-0 z-50 transition-colors duration-300">
        <style jsx>{`
          @keyframes titleIn {
            0% { opacity: 0; transform: translateY(6px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes subtitleIn {
            0% { opacity: 0; transform: translateX(-6px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-title-in { animation: titleIn 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
          .animate-subtitle-in { animation: subtitleIn 600ms 120ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        `}</style>
        <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3 group cursor-default">
            <img src="/img/favicon.svg" alt="logo" className="w-8 h-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
            <div className="flex flex-col">
              <h1 className="animate-title-in text-lg font-bold tracking-tight text-slate-800 dark:text-neutral-200 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 m-0 leading-none">
                {siteName}
              </h1>
              {subtitle && (
                <span className="animate-subtitle-in subtitle-quote hidden sm:block text-slate-500 dark:text-neutral-400 text-xs leading-5 tracking-wide pl-8">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              {mounted && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
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
          <NotificationTicker notices={notices} loading={loading} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md hover:bg-accent/5 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总站点数</CardTitle>
                <MonitorIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-24" /> : <AnimatedCounter value={totalCount} />}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md hover:bg-accent/5 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">在线站点</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? <Skeleton className="h-8 w-24" /> : <AnimatedCounter value={onlineCount} />}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md hover:bg-accent/5 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">离线站点</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loading ? <Skeleton className="h-8 w-24" /> : <AnimatedCounter value={offlineCount} />}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md hover:bg-accent/5 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均响应</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {loading ? <Skeleton className="h-8 w-24" /> : <AnimatedCounter value={avgRespAll} suffix=" ms" />}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>监控列表</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowUnifiedSubscribe(true)} className="gap-2">
                    <BellRing className="h-4 w-4" />
                    统一订阅
                  </Button>
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

      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm mt-auto">
        <div className="w-full max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-0 md:h-16 flex flex-col-reverse md:flex-row items-center justify-between text-sm text-muted-foreground gap-4 md:gap-0">
          <div className="flex items-center gap-4 text-xs md:text-sm text-center md:text-left opacity-80 md:opacity-100">
            <span>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="https://github.com/PearsSauce/monitor" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5 group">
              <Github className="h-4 w-4 text-slate-500 group-hover:text-foreground transition-colors" />
              <span className="font-medium">GitHub</span>
            </Link>
            <SystemStatus />
          </div>
        </div>
      </footer>

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
