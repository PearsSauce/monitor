'use client'

import { Monitor, Group, SSLInfo } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ExternalLink, Loader2 } from 'lucide-react'
import { StatusBar } from './StatusBar'
import { SvgIcon } from './SvgIcon'
import { Card } from '@/components/ui/card'

interface MonitorListProps {
  monitors: Monitor[]
  groups: Group[]
  latest: Record<number, number>
  sslMap: Record<number, SSLInfo>
  loading?: boolean
  onDetail: (monitor: Monitor) => void
}

export function MonitorList({ monitors, groups, latest, sslMap, loading, onDetail }: MonitorListProps) {
  // 首次加载显示骨架屏（loading && monitors为空），后续更新显示覆盖层（loading && monitors不为空）
  const showSkeleton = loading && monitors.length === 0
  const showOverlay = loading && monitors.length > 0

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50 backdrop-blur-[1px]">
      <div className="flex items-center gap-2 bg-background border px-4 py-2 rounded-md shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">更新中...</span>
      </div>
    </div>
  )
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card relative">
        {showOverlay && <LoadingOverlay />}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">名称</TableHead>
              <TableHead className="text-center">状态</TableHead>
              <TableHead className="text-center">分组</TableHead>
              <TableHead className="text-center">响应</TableHead>
              <TableHead className="text-center">30天状态</TableHead>
              <TableHead className="text-center">SSL剩余</TableHead>
              <TableHead className="text-center">最近检查</TableHead>
              <TableHead className="text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px] mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></TableCell>
                </TableRow>
              ))
            ) : monitors.map((r, index) => {
              const g = groups.find(x => x.id === r.group_id)
              const ssl = sslMap[r.id]
              
              return (
                <TableRow 
                  key={r.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-medium text-center">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-colors flex items-center gap-1 w-fit mx-auto">
                      {r.name}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={r.last_online ? "default" : "destructive"} className={r.last_online ? "bg-green-600 hover:bg-green-700" : ""}>
                            {r.last_online ? '在线' : '离线'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{r.last_online ? '服务正常运行中' : '服务当前不可用'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    {g ? (
                      <Badge variant="outline" style={{ backgroundColor: g.color, color: g.color ? '#fff' : undefined, borderColor: g.color || undefined }}>
                        <span className="inline-flex items-center gap-1">
                          {g.icon && g.icon.toLowerCase().includes('<svg') ? <SvgIcon html={g.icon} size={16} /> : (g.icon ? <span>{g.icon}</span> : null)}
                          <span>{g.name}</span>
                        </span>
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof latest[r.id] === 'number' ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default">{latest[r.id]} ms</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>实时响应时间</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StatusBar monitorId={r.id} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {ssl && typeof ssl.days_left === 'number' ? `${ssl.days_left}天` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-2 justify-center">
                      <Button variant="outline" size="sm" onClick={() => onDetail(r)}>详情</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 relative min-h-[200px]">
        {showOverlay && <LoadingOverlay />}
        {showSkeleton ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-md border bg-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : monitors.map((r, index) => {
          const g = groups.find(x => x.id === r.group_id)
          const ssl = sslMap[r.id]
          
          return (
            <Card 
              key={r.id} 
              className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-base hover:text-primary hover:underline transition-colors flex items-center gap-1">
                    {r.name}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                  <div className="text-xs text-muted-foreground">
                    {r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : '从未检查'}
                  </div>
                </div>
                <Badge variant={r.last_online ? "default" : "destructive"} className={r.last_online ? "bg-green-600" : ""}>
                  {r.last_online ? '在线' : '离线'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-[3rem]">分组:</span>
                  {g ? (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5" style={{ backgroundColor: g.color, color: g.color ? '#fff' : undefined, borderColor: g.color || undefined }}>
                      <span className="inline-flex items-center gap-1">
                        {g.icon && g.icon.toLowerCase().includes('<svg') ? <SvgIcon html={g.icon} size={12} /> : (g.icon ? <span>{g.icon}</span> : null)}
                        <span className="truncate max-w-[80px]">{g.name}</span>
                      </span>
                    </Badge>
                  ) : <span className="text-muted-foreground">-</span>}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-[3rem]">响应:</span>
                  <span>{typeof latest[r.id] === 'number' ? `${latest[r.id]} ms` : '-'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-[3rem]">SSL:</span>
                  <span>{ssl && typeof ssl.days_left === 'number' ? `${ssl.days_left}天` : '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">30天状态</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onDetail(r)}>
                    详情 &gt;
                  </Button>
                </div>
                <div className="flex justify-center overflow-hidden">
                  <StatusBar monitorId={r.id} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
