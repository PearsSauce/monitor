'use client'

import { Monitor, Group, SSLInfo } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ExternalLink } from 'lucide-react'
import { StatusBar } from './StatusBar'
import { SvgIcon } from './SvgIcon'

interface MonitorListProps {
  monitors: Monitor[]
  groups: Group[]
  latest: Record<number, number>
  sslMap: Record<number, SSLInfo>
  loading?: boolean
  onDetail: (monitor: Monitor) => void
  onSubscribe: (monitor: Monitor) => void
}

export function MonitorList({ monitors, groups, latest, sslMap, loading, onDetail, onSubscribe }: MonitorListProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead className="text-center">状态</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-center">分组</TableHead>
            <TableHead className="text-center">响应</TableHead>
            <TableHead className="text-center">30天状态</TableHead>
            <TableHead className="text-center">SSL剩余</TableHead>
            <TableHead>最近检查</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[60px] mx-auto rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] mx-auto rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px] mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px] mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></TableCell>
              </TableRow>
            ))
          ) : monitors.map((r) => {
            const g = groups.find(x => x.id === r.group_id)
            const ssl = sslMap[r.id]
            
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
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
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="truncate max-w-[200px]">{r.url}</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
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
                <TableCell>
                  {r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onDetail(r)}>详情</Button>
                    <Button variant="outline" size="sm" onClick={() => onSubscribe(r)}>订阅</Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
