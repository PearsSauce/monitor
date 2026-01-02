'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, setToken, getMonitors, getGroups, deleteMonitor, getSettings, updateSettings, getAllSubscriptions, deleteSubscription } from '@/lib/api'
import { Monitor, Group } from '@/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { MonitorForm } from '@/components/MonitorForm'
import { GroupManager } from '@/components/GroupManager'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Home, Power, Monitor as MonitorIcon, Bell, Database, Globe, Settings } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

import { SitesTab } from './components/SitesTab'
import { SubsTab } from './components/SubsTab'
import { WebsiteTab } from './components/WebsiteTab'
import { DataTab } from './components/DataTab'
import { NotifyTab } from './components/NotifyTab'

const websiteSchema = z.object({
  site_name: z.string().min(1, "Required"),
  subtitle: z.string().optional(),
  tab_subtitle: z.string().optional(),
  show_system_status: z.boolean().optional(),
  status_monitor_id: z.number().optional(),
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
  const [showMonitorForm, setShowMonitorForm] = useState(false)
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null)
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null)
  const [showGroupManager, setShowGroupManager] = useState(false)
  const [testType, setTestType] = useState('offline')
  const [testMonitor, setTestMonitor] = useState<string>('')

  const websiteForm = useForm<z.infer<typeof websiteSchema>>({
    resolver: zodResolver(websiteSchema),
    defaultValues: { site_name: '服务监控系统', subtitle: '', tab_subtitle: '', show_system_status: false, status_monitor_id: undefined }
  })
  
  const dataForm = useForm<z.infer<typeof dataSchema>>({
    resolver: zodResolver(dataSchema) as any,
    defaultValues: { history_days_frontend: 30, retention_days: 30, check_interval_seconds: 60, debounce_seconds: 0, flap_threshold: 1 }
  })

  const notifyForm = useForm<z.infer<typeof notifySchema>>({
    resolver: zodResolver(notifySchema) as any,
    defaultValues: { enable_notifications: true, notify_events: ['online', 'offline', 'ssl_expiry'], smtp_server: '', smtp_port: 587, smtp_user: '', smtp_password: '', from_email: '', to_emails: '' }
  })

  useEffect(() => {
    setMounted(true)
    if (!getToken()) { router.replace('/login'); return }
    fetchData()
    getSettings().then(s => {
      websiteForm.reset({ site_name: s.site_name || '服务监控系统', subtitle: s.subtitle || '', tab_subtitle: s.tab_subtitle || '', show_system_status: s.show_system_status || false, status_monitor_id: s.status_monitor_id || undefined })
      setSiteName(s.site_name || '服务监控系统')
      setSubtitle(s.subtitle || '')
      if (s.tab_subtitle) document.title = s.site_name + ' - ' + s.tab_subtitle
      else document.title = s.site_name
      dataForm.reset({ history_days_frontend: s.history_days_frontend || 30, retention_days: s.retention_days || 30, check_interval_seconds: s.check_interval_seconds || 60, debounce_seconds: s.debounce_seconds || 0, flap_threshold: s.flap_threshold || 1 })
      notifyForm.reset({ enable_notifications: s.enable_notifications ?? true, notify_events: s.notify_events || ['online', 'offline', 'ssl_expiry'], smtp_server: s.smtp_server || '', smtp_port: s.smtp_port || 587, smtp_user: s.smtp_user || '', smtp_password: s.smtp_password || '', from_email: s.from_email || '', to_emails: s.to_emails || '' })
    }).catch(() => {})
  }, [router, websiteForm, dataForm, notifyForm])

  const fetchData = async () => {
    setLoading(true)
    try {
      const ms = await getMonitors(); setList(Array.isArray(ms) ? ms : [])
      const gs = await getGroups(); setGroups(Array.isArray(gs) ? gs : [])
      const subs = await getAllSubscriptions(); setSubsAll(Array.isArray(subs) ? subs : [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleLogout = () => { setToken(''); router.push('/') }
  const onSaveWebsite = async (values: z.infer<typeof websiteSchema>) => { try { await updateSettings(values); toast.success('网站设置已保存') } catch (e: any) { toast.error(e.message) } }
  const onSaveData = async (values: z.infer<typeof dataSchema>) => { try { await updateSettings(values); toast.success('数据设置已保存') } catch (e: any) { toast.error(e.message) } }
  const onSaveNotify = async (values: z.infer<typeof notifySchema>) => { try { await updateSettings(values); toast.success('通知设置已保存') } catch (e: any) { toast.error(e.message) } }
  
  const sendTestNotify = async () => {
    if (!testMonitor) { toast.warning('请选择站点'); return }
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ type: testType, monitor_id: Number(testMonitor) }) })
      if (!res.ok) throw new Error('测试通知发送失败')
      toast.success('测试通知已发送')
    } catch (e: any) { toast.error(e.message) }
  }
  
  const deleteSub = async (id: number) => { try { await deleteSubscription(id); toast.success('已删除'); setSubsAll(prev => prev.filter(x => x.id !== id)) } catch (e: any) { toast.error(e.message) } }
  const confirmDeleteMonitor = async () => { if (!monitorToDelete) return; try { await deleteMonitor(monitorToDelete.id); toast.success('监控项已删除'); fetchData(); setMonitorToDelete(null) } catch (e: any) { toast.error(e.message) } }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-slate-200 dark:border-neutral-800 px-4 md:px-6 h-16 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-neutral-200 leading-none">{siteName}</h1>
              {subtitle && <span className="hidden sm:block text-slate-500 dark:text-neutral-400 text-xs leading-5 tracking-wide">{subtitle}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/"><Button variant="ghost" size="sm"><Home className="mr-2 h-4 w-4" /><span className="hidden sm:inline">首页</span></Button></Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"><Power className="mr-2 h-4 w-4" /><span className="hidden sm:inline">退出</span></Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          <Tabs defaultValue="sites" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="sites" className="text-xs sm:text-sm"><MonitorIcon className="mr-1 sm:mr-2 h-4 w-4" /><span className="hidden xs:inline">站点管理</span><span className="xs:hidden">站点</span></TabsTrigger>
              <TabsTrigger value="subs" className="text-xs sm:text-sm"><Bell className="mr-1 sm:mr-2 h-4 w-4" /><span className="hidden xs:inline">订阅列表</span><span className="xs:hidden">订阅</span></TabsTrigger>
              <TabsTrigger value="website" className="text-xs sm:text-sm"><Globe className="mr-1 sm:mr-2 h-4 w-4" /><span className="hidden xs:inline">网站设置</span><span className="xs:hidden">网站</span></TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm"><Database className="mr-1 sm:mr-2 h-4 w-4" /><span className="hidden xs:inline">数据设置</span><span className="xs:hidden">数据</span></TabsTrigger>
              <TabsTrigger value="notify" className="text-xs sm:text-sm"><Settings className="mr-1 sm:mr-2 h-4 w-4" /><span className="hidden xs:inline">通知设置</span><span className="xs:hidden">通知</span></TabsTrigger>
            </TabsList>

            <TabsContent value="sites"><SitesTab list={list} groups={groups} loading={loading} onNewMonitor={() => { setEditingMonitor(null); setShowMonitorForm(true) }} onEditMonitor={(m) => { setEditingMonitor(m); setShowMonitorForm(true) }} onDeleteMonitor={setMonitorToDelete} onOpenGroupManager={() => setShowGroupManager(true)} /></TabsContent>
            <TabsContent value="subs"><SubsTab subscriptions={subsAll} monitors={list} onDeleteSubscription={deleteSub} /></TabsContent>
            <TabsContent value="website"><WebsiteTab form={websiteForm} onSubmit={onSaveWebsite} monitors={list} /></TabsContent>
            <TabsContent value="data"><DataTab form={dataForm} onSubmit={onSaveData} /></TabsContent>
            <TabsContent value="notify"><NotifyTab form={notifyForm} onSubmit={onSaveNotify} monitors={list} testType={testType} testMonitor={testMonitor} onTestTypeChange={setTestType} onTestMonitorChange={setTestMonitor} onSendTest={sendTestNotify} /></TabsContent>
          </Tabs>
        </div>
      </main>

      <MonitorForm visible={showMonitorForm} onClose={() => setShowMonitorForm(false)} editing={editingMonitor} groups={groups} onOk={() => { setShowMonitorForm(false); fetchData() }} />
      <GroupManager visible={showGroupManager} onClose={() => setShowGroupManager(false)} groups={groups} onOk={() => { fetchData() }} />

      <AlertDialog open={!!monitorToDelete} onOpenChange={(open) => !open && setMonitorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除监控项 "{monitorToDelete?.name}" 吗？</AlertDialogTitle>
            <AlertDialogDescription>此操作无法撤销。该监控项的历史数据将被永久删除。</AlertDialogDescription>
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
