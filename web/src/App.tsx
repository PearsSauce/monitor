import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Button, Card, Divider, Drawer, Form, Grid, Input, InputNumber, Message, Modal, Select, Space, Switch, Table, Tag, Typography, Layout, Menu, Breadcrumb, Avatar, Dropdown, Checkbox } from '@arco-design/web-react'
import { IconMoonFill, IconSun, IconArrowLeft, IconDesktop, IconCheckCircle, IconCloseCircle, IconClockCircle, IconHome, IconNotification, IconUser, IconLaunch } from '@arco-design/web-react/icon'
import { createGroup, createMonitor, deleteGroup, getGroups, getHistory, getHistoryByDay, getMonitors, getSSL, getSetupState, postSetup, updateGroup, updateMonitor, getSettings, updateSettings, getNotifications, getLatestResult, login, getToken, API_BASE } from './api'
// 移除趋势与分布图组件
import { NotificationTicker } from './components/NotificationTicker'
import useTheme from './useTheme'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const AnimatedCounter = ({ value, className, suffix }: { value: number | string, className?: string, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null)
  
  const { num, unit } = useMemo(() => {
    if (typeof value === 'number') return { num: value, unit: suffix || '' }
    const str = String(value)
    const n = parseFloat(str)
    if (isNaN(n)) return { num: null, unit: '' }
    const u = suffix || str.replace(String(n), '')
    return { num: n, unit: u }
  }, [value, suffix])

  const isNum = num !== null
  
  useGSAP(() => {
    if (isNum && ref.current) {
      gsap.from(ref.current, {
        textContent: 0,
        duration: 2,
        ease: 'power3.out',
        snap: { textContent: 1 }
      })
    }
  }, [num])

  return (
    <div className={className}>
      <span ref={ref}>{isNum ? num : value}</span>{isNum ? unit : ''}
    </div>
  )
}

type Monitor = {
  id: number
  name: string
  url: string
  method: string
  headers_json: string
  body: string
  expected_status_min: number
  expected_status_max: number
  keyword: string
  group_id?: number
  interval_seconds: number
  last_online?: boolean
  last_checked_at?: string
}

type HistoryItem = {
  checked_at: string
  online: boolean
  status_code: number
  response_ms: number
  error?: string
}
type Group = { id:number; name:string; icon?:string; color?:string }
type SSLInfo = { expires_at?:string; issuer?:string; days_left?:number } | null
type NotificationItem = { id:number; monitor_id:number; created_at:string; type:string; message:string; monitor_name:string }

