import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Divider, Drawer, Form, Grid, Input, InputNumber, Message, Modal, Select, Space, Switch, Table, Tag, Typography, Layout, Menu, Breadcrumb, Avatar, Dropdown } from '@arco-design/web-react'
import { IconMoonFill, IconSun, IconSync, IconArrowLeft, IconDesktop, IconCheckCircle, IconCloseCircle, IconClockCircle, IconHome, IconNotification, IconUser } from '@arco-design/web-react/icon'
import { createGroup, createMonitor, deleteGroup, getGroups, getHistory, getHistoryByDay, getMonitors, getSSL, getSetupState, postSetup, updateGroup, updateMonitor, getSettings, updateSettings, getNotifications, getLatestResult, getGlobalTrend, login, getToken } from './api'
import { ResponseTrendChart, ResponseDistChart } from './components/ChartComponents'
import { NotificationTicker } from './components/NotificationTicker'
import useTheme from './useTheme'

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
  const [trendData, setTrendData] = useState<{time:string, avg_resp:number}[]>([])
  const [view, setView] = useState<'dashboard' | 'notifications'>('dashboard')
  const [siteName, setSiteName] = useState('服务监控面板')
  const [tabSubtitle, setTabSubtitle] = useState('')
  const [subtitle, setSubtitle] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const trend = await getGlobalTrend().catch(()=>[])
      setTrendData(trend)
      const data = await getMonitors()
      setList(Array.isArray(data) ? data : [])
      const gs = await getGroups()
      setGroups(Array.isArray(gs) ? gs : [])
      const sslEntries: Record<number, SSLInfo> = {}
      await Promise.all((Array.isArray(data) ? data : []).map(async (m:Monitor) => { sslEntries[m.id] = await getSSL(m.id).catch(()=>null) }))
      setSslMap(sslEntries)
      const ns = await getNotifications(20).catch(()=>[])
      setNotices(Array.isArray(ns) ? ns : [])
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
    const es = new EventSource('/api/events')
    es.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        setList(prev => prev.map(m => m.id === ev.MonitorID ? { ...m, last_online: ev.Online, last_checked_at: new Date(ev.CheckedAt).toISOString() } : m))
        setLatest(prev => ({ ...prev, [ev.MonitorID]: ev.ResponseMs }))
        if (ev.EventType === 'status_change' || ev.EventType === 'ssl_expiry') {
          const name = ev.MonitorName || (list.find(m=>m.id===ev.MonitorID)?.name) || ''
          const it: NotificationItem = {
            id: Date.now(),
            monitor_id: ev.MonitorID,
            created_at: new Date(ev.CheckedAt).toISOString(),
            type: ev.EventType,
            message: ev.Message || '',
            monitor_name: name
          }
          setNotices(prev => [it, ...prev].slice(0, 50))
        }
      } catch {}
    }
    return () => { es.close() }
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

  const distData = useMemo(() => {
    const counts = { fast: 0, medium: 0, slow: 0, error: 0 }
    Object.values(latest).forEach(ms => {
      if (ms < 0) return
      if (ms < 100) counts.fast++
      else if (ms < 500) counts.medium++
      else if (ms < 1000) counts.slow++
      else counts.error++
    })
    return [
      { range: '<100ms', count: counts.fast },
      { range: '100-500ms', count: counts.medium },
      { range: '500-1000ms', count: counts.slow },
      { range: '>1000ms', count: counts.error },
    ].filter(x => x.count > 0)
  }, [latest])

  const columns = [
    { title: '名称', dataIndex: 'name' },
    {
      title: '状态',
      render: (_: any, r: Monitor) => (
        <Tag color={r.last_online ? 'green' : 'red'}>{r.last_online ? '在线' : '离线'}</Tag>
      )
    },
    { title: 'URL', dataIndex: 'url' },
    {
      title: '分组',
      render: (_: any, r: Monitor) => {
        const g = groups.find(x => x.id === r.group_id)
        if (!g) return '-'
        return <Tag style={{ backgroundColor: g.color || undefined, color: g.color ? '#fff' : undefined }}>{g.icon ? `${g.icon} ` : ''}{g.name}</Tag>
      }
    },
    {
      title: '最近响应',
      render: (_: any, r: Monitor) => <span>{typeof latest[r.id] === 'number' ? `${latest[r.id]} ms` : '-'}</span>
    },
    {
      title: '平均响应',
      render: (_: any, r: Monitor) => <AvgResponse monitorId={r.id} />
    },
    {
      title: '30天状态',
      render: (_: any, r: Monitor) => <StatusBar monitorId={r.id} />
    },
    {
      title: 'SSL剩余',
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
        </Space>
      )
    },
  ]

  return (
    <Layout className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Layout.Header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <img src="/img/favicon.svg" alt="logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/30" />
          <div className="flex flex-col">
            <Typography.Title heading={5} className="!m-0 !text-slate-800 dark:!text-slate-100">{siteName}</Typography.Title>
            {subtitle ? <Typography.Text className="text-slate-500 dark:text-slate-400 text-xs">{subtitle}</Typography.Text> : null}
          </div>
        </div>
        <Space size="medium">
          <Button icon={<IconSync />} onClick={fetchData} loading={loading} type="secondary">刷新</Button>
          <Select style={{ width: 160 }} placeholder="分组筛选" value={groupFilter} onChange={setGroupFilter} allowClear triggerProps={{ autoAlignPopupWidth: false, autoAlignPopupMinWidth: true, position: 'bl' }}>
            <Select.Option value={'all' as any}>全部项目</Select.Option>
            {(groups || []).map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}
          </Select>
          <Switch checked={dark} onChange={setDark} checkedIcon={<IconMoonFill />} uncheckedIcon={<IconSun />} />
          <Button type="primary" onClick={() => {
            if (getToken()) window.location.href = '/admin'
            else setShowLogin(true)
          }} icon={<IconUser />}>管理员登录</Button>
        </Space>
      </Layout.Header>
      
      <Layout className="px-6 py-4">
        {view === 'dashboard' ? (
          <Layout.Content>
            <div className="mb-4">
               <NotificationTicker notices={notices} onClick={() => setView('notifications')} isDark={dark} />
            </div>
            
            <Grid.Row gutter={16}>
              <Grid.Col span={6}>
                <Card className="hover:shadow-md transition-shadow duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography.Text className="text-slate-500 dark:text-slate-400">总站点数</Typography.Text>
                      <div className="text-3xl mt-2 font-bold text-slate-800 dark:text-slate-100">{totalCount}</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-opacity-20 dark:bg-blue-500 rounded-full">
                      <IconDesktop className="text-blue-600 dark:text-blue-300 text-xl" />
                    </div>
                  </div>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card className="hover:shadow-md transition-shadow duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography.Text className="text-slate-500 dark:text-slate-400">在线站点</Typography.Text>
                      <div className="text-3xl mt-2 font-bold text-green-600 dark:text-green-400">{onlineCount}</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-opacity-20 dark:bg-green-500 rounded-full">
                      <IconCheckCircle className="text-green-600 dark:text-green-300 text-xl" />
                    </div>
                  </div>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card className="hover:shadow-md transition-shadow duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography.Text className="text-slate-500 dark:text-slate-400">离线站点</Typography.Text>
                      <div className="text-3xl mt-2 font-bold text-red-600 dark:text-red-400">{offlineCount}</div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-opacity-20 dark:bg-red-500 rounded-full">
                      <IconCloseCircle className="text-red-600 dark:text-red-300 text-xl" />
                    </div>
                  </div>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card className="hover:shadow-md transition-shadow duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography.Text className="text-slate-500 dark:text-slate-400">平均响应</Typography.Text>
                      <div className="text-3xl mt-2 font-bold text-blue-600 dark:text-blue-400">{avgRespAll}</div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-opacity-20 dark:bg-indigo-500 rounded-full">
                      <IconClockCircle className="text-indigo-600 dark:text-indigo-300 text-xl" />
                    </div>
                  </div>
                </Card>
              </Grid.Col>
            </Grid.Row>
            
            <Grid.Row gutter={16} className="mt-4">
              <Grid.Col span={16}>
                <Card title="24小时响应趋势" className="h-full hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <ResponseTrendChart data={trendData} isDark={dark} />
                </Card>
              </Grid.Col>
              <Grid.Col span={8}>
                <Card title="当前响应分布" className="h-full hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <ResponseDistChart data={distData} isDark={dark} />
                </Card>
              </Grid.Col>
            </Grid.Row>
    
            <Card className="mt-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" title="监控列表">
              <Table rowKey="id" columns={columns as any} data={filtered} pagination={false} border={false} />
            </Card>
          </Layout.Content>
        ) : (
          <Layout.Content>
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item onClick={() => setView('dashboard')} className="cursor-pointer"><IconHome /> 首页</Breadcrumb.Item>
              <Breadcrumb.Item>异常通知历史</Breadcrumb.Item>
            </Breadcrumb>
            <Card 
              title={
                <Space>
                  <Button icon={<IconArrowLeft />} onClick={() => setView('dashboard')} shape="circle" />
                  <Typography.Text>异常通知历史</Typography.Text>
                </Space>
              }
            >
              <Table 
                rowKey="id" 
                data={notices} 
                pagination={{ pageSize: 20 }} 
                columns={[
                  { title: '时间', dataIndex: 'created_at', width: 200,
                    render: (v:any)=> (v ? new Date(v).toLocaleString() : '-') },
                  { title: '站点', dataIndex: 'monitor_name', width: 200 },
                  { title: '类型', dataIndex: 'type', width: 120, align: 'center',
                    render: (v:any, r:any)=> {
                      let color = 'arcoblue'
                      let text = v
                      if (v === 'status_change') {
                        const msg = (r.message || '').toLowerCase()
                        const isRecovery = msg.includes('恢复') || msg.includes('online') || msg.includes('up') || msg.includes('ok')
                        color = isRecovery ? 'green' : 'red'
                        text = isRecovery ? '服务恢复' : '服务离线'
                      } else if (v === 'ssl_expiry') {
                        color = 'orange'
                        text = 'SSL过期'
                      }
                      return <Tag color={color}>{text}</Tag> 
                    }
                  },
                  { title: '消息', dataIndex: 'message' }
                ] as any} 
              />
            </Card>
          </Layout.Content>
        )}
        <Layout.Footer className="text-center text-gray-400 py-8">
          Monitor System ©2024 Created with Arco Design
        </Layout.Footer>
      </Layout>

      {showDetail && detailId !== null && <DetailDrawer id={detailId} onClose={() => setShowDetail(false)} />}
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
    return (items || []).slice(0, 30).map((i, idx) => {
      const ratio = i.total_count ? i.online_count / i.total_count : 0
      const color = ratio >= 0.8 ? 'bg-green-500' : ratio >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
      return <div title={`${i.day} 在线率 ${Math.round(ratio*100)}%`} key={idx} className={`h-3 w-3 mr-1 rounded ${color}`}></div>
    })
  }, [items])
  return <div className="flex items-center">{blocks}</div>
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
    <Modal title={editing ? '编辑监控' : '新建监控'} visible={visible} onCancel={onClose} onOk={submit} okText="保存">
      <Form form={form} layout="vertical">
        <Form.Item label="名称" field="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="URL" field="url" rules={[{ required: true }]}><Input /></Form.Item>
        <Grid.Row gutter={16}>
          <Grid.Col span={12}><Form.Item label="请求方法" field="method"><Select><Select.Option value="GET">GET</Select.Option><Select.Option value="POST">POST</Select.Option><Select.Option value="HEAD">HEAD</Select.Option></Select></Form.Item></Grid.Col>
          <Grid.Col span={12}><Form.Item label="分组" field="group_id"><Select allowClear>{(groups || []).map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}</Select></Form.Item></Grid.Col>
        </Grid.Row>
        <Form.Item label="请求头(JSON)" field="headers_json"><Input.TextArea placeholder='{"User-Agent":"Monitor"}' /></Form.Item>
        <Form.Item label="请求体" field="body"><Input.TextArea /></Form.Item>
        <Grid.Row gutter={16}>
          <Grid.Col span={12}><Form.Item label="期望状态码下限" field="expected_status_min"><InputNumber min={100} max={599} /></Form.Item></Grid.Col>
          <Grid.Col span={12}><Form.Item label="期望状态码上限" field="expected_status_max"><InputNumber min={100} max={599} /></Form.Item></Grid.Col>
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
    <Modal title="系统设置" visible={true} onCancel={onClose} onOk={save} okText="保存">
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
  return (
    <Drawer title="详情" visible={true} onCancel={onClose} footer={null} width={520}>
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
      <svg width={spark.w} height={spark.h}>
        <polyline points={spark.points} fill="none" stroke="#3b82f6" strokeWidth="2" />
      </svg>
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
  return (
    <Drawer title="安装向导" visible={true} closable={false} maskClosable={false} onOk={submit} okText="完成">
      <Form form={form} layout="vertical">
        <Form.Item label="数据库连接" field="database_url" rules={[{ required: true }]}><Input placeholder="postgres://user:pass@host:port/db?sslmode=disable" /></Form.Item>
        <Form.Item label="服务地址" field="addr"><Input placeholder=":8080" /></Form.Item>
        <Form.Item label="管理员邮箱" field="admin_email" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="管理员密码" field="admin_password" rules={[{ required: true }]}><Input.Password /></Form.Item>
        <Form.Item label="Resend API Key" field="resend_api_key"><Input.Password /></Form.Item>
        <Grid.Row gutter={16}>
          <Grid.Col span={12}><Form.Item label="证书预警天数" field="alert_before_days"><InputNumber min={1} defaultValue={14} /></Form.Item></Grid.Col>
          <Grid.Col span={12}><Form.Item label="默认检查间隔(秒)" field="check_interval_seconds"><InputNumber min={10} defaultValue={60} /></Form.Item></Grid.Col>
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
    <Modal title="管理员登录" visible={true} onCancel={onClose} onOk={submit} okText="登录" confirmLoading={loading}>
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
    <Modal title="分组管理" visible={visible} onCancel={onClose} onOk={save} okText="保存" style={{ width: 800 }}>
      <Table rowKey="id" data={groups} pagination={false} columns={[
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
