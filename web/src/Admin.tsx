import React, { useEffect, useState } from 'react'
import { Button, Form, Grid, InputNumber, Input, Message, Space, Typography, Card, Divider, Table, Tag, Modal, Select, Layout, Breadcrumb, Tabs, Switch } from '@arco-design/web-react'
import { IconHome, IconSettings, IconPoweroff, IconPlus, IconDesktop, IconDelete, IconEdit, IconMoonFill, IconSun } from '@arco-design/web-react/icon'
import { getSettings, updateSettings, getToken, setToken, getMonitors, getGroups, createMonitor, updateMonitor, deleteMonitor, createGroup, updateGroup, deleteGroup } from './api'
import Login from './Login'
import useTheme from './useTheme'

export default function Admin() {
  const { dark, setDark } = useTheme()
  const [form] = Form.useForm()
  const [list, setList] = useState<Monitor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Monitor | null>(null)
  const [showGroups, setShowGroups] = useState(false)
  const [token, setTokenState] = useState(getToken())

  useEffect(() => {
    if (!token) return
    getSettings().then(s => {
      form.setFieldsValue({
        retention_days: s.retention_days,
        flap_threshold: s.flap_threshold,
        check_interval_seconds: s.check_interval_seconds
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
  }
  const save = async () => {
    const v = await form.validate()
    await updateSettings({ retention_days: v.retention_days, flap_threshold: v.flap_threshold, check_interval_seconds: v.check_interval_seconds })
    Message.success('系统设置已保存')
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
    <Layout className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Layout.Header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center">
          <Typography.Title heading={5} style={{ margin: 0 }} className="text-slate-800 dark:text-slate-100">系统管理</Typography.Title>
        </div>
        <Space>
          <Switch checked={dark} onChange={setDark} checkedIcon={<IconMoonFill />} uncheckedIcon={<IconSun />} />
          <Button type="text" icon={<IconHome />} onClick={goDashboard} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">返回首页</Button>
          <Button type="text" status="danger" icon={<IconPoweroff />} onClick={logout}>退出登录</Button>
        </Space>
      </Layout.Header>
      <Layout.Content className="px-6 py-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>系统管理</Breadcrumb.Item>
        </Breadcrumb>
        
        <Card className="shadow-sm rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Tabs defaultActiveTab="monitors">
            <Tabs.TabPane key="monitors" title={<span><IconDesktop /> 监控列表</span>}>
              <div className="mb-4">
                <Space>
                  <Button type="primary" icon={<IconPlus />} onClick={openCreate}>新建监控</Button>
                  <Button icon={<IconSettings />} onClick={openGroups}>管理分组</Button>
                </Space>
              </div>
              <Table rowKey="id" columns={columns as any} data={list} pagination={false} />
            </Tabs.TabPane>
            <Tabs.TabPane key="settings" title={<span><IconSettings /> 系统设置</span>}>
              <div className="max-w-3xl">
                <Typography.Title heading={6} className="mb-4">全局配置</Typography.Title>
                <Form form={form} layout="vertical">
                  <Grid.Row gutter={24}>
                    <Grid.Col span={8}><Form.Item label="数据保留天数" field="retention_days" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></Grid.Col>
                    <Grid.Col span={8}><Form.Item label="震荡次数阈值" field="flap_threshold" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item></Grid.Col>
                    <Grid.Col span={8}><Form.Item label="默认检查间隔(秒)" field="check_interval_seconds" rules={[{ required: true }]}><InputNumber min={10} /></Form.Item></Grid.Col>
                  </Grid.Row>
                </Form>
                <Divider />
                <Button type="primary" onClick={save}>保存设置</Button>
                <div className="text-xs text-gray-500 mt-2">说明：未在监控表单中设置检查间隔时，将使用此默认值；若监控表单填写了检查间隔，则以监控表单为准。</div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>
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
