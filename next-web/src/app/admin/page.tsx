'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, setToken, getMonitors, getGroups, deleteMonitor, getSettings, updateSettings, getAllSubscriptions, deleteSubscription } from '@/lib/api'
import { Monitor, Group } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { MonitorForm } from '@/components/MonitorForm'
import { GroupManager } from '@/components/GroupManager'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Home, Power, Plus, Settings, Monitor as MonitorIcon, Bell, Database, Globe, Trash2, Edit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Form schemas
const websiteSchema = z.object({
  site_name: z.string().min(1, "Required"),
  subtitle: z.string().optional(),
  tab_subtitle: z.string().optional(),
})

const dataSchema = z.object({
  history_days_frontend: z.coerce.number().min(1),
  retention_days: z.coerce.number().min(1),
  check_interval_seconds: z.coerce.number().min(10),
  debounce_seconds: z.coerce.number().min(0),
  flap_threshold: z.coerce.number().min(1),
})

const notifySchema = z.object({
  enable_notifications: z.boolean(),
  notify_events: z.array(z.string()),
  smtp_server: z.string().optional(),
  smtp_port: z.coerce.number().optional(),
  smtp_user: z.string().optional(),
  smtp_password: z.string().optional(),
  from_email: z.string().optional(),
  to_emails: z.string().optional(),
})