export default function App() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Monitor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupFilter, setGroupFilter] = useState<number | 'all'>('all')
  const [sslMap, setSslMap] = useState<Record<number, SSLInfo>>({})
  const [latest, setLatest] = useState<Record<number, number>>({})
  const [showDetail, setShowDetail] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const { dark, setDark } = useTheme()
  const [showLogin, setShowLogin] = useState(false)
  const [needSetup, setNeedSetup] = useState(false)
  const [notices, setNotices] = useState<NotificationItem[]>([])
  const [noticeTotal, setNoticeTotal] = useState(0)
  const [noticePage, setNoticePage] = useState(1)
  const [noticePageSize, setNoticePageSize] = useState(20)
  const [noticeFilter, setNoticeFilter] = useState('all')
  const [view, setView] = useState<'dashboard' | 'notifications'>('dashboard')
  const [siteName, setSiteName] = useState('服务监控面板')
  const [tabSubtitle, setTabSubtitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [showSubscribe, setShowSubscribe] = useState(false)
  const [subTarget, setSubTarget] = useState<Monitor | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const sseBufferRef = useRef<{ latest: Record<number, number>; list: Record<number, { online: boolean; checked_at: string }>; notices: NotificationItem[] }>({ latest: {}, list: {}, notices: [] })
  const sseTimerRef = useRef<number | null>(null)

  useGSAP(() => {
    const tl = gsap.timeline()
    
    tl.from('.gsap-stat-card', {
      y: 50,
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      clearProps: 'all'
    })
    
    tl.from('.gsap-card-icon', {
      scale: 0,
      rotation: -45,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.5)',
      clearProps: 'all'
    }, '<0.2')

    tl.from('.gsap-table-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'all'
    }, '-=0.4')
  }, { scope: containerRef, dependencies: [view] })

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getMonitors()
      setList(Array.isArray(data) ? data : [])
      const gs = await getGroups()
      setGroups(Array.isArray(gs) ? gs : [])
      const sslEntries: Record<number, SSLInfo> = {}
      await Promise.all((Array.isArray(data) ? data : []).map(async (m:Monitor) => { sslEntries[m.id] = await getSSL(m.id).catch(()=>null) }))
      setSslMap(sslEntries)
      const nsRes = await getNotifications(1, 20).catch(()=>({ items: [], total: 0 }))
      setNotices(nsRes.items)
      setNoticeTotal(nsRes.total)
      const latestMap: Record<number, number> = {}
      await Promise.all((Array.isArray(data) ? data : []).map(async (m:Monitor) => {
        const lr = await getLatestResult(m.id).catch(()=>null)
        if (lr && typeof lr.response_ms === 'number') latestMap[m.id] = lr.response_ms
      }))
      setLatest(latestMap)
    } catch (e: any) {
      Message.error(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSetupState().then(s=> { setNeedSetup(!s.installed); if (s.installed) fetchData() }).catch(()=>fetchData())
    getSettings().then(s => {
      const name = s.site_name || '服务监控面板'
      setSiteName(name)
      setSubtitle(s.subtitle || '')
      setTabSubtitle(s.tab_subtitle || '')
      const t = tabSubtitle ? `${name} - ${s.tab_subtitle}` : name
      if (typeof document !== 'undefined') document.title = t
    }).catch(()=>{})
  }, [])
  useEffect(() => {
    const es = new EventSource(`${API_BASE}/api/events`)
    es.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        const b = sseBufferRef.current
        b.latest[ev.MonitorID] = ev.ResponseMs
        b.list[ev.MonitorID] = { online: !!ev.Online, checked_at: new Date(ev.CheckedAt).toISOString() }
        if (ev.EventType === 'status_change' || ev.EventType === 'ssl_expiry') {
          const name = ev.MonitorName || (list.find(m=>m.id===ev.MonitorID)?.name) || ''
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
          sseTimerRef.current = window.setTimeout(() => {
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
            if (sseTimerRef.current) {
              window.clearTimeout(sseTimerRef.current)
              sseTimerRef.current = null
            }
          }, 1000)
        }
      } catch {}
    }
    return () => {
      es.close()
      if (sseTimerRef.current) {
        window.clearTimeout(sseTimerRef.current)
        sseTimerRef.current = null
      }
      sseBufferRef.current = { latest: {}, list: {}, notices: [] }
    }
  }, [])

  const filtered = useMemo(() => {
    if (groupFilter === 'all') return list
    return list.filter(i => i.group_id === groupFilter)
  }, [list, groupFilter])
  const totalCount = useMemo(() => list.length, [list])
  const onlineCount = useMemo(() => list.filter(i => !!i.last_online).length, [list])
  const offlineCount = useMemo(() => Math.max(totalCount - onlineCount, 0), [totalCount, onlineCount])
  const avgRespAll = useMemo(() => {
    const values = Object.entries(latest).map(([id,v]) => ({ id: Number(id), v }))
    const used = values.filter(x => typeof x.v === 'number' && x.v >= 0)
    if (!used.length) return '-'
    const sum = used.reduce((s, x) => s + x.v, 0)
    return `${Math.round(sum / used.length)} ms`
  }, [latest])

  // 移除当前响应分布计算

  const columns = [
    { title: '名称', dataIndex: 'name' },
    {
      title: '状态',
      align: 'center' as const,
      render: (_: any, r: Monitor) => (
        <Tag color={r.last_online ? 'green' : 'red'}>{r.last_online ? '在线' : '离线'}</Tag>
      )
    },
    {
      title: 'URL',
      dataIndex: 'url',
      render: (url: string) => (
        <Space>
          <span>{url}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center">
            <IconLaunch />
          </a>
        </Space>
      )
    },
    {
      title: '分组',
      align: 'center' as const,
      render: (_: any, r: Monitor) => {
        const g = groups.find(x => x.id === r.group_id)
        if (!g) return '-'
        return <Tag style={{ backgroundColor: g.color || undefined, color: g.color ? '#fff' : undefined }}>{g.icon ? `${g.icon} ` : ''}{g.name}</Tag>
      }
    },
    {
      title: '响应',
      align: 'center' as const,
      render: (_: any, r: Monitor) => (
        <span className="inline-flex items-center justify-center">
          {typeof latest[r.id] === 'number' ? `${latest[r.id]} ms` : '-'}
        </span>
      )
    },
    {
      title: '30天状态',
      align: 'center' as const,
      render: (_: any, r: Monitor) => <StatusBar monitorId={r.id} />
    },
    {
      title: 'SSL剩余',
      align: 'center' as const,
      render: (_: any, r: Monitor) => {
        const info = sslMap[r.id]
        if (!info) return '-'
        return <span>{typeof info.days_left === 'number' ? `${info.days_left}天` : '-'}</span>
      }
    },
    {
      title: '最近检查',
      render: (_: any, r: Monitor) => (r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : '-')
    },
    {
      title: '操作',
      render: (_: any, r: Monitor) => (
        <Space>
          <Button size="mini" onClick={() => { setDetailId(r.id); setShowDetail(true) }}>详情</Button>
          <Button size="mini" onClick={() => { setSubTarget(r); setShowSubscribe(true) }}>订阅</Button>
        </Space>
      )
    },
  ]

  return (
    <Layout className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      <Layout.Header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-slate-200 dark:border-neutral-800 px-4 md:px-6 h-16 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3 group cursor-default">
            <img src="/img/favicon.svg" alt="logo" className="w-8 h-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
            <div className="flex flex-col">
              <Typography.Title heading={5} className="!m-0 !text-slate-800 dark:!text-neutral-200 animate-fade-in-up transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{siteName}</Typography.Title>
              {subtitle ? <Typography.Text className="text-slate-500 dark:text-neutral-400 text-xs animate-fade-in-up delay-200 ml-8 hidden sm:block">{subtitle}</Typography.Text> : null}
            </div>
          </div>
          <Space size="medium">
            <Select style={{ width: 160 }} placeholder="分组筛选" value={groupFilter} onChange={setGroupFilter} allowClear triggerProps={{ autoAlignPopupWidth: false, autoAlignPopupMinWidth: true, position: 'bl' }} className="hidden sm:inline-flex">
              <Select.Option value={'all' as any}>全部项目</Select.Option>
              {(groups || []).map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}
            </Select>
            <Switch checked={dark} onChange={setDark} checkedIcon={<IconMoonFill />} uncheckedIcon={<IconSun />} />
            <Button type="primary" onClick={() => {
              if (getToken()) window.location.href = '/admin'
              else setShowLogin(true)
            }} icon={<IconUser />}>
              <span className="hidden md:inline">管理员</span>登录
            </Button>
          </Space>
        </div>
      </Layout.Header>
      
      <Layout className="px-4 md:px-6 py-4">
        {view === 'dashboard' ? (
          <Layout.Content>
            <div className="w-full max-w-screen-xl mx-auto" ref={containerRef}>
            <div className="mb-4">
               <NotificationTicker notices={notices} onClick={() => setView('notifications')} isDark={dark} />
            </div>
            
            <Grid.Row gutter={[16, 16]}>
              <Grid.Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Card className="gsap-stat-card h-32 relative overflow-hidden group rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-neutral-900/50">
                  <div className="relative z-10">
                    <Typography.Text className="text-slate-500 dark:text-neutral-400 font-medium">总站点数</Typography.Text>
                    <AnimatedCounter value={totalCount} className="text-3xl md:text-4xl mt-2 font-bold text-slate-800 dark:text-neutral-200" />
                  </div>
                  <IconDesktop className="gsap-card-icon absolute -right-4 -bottom-4 text-8xl text-blue-500 dark:text-blue-400 opacity-10 transform rotate-12 transition-all duration-500 group-hover:scale-110 group-hover:rotate-0 group-hover:opacity-20" />
                </Card>
              </Grid.Col>
              <Grid.Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Card className="gsap-stat-card h-32 relative overflow-hidden group rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-neutral-900/50">
                  <div className="relative z-10">
                    <Typography.Text className="text-slate-500 dark:text-neutral-400 font-medium">在线站点</Typography.Text>
                    <AnimatedCounter value={onlineCount} className="text-3xl md:text-4xl mt-2 font-bold text-green-600 dark:text-green-400" />
                  </div>
                  <IconCheckCircle className="gsap-card-icon absolute -right-4 -bottom-4 text-8xl text-green-500 dark:text-green-400 opacity-10 transform rotate-12 transition-all duration-500 group-hover:scale-110 group-hover:rotate-0 group-hover:opacity-20" />
                </Card>
              </Grid.Col>
              <Grid.Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Card className="gsap-stat-card h-32 relative overflow-hidden group rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-neutral-900/50">
                  <div className="relative z-10">
                    <Typography.Text className="text-slate-500 dark:text-neutral-400 font-medium">离线站点</Typography.Text>
                    <AnimatedCounter value={offlineCount} className="text-3xl md:text-4xl mt-2 font-bold text-red-600 dark:text-red-400" />
                  </div>
                  <IconCloseCircle className="gsap-card-icon absolute -right-4 -bottom-4 text-8xl text-red-500 dark:text-red-400 opacity-10 transform rotate-12 transition-all duration-500 group-hover:scale-110 group-hover:rotate-0 group-hover:opacity-20" />
                </Card>
              </Grid.Col>
              <Grid.Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Card className="gsap-stat-card h-32 relative overflow-hidden group rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-neutral-900/50">
                  <div className="relative z-10">
                    <Typography.Text className="text-slate-500 dark:text-neutral-400 font-medium">平均响应</Typography.Text>
                    <AnimatedCounter value={avgRespAll} className="text-3xl md:text-4xl mt-2 font-bold text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <IconClockCircle className="gsap-card-icon absolute -right-4 -bottom-4 text-8xl text-indigo-500 dark:text-indigo-400 opacity-10 transform rotate-12 transition-all duration-500 group-hover:scale-110 group-hover:rotate-0 group-hover:opacity-20" />
                </Card>
              </Grid.Col>
            </Grid.Row>
            
            {/* 已移除 24小时响应趋势 与 当前响应分布 */}
    
            <Card className="gsap-table-card mt-4 rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60" title="监控列表">
              <Table rowKey="id" columns={columns as any} data={filtered} pagination={false} border={false} scroll={{ x: 1000 }} />
            </Card>
            </div>
          </Layout.Content>
        ) : (
          <Layout.Content>
            <div className="w-full max-w-screen-xl mx-auto">
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item onClick={() => setView('dashboard')} className="cursor-pointer"><IconHome /> 首页</Breadcrumb.Item>
              <Breadcrumb.Item>异常通知历史</Breadcrumb.Item>
            </Breadcrumb>
            <Card 
              className="rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60"
              title={
                <div className="flex items-center justify-between">
                  <Space>
                    <Button icon={<IconArrowLeft />} onClick={() => setView('dashboard')} shape="circle" />
                    <Typography.Text className="dark:text-neutral-200">异常通知历史</Typography.Text>
                  </Space>
                  <Select 
                    style={{ width: 140 }} 
                    value={noticeFilter} 
                    onChange={(v) => {
                      setNoticeFilter(v);
                      setNoticePage(1);
                      getNotifications(1, noticePageSize, v === 'all' ? '' : v).then(res => {
                        setNotices(res.items);
                        setNoticeTotal(res.total);
                      });
                    }}
                    triggerProps={{ autoAlignPopupWidth: false, autoAlignPopupMinWidth: true, position: 'bl' }}
                  >
                    <Select.Option value="all">全部类型</Select.Option>
                    <Select.Option value="offline">站点离线</Select.Option>
                    <Select.Option value="recovery">站点恢复</Select.Option>
                    <Select.Option value="ssl_expiry">证书到期</Select.Option>
                  </Select>
                </div>
              }
            >
              <Table 
                rowKey="id" 
                data={notices} 
                pagination={{ 
                  current: noticePage,
                  pageSize: noticePageSize,
                  total: noticeTotal,
                  showTotal: (total) => `共 ${total} 条`,
                  onChange: (page, size) => {
                    setNoticePage(page)
                    setNoticePageSize(size)
                    getNotifications(page, size, noticeFilter === 'all' ? '' : noticeFilter).then(res => {
                      setNotices(res.items)
                      setNoticeTotal(res.total)
                    }).catch(() => Message.error('获取通知失败'))
                  }
                }} 
                scroll={{ x: 800 }}
                columns={[
                  { title: '时间', dataIndex: 'created_at', width: 180,
                    render: (v:any)=> (v ? new Date(v).toLocaleString() : '-') },
                  { title: '站点', dataIndex: 'monitor_name', width: 180 },
                  { title: '类型', dataIndex: 'type', width: 100, align: 'center',
                    render: (v:any, r:any)=> {
                      let color = 'arcoblue'
                      let text = v
                      if (v === 'status_change') {
                        const msg = (r.message || '').toLowerCase()
                        const isRecovery = msg.includes('恢复') || msg.includes('online') || msg.includes('up') || msg.includes('ok')
                        color = isRecovery ? 'green' : 'red'
                        text = isRecovery ? '站点恢复' : '站点离线'
                      } else if (v === 'ssl_expiry') {
                        color = 'orange'
                        text = '证书到期'
                      }
                      return <Tag color={color}>{text}</Tag> 
                    }
                  },
                  { title: '消息详情', dataIndex: 'message',
                    render: (v: string) => {
                      const match = v.match(/[，,]\s*状态码=(\d+)[，,]\s*错误=(.*)/)
                      if (match) {
                        const code = parseInt(match[1])
                        const err = match[2]
                        return (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                {code > 0 && <Tag size="small" color={code >= 200 && code < 300 ? 'green' : 'red'}>HTTP {code}</Tag>}
                                {code === 0 && <Tag size="small" color="red">连接失败</Tag>}
                            </div>
                            {err ? (
                                <Typography.Paragraph ellipsis={{ rows: 2, showTooltip: true, expandable: true }} className="!m-0 text-xs text-slate-500 dark:text-neutral-400">
                                  {err}
                                </Typography.Paragraph>
                            ) : null}
                          </div>
                        )
                      }
                      return (
                       <Typography.Paragraph ellipsis={{ rows: 2, showTooltip: true, expandable: true }} style={{ margin: 0 }}>
                         {v}
                       </Typography.Paragraph>
                      )
                    }
                  }
                ] as any} 
              />
            </Card>
            </div>
          </Layout.Content>
        )}
        <Layout.Footer className="text-center text-slate-500 dark:text-neutral-500 text-sm py-8">
          Monitor System &copy; {new Date().getFullYear()} Created with <a href="https://arco.design" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-500 transition-colors">Arco Design</a>
        </Layout.Footer>
      </Layout>

      {showDetail && detailId !== null && <DetailDrawer id={detailId} onClose={() => setShowDetail(false)} />}
      {showSubscribe && subTarget && <SubscribeModal visible={showSubscribe} onClose={() => setShowSubscribe(false)} monitor={subTarget} />}
      {needSetup && <SetupWizard onDone={async () => { setNeedSetup(false); await fetchData() }} />}
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} />}
    </Layout>
  )
}

