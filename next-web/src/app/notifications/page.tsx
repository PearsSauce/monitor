'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react'
import { getNotifications, getSetupState, getSettings, deleteNotification } from '@/lib/api'
import { NotificationItem } from '@/types'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Pagination } from '@/components/ui/pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notices, setNotices] = useState<NotificationItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [noticeToDelete, setNoticeToDelete] = useState<NotificationItem | null>(null)

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

  const confirmDelete = async () => {
    if (!noticeToDelete) return
    try {
      await deleteNotification(noticeToDelete.id)
      toast.success('已删除')
      setNoticeToDelete(null)
      fetchData()
    } catch {
      toast.error('删除失败')
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
          <Button variant="ghost" size="icon" className="mr-3" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>异常通知历史记录</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
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
              <Alert className="my-4">
                <AlertTitle>暂无异常记录</AlertTitle>
                <AlertDescription>近期没有任何异常或通知事件。</AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">时间</TableHead>
                      <TableHead className="w-[150px]">站点</TableHead>
                      <TableHead className="w-[100px]">类型</TableHead>
                      <TableHead>消息</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
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
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setNoticeToDelete(notice)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {total > pageSize && (
              <div className="mt-4">
                <div className="flex items-center justify-between px-2">
                  <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
                  <Pagination
                    page={page}
                    pageCount={Math.ceil(total / pageSize)}
                    onChange={(p) => setPage(p)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <AlertDialog open={!!noticeToDelete} onOpenChange={(open) => !open && setNoticeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除这条通知吗？</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
