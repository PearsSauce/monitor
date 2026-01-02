'use client'

import { Monitor, Group } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Plus, Settings, Trash2, Edit, Loader2, ExternalLink } from 'lucide-react'

interface SitesTabProps {
  list: Monitor[]
  groups: Group[]
  loading: boolean
  onNewMonitor: () => void
  onEditMonitor: (monitor: Monitor) => void
  onDeleteMonitor: (monitor: Monitor) => void
  onOpenGroupManager: () => void
}

export function SitesTab({
  list,
  groups,
  loading,
  onNewMonitor,
  onEditMonitor,
  onDeleteMonitor,
  onOpenGroupManager,
}: SitesTabProps) {
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

  const MobileCardSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex justify-between items-start mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const MobileCardView = () => (
    <div className="space-y-4">
      {list.map((r, index) => {
        const g = groups.find(x => x.id === r.group_id)
        return (
          <Card 
            key={r.id}
            className="p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{r.name}</h3>
                <a 
                  href={r.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                >
                  {r.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
              <Badge 
                variant={r.last_online ? "default" : "destructive"} 
                className={`ml-2 flex-shrink-0 ${r.last_online ? "bg-green-600" : ""}`}
              >
                {r.last_online ? '在线' : '离线'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3 text-sm">
              {g && (
                <Badge variant="outline" style={{ backgroundColor: g.color, color: g.color ? '#fff' : undefined, borderColor: g.color || undefined }}>
                  {g.icon ? `${g.icon} ` : ''}{g.name}
                </Badge>
              )}
              {r.last_checked_at && (
                <span className="text-xs text-muted-foreground">
                  {new Date(r.last_checked_at).toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEditMonitor(r)}>
                <Edit className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDeleteMonitor(r)}>
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>站点列表</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onNewMonitor}>
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">新建监控</span>
              <span className="sm:hidden">新建</span>
            </Button>
            <Button size="sm" variant="outline" onClick={onOpenGroupManager}>
              <Settings className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">分类管理</span>
              <span className="sm:hidden">分类</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {showOverlay && <LoadingOverlay />}
        
        {showSkeleton ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
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
            {/* Mobile skeleton */}
            <div className="md:hidden">
              <MobileCardSkeleton />
            </div>
          </>
        ) : list.length === 0 ? (
          <Alert>
            <AlertTitle>暂无监控项</AlertTitle>
            <AlertDescription>点击右上方"新建监控"以添加站点监控。</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
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
                            <Button size="sm" variant="outline" onClick={() => onEditMonitor(r)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => onDeleteMonitor(r)}>
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
            
            {/* Mobile card view */}
            <div className="md:hidden">
              <MobileCardView />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