function AvgResponse({ monitorId }: { monitorId: number }) {
  const [items, setItems] = useState<HistoryItem[]>([])
  useEffect(() => {
    const days = typeof localStorage !== 'undefined' ? Number(localStorage.getItem('HISTORY_DAYS') || '30') : 30
    getHistory(monitorId, days).then(setItems).catch(() => {})
  }, [monitorId])
  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        if (ev.MonitorID === monitorId) {
          const hi: HistoryItem = { checked_at: ev.CheckedAt, online: ev.Online, status_code: ev.StatusCode, response_ms: ev.ResponseMs, error: ev.Error }
          setItems(prev => [hi, ...prev].slice(0, 300))
        }
      } catch {}
    }
    return () => { es.close() }
  }, [monitorId])
  const avg = useMemo(() => {
    if (!items.length) return '-'
    const ms = items.filter(i => i.online).reduce((sum, i) => sum + i.response_ms, 0)
    const count = items.filter(i => i.online).length
    if (!count) return '-'
    return `${Math.round(ms / count)} ms`
  }, [items])
  return <span>{avg}</span>
}

function StatusBar({ monitorId }: { monitorId: number }) {
  const [items, setItems] = useState<DayAgg[]>([])
  useEffect(() => {
    getHistoryByDay(monitorId, 30).then(setItems).catch(() => {})
  }, [monitorId])
  const blocks = useMemo(() => {
    const days = (items || [])
      .slice(0, 30)
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
    return days.map((i, idx) => {
      const ratio = i.total_count ? i.online_count / i.total_count : 0
      let color = 'bg-red-500'
      if (ratio >= 0.9) color = 'bg-green-600'
      else if (ratio >= 0.7) color = 'bg-green-500'
      else if (ratio >= 0.5) color = 'bg-yellow-500'
      else if (ratio >= 0.3) color = 'bg-orange-500'
      const titleParts = [
        `${new Date(i.day).toLocaleDateString()}`,
        `在线率 ${Math.round(ratio * 100)}%`,
      ]
      if (typeof i.avg_response_ms === 'number') {
        titleParts.push(`平均响应 ${Math.round(i.avg_response_ms)} ms`)
      }
      const title = titleParts.join('，')
      return <div title={title} key={idx} className={`h-4 w-4 mr-1.5 rounded ${color} transition-transform duration-200 hover:scale-125`}></div>
    })
  }, [items])
  return <div className="flex items-center justify-center">{blocks}</div>
}

