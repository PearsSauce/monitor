'use client'

import { useEffect, useState, useMemo } from 'react'
import { getHistoryByDay } from '@/lib/api'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function StatusBar({ monitorId }: { monitorId: number }) {
  const [items, setItems] = useState<any[]>([])
  
  useEffect(() => {
    getHistoryByDay(monitorId, 30).then(data => {
      // 补全30天数据
      const map = new Map()
      if (Array.isArray(data)) {
        data.forEach((i: any) => map.set(new Date(i.day).toLocaleDateString(), i))
      }
      const list = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const k = d.toLocaleDateString()
        list.push({ day: d.toISOString(), ...(map.get(k) || { total_count: 0, online_count: 0 }) })
      }
      setItems(list)
    }).catch(() => {})
  }, [monitorId])

  const blocks = useMemo(() => {
    return items.map((i, idx) => {
      const ratio = i.total_count ? i.online_count / i.total_count : 0
      let color = 'bg-red-500'
      if (i.total_count === 0) color = 'bg-gray-200 dark:bg-gray-800' // No data
      else if (ratio >= 0.9) color = 'bg-green-600'
      else if (ratio >= 0.7) color = 'bg-green-500'
      else if (ratio >= 0.5) color = 'bg-yellow-500'
      else if (ratio >= 0.3) color = 'bg-orange-500'
      
      const titleParts = [
        `${new Date(i.day).toLocaleDateString()}`,
        i.total_count ? `在线率 ${Math.round(ratio * 100)}%` : '无数据',
      ]
      if (typeof i.avg_response_ms === 'number') {
        titleParts.push(`平均响应 ${Math.round(i.avg_response_ms)} ms`)
      }
      const title = titleParts.join('，')
      
      return (
        <TooltipProvider key={idx}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("h-4 w-1.5 sm:w-2 md:w-3 rounded-sm transition-transform duration-200 hover:scale-125 cursor-help", color)}></div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    })
  }, [items])

  return <div className="flex items-center gap-[2px]">{blocks}</div>
}