export default function AdminPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [siteName, setSiteName] = useState('服务监控系统')
  const [subtitle, setSubtitle] = useState('')
  const [list, setList] = useState<Monitor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [subsAll, setSubsAll] = useState<any[]>([])
  const [subFilterMonitorId, setSubFilterMonitorId] = useState<string>('') // 空值表示占位（未选择）
  const [subFilterEvent, setSubFilterEvent] = useState<string>('') // 空值表示占位（未选择）
  const [subFilterEmail, setSubFilterEmail] = useState<string>('')
  const [showMonitorForm, setShowMonitorForm] = useState(false)
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null)
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null)
  const [showGroupManager, setShowGroupManager] = useState(false)
  
  // Test notification state
  const [testType, setTestType] = useState('offline')
  const [testMonitor, setTestMonitor] = useState<string>('')

  // Forms
  const websiteForm = useForm<z.infer<typeof websiteSchema>>({
    resolver: zodResolver(websiteSchema),
    defaultValues: { site_name: '服务监控系统', subtitle: '', tab_subtitle: '' }
  })
  
  const dataForm = useForm<z.infer<typeof dataSchema>>({
    resolver: zodResolver(dataSchema) as any,
    defaultValues: {
      history_days_frontend: 30,
      retention_days: 30,
      check_interval_seconds: 60,
      debounce_seconds: 0,
      flap_threshold: 1
    }
  })

  const notifyForm = useForm<z.infer<typeof notifySchema>>({
    resolver: zodResolver(notifySchema) as any,
    defaultValues: {
      enable_notifications: true,
      notify_events: ['online', 'offline', 'ssl_expiry'],
      smtp_server: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '',
      from_email: '',
      to_emails: ''
    }
  })

  useEffect(() => {
    setMounted(true)
    if (!getToken()) {
      router.replace('/login')
      return
    }
    
    // Load initial data
    fetchData()
    getSettings().then(s => {
      websiteForm.reset({
        site_name: s.site_name || '服务监控系统',
        subtitle: s.subtitle || '',
        tab_subtitle: s.tab_subtitle || ''
      })
      setSiteName(s.site_name || '服务监控系统')
      setSubtitle(s.subtitle || '')
      if (s.tab_subtitle) document.title = `${s.site_name} - ${s.tab_subtitle}`
      else document.title = s.site_name
      dataForm.reset({
        history_days_frontend: s.history_days_frontend || 30,
        retention_days: s.retention_days || 30,
        check_interval_seconds: s.check_interval_seconds || 60,
        debounce_seconds: s.debounce_seconds || 0,
        flap_threshold: s.flap_threshold || 1
      })
      notifyForm.reset({
        enable_notifications: s.enable_notifications ?? true,
        notify_events: s.notify_events || ['online', 'offline', 'ssl_expiry'],
        smtp_server: s.smtp_server || '',
        smtp_port: s.smtp_port || 587,
        smtp_user: s.smtp_user || '',
        smtp_password: s.smtp_password || '',
        from_email: s.from_email || '',
        to_emails: s.to_emails || ''
      })
    }).catch(() => {})
  }, [router, websiteForm, dataForm, notifyForm])

  const fetchData = async () => {
    setLoading(true)
    try {
      const ms = await getMonitors()
      setList(Array.isArray(ms) ? ms : [])
      const gs = await getGroups()
      setGroups(Array.isArray(gs) ? gs : [])
      const subs = await getAllSubscriptions()
      setSubsAll(Array.isArray(subs) ? subs : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    router.push('/')
  }

  const onSaveWebsite = async (values: z.infer<typeof websiteSchema>) => {
    try {
      await updateSettings(values)
      toast.success('网站设置已保存')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const onSaveData = async (values: z.infer<typeof dataSchema>) => {
    try {
      await updateSettings(values)
      toast.success('数据设置已保存')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const onSaveNotify = async (values: z.infer<typeof notifySchema>) => {
    try {
      await updateSettings(values)
      toast.success('通知设置已保存')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const sendTestNotify = async () => {
    if (!testMonitor) {
      toast.warning('请选择站点')
      return
    }
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ type: testType, monitor_id: Number(testMonitor) })
      })
      if (!res.ok) throw new Error('测试通知发送失败')
      toast.success('测试通知已发送')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const deleteSub = async (id: number) => {
    try {
      await deleteSubscription(id)
      toast.success('已删除')
      setSubsAll(prev => prev.filter(x => x.id !== id))
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const confirmDeleteMonitor = async () => {
    if (!monitorToDelete) return
    try {
      await deleteMonitor(monitorToDelete.id)
      toast.success('监控项已删除')
      fetchData()
      setMonitorToDelete(null)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (!mounted) return null

  const showSkeleton = loading && list.length === 0
  const showOverlay = loading && list.length > 0

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50 backdrop-blur-[1px]">
      <div className="flex items-center gap-2 bg-background border px-4 py-2 rounded-md shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">更新中...</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-slate-200 dark:border-neutral-800 px-4 md:px-6 h-16 sticky top-0 z-50 transition-colors duration-300">
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
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="animate-title-in text-lg font-bold tracking-tight text-slate-800 dark:text-neutral-200 leading-none">{siteName}</h1>
              {subtitle && <span className="animate-subtitle-in subtitle-quote hidden sm:block text-slate-500 dark:text-neutral-400 text-xs leading-5 tracking-wide pl-8">{subtitle}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost">
                <Home className="mr-2 h-4 w-4" />
                首页
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
              <Power className="mr-2 h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          <Tabs defaultValue="sites" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sites"><MonitorIcon className="mr-2 h-4 w-4" /> 站点管理</TabsTrigger>
              <TabsTrigger value="subs"><Bell className="mr-2 h-4 w-4" /> 订阅列表</TabsTrigger>
              <TabsTrigger value="website"><Globe className="mr-2 h-4 w-4" /> 网站设置</TabsTrigger>
              <TabsTrigger value="data"><Database className="mr-2 h-4 w-4" /> 数据设置</TabsTrigger>
              <TabsTrigger value="notify"><Settings className="mr-2 h-4 w-4" /> 通知设置</TabsTrigger>
            </TabsList>

            <TabsContent value="sites">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>站点列表</CardTitle>
                    <div className="flex space-x-2">
                      <Button onClick={() => { setEditingMonitor(null); setShowMonitorForm(true) }}>
                        <Plus className="mr-2 h-4 w-4" /> 新建监控
                      </Button>
                      <Button variant="outline" onClick={() => setShowGroupManager(true)}>
                        <Settings className="mr-2 h-4 w-4" /> 分类管理
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {showOverlay && <LoadingOverlay />}
                  {showSkeleton ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">名称</TableHead>
                            <TableHead className="text-center">状态</TableHead>
                            <TableHead className="text-center">URL</TableHead>
                            <TableHead className="text-center">分组</TableHead>
                            <TableHead className="text-center">最近检查</TableHead>
                            <TableHead className="text-center">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-[100px] mx-auto" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-[60px] mx-auto rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[150px] mx-auto" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-[80px] mx-auto rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[150px] mx-auto" /></TableCell>
                              <TableCell><div className="flex gap-2 justify-center"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : list.length === 0 ? (
                    <Alert>
                      <AlertTitle>暂无监控项</AlertTitle>
                      <AlertDescription>点击右上方“新建监控”以添加站点监控。</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">名称</TableHead>
                            <TableHead className="text-center">状态</TableHead>
                            <TableHead className="text-center">URL</TableHead>
                            <TableHead className="text-center">分组</TableHead>
                            <TableHead className="text-center">最近检查</TableHead>
                            <TableHead className="text-center">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.map((r, index) => {
                            const g = groups.find(x => x.id === r.group_id)
                            return (
                              <TableRow 
                                key={r.id}
                                className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <TableCell className="font-medium text-center">{r.name}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <Badge variant={r.last_online ? "default" : "destructive"} className={r.last_online ? "bg-green-600" : ""}>
                                      {r.last_online ? '在线' : '离线'}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] text-center">
                                  <div className="truncate mx-auto">{r.url}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    {g ? (
                                      <Badge variant="outline" style={{ backgroundColor: g.color, color: g.color ? '#fff' : undefined, borderColor: g.color || undefined }}>
                                        {g.icon ? `${g.icon} ` : ''}{g.name}
                                      </Badge>
                                    ) : '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : '-'}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex space-x-2 justify-center">
                                    <Button size="sm" variant="outline" onClick={() => { setEditingMonitor(r); setShowMonitorForm(true) }}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => setMonitorToDelete(r)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subs">
              <Card>
                <CardHeader>
                  <CardTitle>订阅列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
                    <div className="w-full sm:w-[200px]">
                      <Select value={subFilterMonitorId} onValueChange={setSubFilterMonitorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="筛选站点" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ALL_MONITORS__">全部站点</SelectItem>
                          {list.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-[200px]">
                      <Select value={subFilterEvent} onValueChange={setSubFilterEvent}>
                        <SelectTrigger>
                          <SelectValue placeholder="筛选事件" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ALL_EVENTS__">全部事件</SelectItem>
                          <SelectItem value="online">在线</SelectItem>
                          <SelectItem value="offline">离线</SelectItem>
                          <SelectItem value="ssl_expiry">证书到期</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-[240px]">
                      <Input placeholder="筛选邮箱" value={subFilterEmail} onChange={(e) => setSubFilterEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>站点</TableHead>
                          <TableHead>邮箱</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>时间</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(subsAll.filter((sub) => {
                          const monitorOk =
                            subFilterMonitorId === '' || subFilterMonitorId === '__ALL_MONITORS__'
                              ? true
                              : String(sub.monitor_id) === subFilterMonitorId
                          const emailOk = subFilterEmail
                            ? String(sub.email || '').toLowerCase().includes(subFilterEmail.toLowerCase())
                            : true
                          const eventOk =
                            subFilterEvent === '' || subFilterEvent === '__ALL_EVENTS__'
                              ? true
                              : String(sub.notify_events || '')
                                  .split(',')
                                  .map((x: string) => x.trim())
                                  .includes(subFilterEvent)
                          return monitorOk && emailOk && eventOk
                        })).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Alert>
                                <AlertTitle>暂无订阅</AlertTitle>
                                <AlertDescription>没有匹配的订阅结果，试试调整筛选条件。</AlertDescription>
                              </Alert>
                            </TableCell>
                          </TableRow>
                        ) : (subsAll.filter((sub) => {
                          const monitorOk =
                            subFilterMonitorId === '' || subFilterMonitorId === '__ALL_MONITORS__'
                              ? true
                              : String(sub.monitor_id) === subFilterMonitorId
                          const emailOk = subFilterEmail
                            ? String(sub.email || '').toLowerCase().includes(subFilterEmail.toLowerCase())
                            : true
                          const eventOk =
                            subFilterEvent === '' || subFilterEvent === '__ALL_EVENTS__'
                              ? true
                              : String(sub.notify_events || '')
                                  .split(',')
                                  .map((x: string) => x.trim())
                                  .includes(subFilterEvent)
                          return monitorOk && emailOk && eventOk
                        })).map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>{sub.monitor_name}</TableCell>
                            <TableCell>{sub.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {sub.notify_events?.split(',').map((e: string, i: number) => {
                                  const t = e.trim()
                                  if (!t) return null
                                  const label = t === 'offline' ? '离线' : t === 'online' ? '恢复' : t === 'ssl_expiry' ? '证书到期' : t
                                  return <Badge key={i} variant="secondary" className="whitespace-nowrap">{label}</Badge>
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={sub.verified ? "default" : "secondary"} className={sub.verified ? "bg-green-600" : ""}>
                                {sub.verified ? '已验证' : '待验证'}
                              </Badge>
                            </TableCell>
                            <TableCell>{sub.created_at ? new Date(sub.created_at).toLocaleString() : '-'}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="destructive" onClick={() => deleteSub(sub.id)}>删除</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="website">
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>基础信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...websiteForm}>
                    <form onSubmit={websiteForm.handleSubmit(onSaveWebsite)} className="space-y-4">
                      <FormField
                        control={websiteForm.control}
                        name="site_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>网站名称</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={websiteForm.control}
                        name="subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>副标题</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={websiteForm.control}
                        name="tab_subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>标签页副标题</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">保存网站设置</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>数据与检测</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...dataForm}>
                    <form onSubmit={dataForm.handleSubmit(onSaveData)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={dataForm.control}
                          name="history_days_frontend"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>历史数据时间范围(天)</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dataForm.control}
                          name="retention_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>数据保留天数(后端)</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dataForm.control}
                          name="check_interval_seconds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>网站检测间隔(秒)</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dataForm.control}
                          name="debounce_seconds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>防抖时间(秒)</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={dataForm.control}
                        name="flap_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>震荡次数阈值</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">保存数据设置</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notify">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>通知配置</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...notifyForm}>
                    <form onSubmit={notifyForm.handleSubmit(onSaveNotify)} className="space-y-6">
                      <FormField
                        control={notifyForm.control}
                        name="enable_notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">开启通知</FormLabel>
                              <FormDescription>全局启用或禁用通知发送</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notifyForm.control}
                        name="notify_events"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">通知事件</FormLabel>
                            </div>
                            <div className="flex gap-4">
                              {['online', 'offline', 'ssl_expiry'].map((item) => (
                                <FormField
                                  key={item}
                                  control={notifyForm.control}
                                  name="notify_events"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, item])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {item === 'online' ? '恢复' : item === 'offline' ? '离线' : '证书到期'}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">邮件通知</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={notifyForm.control}
                            name="smtp_server"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP服务器</FormLabel>
                                <FormControl><Input placeholder="smtp.example.com" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notifyForm.control}
                            name="smtp_port"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>端口</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notifyForm.control}
                            name="from_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>发件邮箱</FormLabel>
                                <FormControl><Input placeholder="noreply@example.com" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notifyForm.control}
                            name="smtp_user"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>用户名</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notifyForm.control}
                            name="smtp_password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>密码</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notifyForm.control}
                            name="to_emails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>收件人邮箱(逗号分隔)</FormLabel>
                                <FormControl><Input placeholder="a@example.com,b@example.com" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <Button type="submit">保存通知设置</Button>
                    </form>
                  </Form>
                  
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">测试通知</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="w-full sm:w-[200px]">
                        <label className="text-sm font-medium mb-2 block">类型</label>
                        <Select value={testType} onValueChange={setTestType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">在线</SelectItem>
                            <SelectItem value="offline">离线</SelectItem>
                            <SelectItem value="ssl_expiry">证书到期</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-[300px]">
                        <label className="text-sm font-medium mb-2 block">选择站点</label>
                        <Select value={testMonitor} onValueChange={setTestMonitor}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择站点" />
                          </SelectTrigger>
                          <SelectContent>
                            {list.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={sendTestNotify}>发送测试通知</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MonitorForm 
        visible={showMonitorForm} 
        onClose={() => setShowMonitorForm(false)} 
        editing={editingMonitor} 
        groups={groups} 
        onOk={() => { setShowMonitorForm(false); fetchData() }} 
      />
      
      <GroupManager 
        visible={showGroupManager} 
        onClose={() => setShowGroupManager(false)} 
        groups={groups} 
        onOk={() => { fetchData() }} 
      />

      <AlertDialog open={!!monitorToDelete} onOpenChange={(open) => !open && setMonitorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除监控项 "{monitorToDelete?.name}" 吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。该监控项的历史数据将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMonitor} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
