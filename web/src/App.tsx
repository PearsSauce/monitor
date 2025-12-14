import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Divider, Drawer, Form, Grid, Input, InputNumber, Message, Select, Space, Switch, Table, Tag, Typography } from '@arco-design/web-react'
import { IconMoonFill, IconSun, IconSync } from '@arco-design/web-react/icon'
import { createGroup, createMonitor, deleteGroup, getGroups, getHistory, getHistoryByDay, getMonitors, getSSL, getSetupState, postSetup, updateGroup, updateMonitor } from './api'

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

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(false)
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])
  return { dark, setDark }
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Monitor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupFilter, setGroupFilter] = useState<number | 'all'>('all')
  const [sslMap, setSslMap] = useState<Record<number, SSLInfo>>({})
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Monitor | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const { dark, setDark } = useDarkMode()
  const [showGroups, setShowGroups] = useState(false)
  const [needSetup, setNeedSetup] = useState(false)

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
    } catch (e: any) {
      Message.error(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSetupState().then(s=> { setNeedSetup(!s.installed); if (s.installed) fetchData() }).catch(()=>fetchData())
  }, [])

  const filtered = useMemo(() => {
    if (groupFilter === 'all') return list
    return list.filter(i => i.group_id === groupFilter)
  }, [list, groupFilter])

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
          <Button size="mini" type="primary" onClick={() => { setEditing(r); setShowForm(true) }}>编辑</Button>
        </Space>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="p-4">
        <Space size={16} className="w-full justify-between">
          <Typography.Title heading={4} className="text-black dark:text-white">网站监控</Typography.Title>
          <Space>
            <Button icon={<IconSync />} onClick={fetchData} loading={loading}>刷新</Button>
            <Select style={{ width: 200 }} placeholder="分组筛选" value={groupFilter} onChange={setGroupFilter} allowClear>
              <Select.Option value={'all' as any}>全部</Select.Option>
              {(groups || []).map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}
            </Select>
            <Button type="primary" onClick={() => { setEditing(null); setShowForm(true) }}>新建监控</Button>
            <Button onClick={() => setShowGroups(true)}>管理分组</Button>
            <Switch checked={dark} onChange={setDark} checkedIcon={<IconMoonFill />} uncheckedIcon={<IconSun />} />
          </Space>
        </Space>
        <Divider />
        <Card>
          <Table rowKey="id" columns={columns as any} data={filtered} pagination={false} />
        </Card>
        <MonitorForm visible={showForm} onClose={() => setShowForm(false)} editing={editing} groups={groups} onOk={() => { setShowForm(false); fetchData() }} />
        {showDetail && detailId !== null && <DetailDrawer id={detailId} onClose={() => setShowDetail(false)} />}
        <GroupManager visible={showGroups} onClose={() => setShowGroups(false)} groups={groups} onOk={() => { setShowGroups(false); fetchData() }} />
        {needSetup && <SetupWizard onDone={async () => { setNeedSetup(false); await fetchData() }} />}
      </div>
    </div>
  )
}

function AvgResponse({ monitorId }: { monitorId: number }) {
  const [items, setItems] = useState<HistoryItem[]>([])
  useEffect(() => {
    getHistory(monitorId, 30).then(setItems).catch(() => {})
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
    return items.slice(0, 30).map((i, idx) => {
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
      form.setFieldsValue({ method: 'GET', expected_status_min: 200, expected_status_max: 299, interval_seconds: 60 })
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
    <Drawer title={editing ? '编辑监控' : '新建监控'} visible={visible} onCancel={onClose} onOk={submit} okText="保存">
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
        <Form.Item label="检查间隔(秒)" field="interval_seconds"><InputNumber min={10} /></Form.Item>
      </Form>
    </Drawer>
  )
}

function DetailDrawer({ id, onClose }: { id: number; onClose: () => void }) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [days, setDays] = useState<DayAgg[]>([])
  const [ssl, setSsl] = useState<SSLInfo>(null)
  useEffect(() => { getHistory(id, 30).then(setItems).catch(()=>{}) }, [id])
  useEffect(() => { getHistoryByDay(id, 30).then(setDays).catch(()=>{}) }, [id])
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
    const data = days.slice().reverse()
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
    <Drawer title="分组管理" visible={visible} onCancel={onClose} onOk={save} okText="保存">
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
    </Drawer>
  )
}
