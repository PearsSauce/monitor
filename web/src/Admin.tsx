import React, { useEffect, useState } from 'react'
import { Button, Form, Grid, InputNumber, Input, Message, Space, Typography, Card, Divider, Table, Tag, Modal, Select, Layout, Breadcrumb, Tabs, Switch, Checkbox } from '@arco-design/web-react'
import { IconHome, IconSettings, IconPoweroff, IconPlus, IconDesktop, IconDelete, IconEdit, IconMoonFill, IconSun } from '@arco-design/web-react/icon'
import { getSettings, updateSettings, getToken, setToken, getMonitors, getGroups, createMonitor, updateMonitor, deleteMonitor, createGroup, updateGroup, deleteGroup, deleteSubscription, getAllSubscriptions } from './api'
import Login from './Login'
import useTheme from './useTheme'

export default function Admin() {
  const { dark, setDark } = useTheme()
  const [form] = Form.useForm()
  const [websiteForm] = Form.useForm()
  const [dataForm] = Form.useForm()
  const [notifyForm] = Form.useForm()
  const [siteName, setSiteName] = useState('服务监控系统')
  const [subtitle, setSubtitle] = useState('')
  const [list, setList] = useState<Monitor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Monitor | null>(null)
  const [showGroups, setShowGroups] = useState(false)
  
  const [token, setTokenState] = useState(getToken())
  const [testType, setTestType] = useState<'online' | 'offline' | 'ssl_expiry'>('offline')
  const [testMonitor, setTestMonitor] = useState<number | null>(null)
  const [subsAll, setSubsAll] = useState<Array<{ id:number; monitor_id:number; monitor_name:string; email:string; notify_events:string; verified:boolean; created_at:string }>>([])

  useEffect(() => {
    if (!token) return
    getSettings().then(s => {
      form.setFieldsValue({
        retention_days: s.retention_days,
        flap_threshold: s.flap_threshold,
        check_interval_seconds: s.check_interval_seconds
      })
      websiteForm.setFieldsValue({
        site_name: s.site_name,
        subtitle: s.subtitle,
        tab_subtitle: s.tab_subtitle
      })
      setSiteName(s.site_name || '服务监控系统')
      setSubtitle(s.subtitle || '')
      const title = s.tab_subtitle ? `${s.site_name || '服务监控系统'} - ${s.tab_subtitle}` : (s.site_name || '服务监控系统')
      if (typeof document !== 'undefined') document.title = title
      dataForm.setFieldsValue({
        history_days_frontend: s.history_days_frontend ?? (typeof localStorage !== 'undefined' ? Number(localStorage.getItem('HISTORY_DAYS') || '30') : 30),
        retention_days: s.retention_days,
        check_interval_seconds: s.check_interval_seconds,
        debounce_seconds: s.debounce_seconds ?? 0,
        flap_threshold: s.flap_threshold
      })
      notifyForm.setFieldsValue({
        enable_notifications: s.enable_notifications ?? true,
        notify_events: s.notify_events ?? ['online', 'offline', 'ssl_expiry'],
        smtp_server: s.smtp_server,
        smtp_port: s.smtp_port,
        smtp_user: s.smtp_user,
        smtp_password: s.smtp_password,
        from_email: s.from_email,
        to_emails: s.to_emails
      })
    }).catch(()=>{})
    fetchData()
  }, [token])

  if (!token) {
    return <Login />
  }

  const fetchData = async () => {
    const ms = await getMonitors().catch(()=>[])
    const gs = await getGroups().catch(()=>[])
    setList(Array.isArray(ms) ? ms : [])
    setGroups(Array.isArray(gs) ? gs : [])
    getAllSubscriptions().then((res:any) => {
      const arr = Array.isArray(res) ? res : []
      setSubsAll(arr.map((x:any)=> ({
        id: Number(x.id),
        monitor_id: Number(x.monitor_id),
        monitor_name: String(x.monitor_name||''),
        email: String(x.email||''),
        notify_events: String(x.notify_events||''),
        verified: !!x.verified,
        created_at: String(x.created_at||'')
      })))
    }).catch(()=>setSubsAll([]))
  }
  const saveWebsite = async () => {
    const v = await websiteForm.validate()
    await updateSettings({ site_name: v.site_name, subtitle: v.subtitle, tab_subtitle: v.tab_subtitle })
    Message.success('网站设置已保存')
  }
  const saveData = async () => {
    const v = await dataForm.validate()
    await updateSettings({
      retention_days: v.retention_days,
      check_interval_seconds: v.check_interval_seconds,
      debounce_seconds: v.debounce_seconds,
      flap_threshold: v.flap_threshold
    })
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('HISTORY_DAYS', String(v.history_days_frontend || 30))
      }
    } catch {}
    Message.success('数据设置已保存')
  }
  const saveNotify = async () => {
    const v = await notifyForm.validate()
    await updateSettings({
      enable_notifications: v.enable_notifications,
      notify_events: v.notify_events,
      smtp_server: v.smtp_server,
      smtp_port: v.smtp_port,
      smtp_user: v.smtp_user,
      smtp_password: v.smtp_password,
      from_email: v.from_email,
      to_emails: v.to_emails
    })
    Message.success('通知设置已保存')
  }
  const sendTestNotify = async () => {
    try {
      if (!testMonitor) {
        Message.warning('请选择站点')
        return
      }
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
        },
        body: JSON.stringify({ type: testType, monitor_id: testMonitor })
      })
      if (!res.ok) throw new Error('测试通知发送失败')
      Message.success('测试通知已发送')
    } catch (e:any) {
      Message.error(String(e?.message || e))
    }
  }
  const goDashboard = () => { window.location.href = '/' }
  const logout = () => {
    setToken('')
    setTokenState('')
    window.location.reload()
  }
  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '状态', render: (_: any, r: Monitor) => <Tag color={r.last_online ? 'green' : 'red'}>{r.last_online ? '在线' : '离线'}</Tag> },
    { title: 'URL', dataIndex: 'url' },
    { title: '分组', render: (_: any, r: Monitor) => {
      const g = groups.find(x => x.id === r.group_id)
      return g ? <Tag style={{ backgroundColor: g.color || undefined, color: g.color ? '#fff' : undefined }}>{g.icon ? `${g.icon} ` : ''}{g.name}</Tag> : '-'
    }},
    { title: '最近检查', render: (_:any, r:Monitor)=> r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : '-' },
    { title: '操作', render: (_:any, r:Monitor)=> (
      <Space>
        <Button size="mini" type="primary" icon={<IconEdit />} onClick={()=>{ setEditing(r); setShowForm(true) }}>编辑</Button>
        <Button size="mini" status="danger" icon={<IconDelete />} onClick={async()=>{ await deleteMonitor(r.id); Message.success('已删除'); fetchData() }}>删除</Button>
      </Space>
    ) }
  ]
  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openGroups = () => { setShowGroups(true) }
  
  return (
    <Layout className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      <Layout.Header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-slate-200 dark:border-neutral-800 px-4 md:px-6 h-16 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3 group cursor-default">
            <img src="/img/favicon.svg" alt="logo" className="w-8 h-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
            <div className="flex flex-col">
              <Typography.Title heading={5} style={{ margin: 0 }} className="text-slate-800 dark:text-neutral-100 animate-fade-in-up transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{siteName}</Typography.Title>
              {subtitle ? <Typography.Text className="hidden md:block text-slate-500 dark:text-neutral-400 text-xs animate-fade-in-up delay-200 ml-8">{subtitle}</Typography.Text> : null}
            </div>
          </div>
          <Space>
            <Switch checked={dark} onChange={setDark} checkedIcon={<IconMoonFill />} uncheckedIcon={<IconSun />} />
            <Button type="text" icon={<IconHome />} onClick={goDashboard} className="text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400"><span className="hidden md:inline">返回首页</span></Button>
            <Button type="text" status="danger" icon={<IconPoweroff />} onClick={logout}><span className="hidden md:inline">退出登录</span></Button>
          </Space>
        </div>
      </Layout.Header>
      <Layout.Content className="px-6 py-4">
        <div className="w-full max-w-screen-xl mx-auto">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        </Breadcrumb>
        <Card className="shadow-sm rounded-lg bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60">
          <Tabs defaultActiveTab="sites">
            <Tabs.TabPane key="sites" title={<span><IconDesktop /> 站点管理</span>}>
              <div className="mb-4">
                <Typography.Title heading={6}>站点列表</Typography.Title>
                <Space className="mb-3">
                  <Button type="primary" icon={<IconPlus />} onClick={openCreate}>新建监控</Button>
                  <Button icon={<IconSettings />} onClick={openGroups}>分类管理</Button>
                </Space>
                <Table rowKey="id" columns={columns as any} data={list} pagination={false} scroll={{ x: 600 }} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane key="subs" title={<span><IconSettings /> 订阅列表</span>}>
              <div>
                <Typography.Title heading={6}>订阅列表</Typography.Title>
                <Table rowKey="id" data={subsAll} pagination={false} scroll={{ x: 600 }} columns={[
                  { title: '站点', dataIndex: 'monitor_name' },
                  { title: '邮箱', dataIndex: 'email', align: 'center' },
                  { title: '类型', dataIndex: 'notify_events', align: 'center', render: (v:any)=> {
                    const evs = String(v||'').split(',').map((s)=>s.trim()).filter(Boolean)
                    return <Space>{evs.map((e,idx)=>{
                      let color = 'gray'
                      let text = e
                      if(e==='offline') { color='red'; text='离线' }
                      else if(e==='online') { color='green'; text='恢复' }
                      else if(e==='ssl_expiry') { color='orange'; text='证书到期' }
                      return <Tag key={idx} color={color}>{text}</Tag>
                    })}</Space>
                  }},
                  { title: '状态', dataIndex: 'verified', align: 'center', render: (v:any)=> <Tag color={v?'green':'orange'}>{v?'已验证':'待验证'}</Tag> },
                  { title: '时间', dataIndex: 'created_at', align: 'center', render: (v:any)=> (v ? new Date(v).toLocaleString() : '-') },
                  { title: '操作', align: 'center', render: (_:any, r:any)=> <Button size="mini" status="danger" onClick={async()=>{ await deleteSubscription(r.id); Message.success('已删除'); setSubsAll(prev=>prev.filter(x=>x.id!==r.id)) }}>删除</Button> }
                ] as any} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane key="website" title={<span><IconSettings /> 网站设置</span>}>
              <div className="max-w-3xl">
                <Typography.Title heading={6} className="mb-4">基础信息</Typography.Title>
                <Form form={websiteForm} layout="vertical">
                  <Form.Item label="网站名称" field="site_name" rules={[{ required: true }]}><Input placeholder="例如：服务监控系统" /></Form.Item>
                  <Form.Item label="副标题" field="subtitle"><Input placeholder="例如：实时站点状态与响应监控" /></Form.Item>
                  <Form.Item label="标签页副标题" field="tab_subtitle"><Input placeholder="例如：Monitor" /></Form.Item>
                </Form>
                <Divider />
                <Button type="primary" onClick={saveWebsite}>保存网站设置</Button>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane key="data" title={<span><IconSettings /> 数据设置</span>}>
              <div className="max-w-3xl">
                <Typography.Title heading={6} className="mb-4">数据与检测</Typography.Title>
                <Form form={dataForm} layout="vertical">
                  <Grid.Row gutter={24}>
                    <Grid.Col xs={24} sm={12}><Form.Item label="历史数据时间范围(天)" field="history_days_frontend" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></Grid.Col>
                    <Grid.Col xs={24} sm={12}><Form.Item label="数据保留天数(后端)" field="retention_days" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></Grid.Col>
                  </Grid.Row>
                  <Grid.Row gutter={24}>
                    <Grid.Col xs={24} sm={12}><Form.Item label="网站检测间隔(秒)" field="check_interval_seconds" rules={[{ required: true }]}><InputNumber min={10} /></Form.Item></Grid.Col>
                    <Grid.Col xs={24} sm={12}><Form.Item label="防抖时间(秒)" field="debounce_seconds" rules={[{ required: true }]}><InputNumber min={0} /></Form.Item></Grid.Col>
                  </Grid.Row>
                  <Form.Item label="震荡次数阈值" field="flap_threshold" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
                </Form>
                <Divider />
                <Button type="primary" onClick={saveData}>保存数据设置</Button>
                <div className="text-xs text-gray-500 mt-2">说明：历史数据时间范围仅影响前端详情展示；数据保留天数用于后端实际清理；防抖时间用于避免短暂波动导致误报。</div>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane key="notify" title={<span><IconSettings /> 通知设置</span>}>
              <div className="max-w-3xl">
                <Typography.Title heading={6} className="mb-4">通知配置</Typography.Title>
                <Form form={notifyForm} layout="vertical">
                  <Form.Item label="开启通知" field="enable_notifications" triggerPropName="checked"><Switch /></Form.Item>
                  <Form.Item label="通知事件" field="notify_events">
                    <Checkbox.Group options={[
                      { label: '在线', value: 'online' },
                      { label: '离线', value: 'offline' },
                      { label: '证书到期', value: 'ssl_expiry' }
                    ]} />
                  </Form.Item>
                  <Typography.Title heading={6} className="mt-2 mb-2">邮件通知</Typography.Title>
                  <Grid.Row gutter={24}>
                    <Grid.Col xs={24} sm={12}><Form.Item label="SMTP服务器" field="smtp_server"><Input placeholder="smtp.example.com" /></Form.Item></Grid.Col>
                    <Grid.Col xs={24} sm={6}><Form.Item label="端口" field="smtp_port"><InputNumber min={1} /></Form.Item></Grid.Col>
                    <Grid.Col xs={24} sm={6}><Form.Item label="发件邮箱" field="from_email"><Input placeholder="noreply@example.com" /></Form.Item></Grid.Col>
                  </Grid.Row>
                  <Grid.Row gutter={24}>
                    <Grid.Col xs={24} sm={8}><Form.Item label="用户名" field="smtp_user"><Input /></Form.Item></Grid.Col>
                    <Grid.Col xs={24} sm={8}><Form.Item label="密码" field="smtp_password"><Input.Password /></Form.Item></Grid.Col>
                    <Grid.Col xs={24} sm={8}><Form.Item label="收件人邮箱(逗号分隔)" field="to_emails"><Input placeholder="a@example.com,b@example.com" /></Form.Item></Grid.Col>
                  </Grid.Row>
                </Form>
                <Divider />
                <Space>
                  <Button type="primary" onClick={saveNotify}>保存通知设置</Button>
                </Space>
                <Divider />
                <Typography.Title heading={6}>测试通知</Typography.Title>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Select style={{ width: 160 }} value={testType} onChange={setTestType}>
                    <Select.Option value="online">在线</Select.Option>
                    <Select.Option value="offline">离线</Select.Option>
                    <Select.Option value="ssl_expiry">证书到期</Select.Option>
                  </Select>
                  <Select style={{ width: 240 }} placeholder="选择站点" value={testMonitor as any} onChange={(v:any)=>setTestMonitor(v)}>
                    {(list || []).map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
                  </Select>
                  <Button type="primary" onClick={sendTestNotify}>发送测试通知</Button>
                </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>
        </div>
      </Layout.Content>

      <MonitorForm visible={showForm} onClose={()=>setShowForm(false)} editing={editing} groups={groups} onOk={()=>{ setShowForm(false); fetchData() }} />
      <GroupManager visible={showGroups} onClose={()=>setShowGroups(false)} groups={groups} onOk={()=>{ setShowGroups(false); fetchData() }} />
      
    </Layout>
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
type Group = { id:number; name:string; icon?:string; color?:string }

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
    if (v.headers_json) {
      try {
        JSON.parse(v.headers_json)
      } catch (e) {
        Message.error('请求头必须是合法的 JSON 格式')
        return
      }
    }
    try {
      if (editing) await updateMonitor(editing.id, v)
      else await createMonitor(v)
      Message.success('已保存')
      onOk()
    } catch (e: any) {
      Message.error(e.message)
    }
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
