'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface StatusResponse {
  checked_at: string
  online: boolean
  status_code: number
  response_ms: number
  error: string
}

export function SystemStatus() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline' | 'error'>('loading')
  const [responseMs, setResponseMs] = useState<number>(0)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/monitors/256394312759680/latest')
        if (!res.ok) throw new Error('Failed to fetch')
        const data: StatusResponse = await res.json()
        setStatus(data.online ? 'online' : 'offline')
        setResponseMs(data.response_ms)
      } catch (error) {
        console.error('Failed to fetch system status:', error)
        setStatus('error')
      }
    }

    fetchStatus()
    // Optional: Poll every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading' || status === 'error') return null

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          status === 'online' ? "bg-green-500" : "bg-red-500"
        )}></span>
      </div>
      <span className={cn(
        "text-xs font-medium",
        status === 'online' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        {status === 'online' ? '正常运行' : '运行异常'}
      </span>
      {status === 'online' && responseMs > 0 && (
        <span className="text-[10px] text-muted-foreground border-l pl-2 border-slate-200 dark:border-neutral-700">
          {responseMs}ms
        </span>
      )}
    </div>
  )
}