function SubscribeModal({ visible, onClose, monitor }: { visible: boolean; onClose: () => void; monitor: Monitor }) {
  const [form] = Form.useForm()
  useEffect(() => {
    if (visible) {
      form.resetFields()
      form.setFieldsValue({ email: '', events: ['offline','online','ssl_expiry'] })
    }
  }, [visible])
  const submit = async () => {
    const v = await form.validate()
    try {
      await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitor_id: monitor.id, email: v.email, notify_events: v.events })
      }).then(async (res)=> {
        if (!res.ok) throw new Error(await res.text())
      })
      Message.success('验证邮件已发送，请查收并完成验证')
      onClose()
    } catch (e:any) {
      Message.error(String(e?.message || e))
    }
  }
  return (
    <Modal title={`订阅 · ${monitor.name}`} visible={visible} onCancel={onClose} onOk={submit} okText="发送验证" style={{ width: '90%', maxWidth: 500 }}>
      <Form form={form} layout="vertical">
        <Form.Item label="邮箱" field="email" rules={[{ required: true }]}><Input placeholder="user@example.com" /></Form.Item>
        <Form.Item label="通知类型" field="events" rules={[{ required: true }]}>
          <Checkbox.Group options={[
            { label: '离线', value: 'offline' },
            { label: '恢复', value: 'online' },
            { label: '证书到期', value: 'ssl_expiry' },
          ]} />
        </Form.Item>
      </Form>
      <div className="text-xs text-gray-500 mt-2">将向该邮箱发送验证邮件，验证通过后即可订阅。</div>
    </Modal>
  )
}
function MonitorForm({ visible, onClose, editing, groups, onOk }: { visible: boolean; onClose: () => void; editing: Monitor | null; groups: Group[]; onOk: () => void }) {
  const [form] = Form.useForm()
  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        name: editing.name, url: editing.url, method: editing.method, headers_json: editing.headers_json, body: editing.body,
        expected_status_min: editing.expected_status_min, expected_status_max: editing.expected_status_max, keyword: editing.keyword,
        group_id: editing.group_id, interval_seconds: editing.interval_seconds
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ method: 'GET', expected_status_min: 200, expected_status_max: 299 })
    }
  }, [editing])
  const submit = async () => {
    const v = await form.validate()
    if (editing) await updateMonitor(editing.id, v)
    else await createMonitor(v)
    Message.success('已保存')
    onOk()
  }
  return (
    <Modal title={editing ? '编辑监控' : '新建监控'} visible={visible} onCancel={onClose} onOk={submit} okText="保存" style={{ width: '90%', maxWidth: 600 }}>
      <Form form={form} layout="vertical">
        <Form.Item label="名称" field="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="URL" field="url" rules={[{ required: true }]}><Input /></Form.Item>
        <Grid.Row gutter={16}>
          <Grid.Col xs={24} sm={12}><Form.Item label="请求方法" field="method"><Select><Select.Option value="GET">GET</Select.Option><Select.Option value="POST">POST</Select.Option><Select.Option value="HEAD">HEAD</Select.Option></Select></Form.Item></Grid.Col>
          <Grid.Col xs={24} sm={12}><Form.Item label="分组" field="group_id"><Select allowClear>{(groups || []).map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}</Select></Form.Item></Grid.Col>
        </Grid.Row>
        <Form.Item label="请求头(JSON)" field="headers_json"><Input.TextArea placeholder='{"User-Agent":"Monitor"}' /></Form.Item>
        <Form.Item label="请求体" field="body"><Input.TextArea /></Form.Item>
        <Grid.Row gutter={16}>
          <Grid.Col xs={24} sm={12}><Form.Item label="期望状态码下限" field="expected_status_min"><InputNumber min={100} max={599} /></Form.Item></Grid.Col>
          <Grid.Col xs={24} sm={12}><Form.Item label="期望状态码上限" field="expected_status_max"><InputNumber min={100} max={599} /></Form.Item></Grid.Col>
        </Grid.Row>
        <Form.Item label="关键词检测" field="keyword"><Input /></Form.Item>
        <Form.Item label="检查间隔(秒)" field="interval_seconds"><InputNumber min={0} /></Form.Item>
      </Form>
    </Modal>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [form] = Form.useForm()
  useEffect(() => {
    getSettings().then(s => {
      form.setFieldsValue({ retention_days: s.retention_days, flap_threshold: s.flap_threshold, check_interval_seconds: s.check_interval_seconds })
    }).catch(()=>{})
  }, [])
  const save = async () => {
    const v = await form.validate()
    await updateSettings({ retention_days: v.retention_days, flap_threshold: v.flap_threshold, check_interval_seconds: v.check_interval_seconds })
    Message.success('设置已更新')
    onClose()
  }
  return (
    <Modal title="系统设置" visible={true} onCancel={onClose} onOk={save} okText="保存" style={{ width: '90%', maxWidth: 500 }}>
      <Form form={form} layout="vertical">
        <Form.Item label="数据保留天数" field="retention_days" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
        <Form.Item label="震荡次数阈值" field="flap_threshold" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
        <Form.Item label="默认检查间隔(秒)" field="check_interval_seconds" rules={[{ required: true }]}><InputNumber min={10} /></Form.Item>
      </Form>
      <div className="text-xs text-gray-500 mt-2">说明：超过保留天数的历史数据将自动清理；连续达到阈值后才触发上下线通知，避免频繁震荡。</div>
    </Modal>
  )
}
function DetailDrawer({ id, onClose }: { id: number; onClose: () => void }) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [days, setDays] = useState<DayAgg[]>([])
  const [ssl, setSsl] = useState<SSLInfo>(null)
  useEffect(() => { 
    const d = typeof localStorage !== 'undefined' ? Number(localStorage.getItem('HISTORY_DAYS') || '30') : 30
    getHistory(id, d).then(setItems).catch(()=>{}) 
  }, [id])
  useEffect(() => { 
    const d = typeof localStorage !== 'undefined' ? Number(localStorage.getItem('HISTORY_DAYS') || '30') : 30
    getHistoryByDay(id, d).then(setDays).catch(()=>{}) 
  }, [id])
  useEffect(() => { getSSL(id).then(setSsl).catch(()=>{}) }, [id])
  const buckets = useMemo(() => {
    const edges = [100,200,300,400,500,750,1000,1500,2000,3000]
    const counts = new Array(edges.length+1).fill(0)
    items.filter(i=>i.online).forEach(i=>{
      const v=i.response_ms
      let idx=counts.length-1
      for(let e=0;e<edges.length;e++){ if(v<=edges[e]){ idx=e; break } }
      counts[idx]++
    })
    const max = Math.max(...counts,1)
    return { edges, counts, max }
  }, [items])
  const spark = useMemo(() => {
    const w = 480, h = 80
    const data = (days || []).slice().reverse()
    const max = Math.max(...data.map(d => d.avg_response_ms || 0), 1)
    const step = data.length ? w / data.length : w
    const points = data.map((d, i) => {
      const x = i * step
      const y = h - (h * (d.avg_response_ms || 0) / max)
      return `${x},${y}`
    }).join(' ')
    return { w, h, points, max }
  }, [days])
  
  const drawerWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 520

  return (
    <Drawer title="详情" visible={true} onCancel={onClose} footer={null} width={drawerWidth}>
      <Typography.Title heading={6}>响应时间分布</Typography.Title>
      <div className="flex items-end h-32">
        {buckets.counts.map((c,idx)=>(
          <div key={idx} className="mx-1 w-6 bg-blue-500" style={{ height: `${Math.round(c*100/buckets.max)}%` }} title={`${c} 次`}></div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1 flex flex-wrap">
        {buckets.edges.map((e,idx)=>(<span key={idx} className="mr-3">{idx===0?`≤${e}`:`${buckets.edges[idx-1]}-${e}`}</span>))}
        <span>≥{buckets.edges[buckets.edges.length-1]}</span>
      </div>
      <Divider />
      <Typography.Title heading={6}>每日平均响应</Typography.Title>
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${spark.w} ${spark.h}`} className="w-full h-auto" preserveAspectRatio="none">
          <polyline points={spark.points} fill="none" stroke="#3b82f6" strokeWidth="2" />
        </svg>
      </div>
      <div className="text-xs text-gray-500 mt-1">最大值约 {Math.round(spark.max)} ms</div>
      <Divider />
      <Typography.Title heading={6}>按天聚合状态</Typography.Title>
      <StatusBar monitorId={id} />
      <Divider />
      <Typography.Title heading={6}>SSL</Typography.Title>
      <div className="text-sm">
        <div>剩余：{ssl && typeof ssl.days_left === 'number' ? `${ssl.days_left}天` : '-'}</div>
        <div>到期：{ssl && ssl.expires_at ? new Date(ssl.expires_at).toLocaleString() : '-'}</div>
        <div>签发者：{ssl && ssl.issuer ? ssl.issuer : '-'}</div>
      </div>
    </Drawer>
  )
}

type DayAgg = { day:string; online_count:number; total_count:number; avg_response_ms:number }

function SetupWizard({ onDone }: { onDone: () => void }) {
  const [form] = Form.useForm()
  const submit = async () => {
    const v = await form.validate()
    await postSetup(v)
    Message.success('安装完成')
    onDone()
  }
  const drawerWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 520
  return (
    <Drawer title="安装向导" visible={true} closable={false} maskClosable={false} onOk={submit} okText="完成" width={drawerWidth}>
      <Form form={form} layout="vertical">
        <Form.Item label="数据库连接" field="database_url" rules={[{ required: true }]}><Input placeholder="postgres://user:pass@host:port/db?sslmode=disable" /></Form.Item>
        <Form.Item label="服务地址" field="addr"><Input placeholder=":8080" /></Form.Item>
        <Form.Item label="管理员邮箱" field="admin_email" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="管理员密码" field="admin_password" rules={[{ required: true }]}><Input.Password /></Form.Item>
        <Form.Item label="Resend API Key" field="resend_api_key"><Input.Password /></Form.Item>
        <Grid.Row gutter={16}>
          <Grid.Col xs={24} sm={12}><Form.Item label="证书预警天数" field="alert_before_days"><InputNumber min={1} defaultValue={14} /></Form.Item></Grid.Col>
          <Grid.Col xs={24} sm={12}><Form.Item label="默认检查间隔(秒)" field="check_interval_seconds"><InputNumber min={10} defaultValue={60} /></Form.Item></Grid.Col>
        </Grid.Row>
      </Form>
      <div className="text-xs text-gray-500 mt-2">提示：安装会创建管理员账户，初始化数据库并写入本地配置文件。</div>
    </Drawer>
  )
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    const v = await form.validate()
    try {
      setLoading(true)
      await login(v.password)
      Message.success('登录成功')
      window.location.href = '/admin'
    } catch (e:any) {
      Message.error(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal title="管理员登录" visible={true} onCancel={onClose} onOk={submit} okText="登录" confirmLoading={loading} style={{ width: '90%', maxWidth: 400 }}>
      <Form form={form} layout="vertical">
        <Form.Item label="密码" field="password" rules={[{ required: true }]}><Input.Password /></Form.Item>
      </Form>
    </Modal>
  )
}

function GroupManager({ visible, onClose, groups, onOk }: { visible: boolean; onClose: () => void; groups: Group[]; onOk: () => void }) {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState<Group | null>(null)
  useEffect(() => { form.resetFields(); setEditing(null) }, [visible])
  const save = async () => {
    const v = await form.validate()
    if (editing) await updateGroup(editing.id, v)
    else await createGroup(v)
    Message.success('分组已保存')
    onOk()
  }
  const remove = async (g: Group) => {
    await deleteGroup(g.id)
    Message.success('分组已删除')
    onOk()
  }
  return (
    <Modal title="分组管理" visible={visible} onCancel={onClose} onOk={save} okText="保存" style={{ width: '90%', maxWidth: 800 }}>
      <Table rowKey="id" data={groups} pagination={false} scroll={{ x: 500 }} columns={[
        { title: '名称', dataIndex: 'name' },
        { title: '图标', dataIndex: 'icon' },
        { title: '颜色', dataIndex: 'color', render: (v:any)=> <span style={{ backgroundColor: v, color: '#fff', padding: '2px 6px', borderRadius: 4 }}>{v || '-'}</span> },
        { title: '操作', render: (_:any, r:Group)=> <Space><Button size="mini" onClick={()=>{ setEditing(r); form.setFieldsValue(r) }}>编辑</Button><Button size="mini" status="danger" onClick={()=>remove(r)}>删除</Button></Space> }
      ] as any} />
      <Divider />
      <Typography.Title heading={6}>{editing ? '编辑分组' : '新建分组'}</Typography.Title>
      <Form form={form} layout="vertical">
        <Form.Item label="名称" field="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="图标" field="icon"><Input placeholder="例如：🔵" /></Form.Item>
        <Form.Item label="颜色" field="color"><Input placeholder="#22c55e" /></Form.Item>
      </Form>
    </Modal>
  )
}
