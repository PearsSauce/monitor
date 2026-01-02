'use client'

import { useState, useMemo } from 'react'
import { Monitor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Subscription {
  id: number
  monitor_id: number
  monitor_name: string
  email: string
  notify_events: string
  verified: boolean
  created_at: string
}

interface SubsTabProps {
  subscriptions: Subscription[]
  monitors: Monitor[]
  onDeleteSubscription: (id: number) => void
}

export function SubsTab({ subscriptions, monitors, onDeleteSubscription }: SubsTabProps) {
  const [filterMonitorId, setFilterMonitorId] = useState<string>('')
  const [filterEvent, setFilterEvent] = useState<string>('')
  const [filterEmail, setFilterEmail] = useState<string>('')

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((sub) => {
      const monitorOk =
        filterMonitorId === '' || filterMonitorId === '__ALL_MONITORS__'
          ? true
          : String(sub.monitor_id) === filterMonitorId
      const emailOk = filterEmail
        ? String(sub.email || '').toLowerCase().includes(filterEmail.toLowerCase())
        : true
      const eventOk =
        filterEvent === '' || filterEvent === '__ALL_EVENTS__'
          ? true
          : String(sub.notify_events || '')
              .split(',')
              .map((x: string) => x.trim())
              .includes(filterEvent)
      return monitorOk && emailOk && eventOk
    })
  }, [subscriptions, filterMonitorId, filterEvent, filterEmail])

  return (
    <Card>
      <CardHeader>
        <CardTitle>订阅列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
          <div className="w-full sm:w-[200px]">
            <Select value={filterMonitorId} onValueChange={setFilterMonitorId}>
              <SelectTrigger>
                <SelectValue placeholder="筛选站点" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL_MONITORS__">全部站点</SelectItem>
                {monitors.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={filterEvent} onValueChange={setFilterEvent}>
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
            <Input placeholder="筛选邮箱" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} />
          </div>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>站点</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead className="hidden sm:table-cell">类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="hidden md:table-cell">时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Alert>
                      <AlertTitle>暂无订阅</AlertTitle>
                      <AlertDescription>没有匹配的订阅结果，试试调整筛选条件。</AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.monitor_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{sub.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
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
                    <TableCell className="hidden md:table-cell">{sub.created_at ? new Date(sub.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteSubscription(sub.id)}>删除</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
