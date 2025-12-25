'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { getNotifications, getSetupState, getSettings } from '@/lib/api'
import { NotificationItem } from '@/types'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notices, setNotices] = useState<NotificationItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 50

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getNotifications(page, pageSize)
      setNotices(res.items || [])
      setTotal(res.total || 0)
    } catch (e) {
      toast.error('获取通知失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  useEffect(() => {
    getSettings().then(s => {
      if (s.site_name) document.title = `${s.site_name} - 异常通知记录`
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-screen-xl mx-auto flex h-14 items-center px-4 md:px-6">
          <Button variant="ghost" size="icon" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>异常通知历史记录</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-4 md:px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>全部记录 ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && notices.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                暂无异常记录
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">时间</TableHead>
                      <TableHead className="w-[150px]">站点</TableHead>
                      <TableHead className="w-[100px]">类型</TableHead>
                      <TableHead>消息</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notice.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {notice.monitor_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={notice.type === 'status_change' ? 'destructive' : notice.type === 'ssl_expiry' ? 'secondary' : 'default'} className="whitespace-nowrap">
                            {notice.type === 'status_change' ? '状态变更' : notice.type === 'ssl_expiry' ? 'SSL过期' : notice.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[400px] truncate" title={notice.message}>
                          {notice.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {total > pageSize && (
              <div className="flex items-center justify-between px-2 mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {total} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(1)}
                    disabled={page === 1 || loading}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    第 {page} / {Math.ceil(total / pageSize)} 页
                  </div>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= total || loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(Math.ceil(total / pageSize))}
                    disabled={page * pageSize >= total || loading}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
