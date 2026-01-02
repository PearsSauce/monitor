'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { getSettings, getLatestResult } from '@/lib/api'

interface SystemStatusProps {
  className?: string
}

export function SystemStatus({ className }: SystemStatusProps) {
  const [enabled, setEnabled] = useState(false)
  const [monitorId, setMonitorId] = useState<number | null>(null)
  const [status, setStatus] = useState<'loading' | 'online' | 'offline' | 'error'>('loading')
  const [responseMs, setResponseMs] = useState<number>(0)
  const esRef = useRef<EventSource | null>(null)

  // Load settings on mount
  useEffect(() => {
    getSettings().then(s => {
      setEnabled(s.show_system_status || false)
      setMonitorId(s.status_monitor_id || null)
    }).catch(() => {
      setEnabled(false)
    })
  }, [])

  // Fetch initial status and setup SSE
  useEffect(() => {
    if (!enabled || !monitorId) {
      setStatus('loading')
      return
    }

    // Fetch initial status
    getLatestResult(monitorId).then(data => {
      if (data) {
        setStatus(data.online ? 'online' : 'offline')
        setResponseMs(data.response_ms || 0)
      } else {
        setStatus('error')
      }
    }).catch(() => {
      setStatus('error')
    })

    // Setup SSE for real-time updates
    const es = new EventSource('/api/events')
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        if (ev.MonitorID === monitorId) {
          setStatus(ev.Online ? 'online' : 'offline')
          setResponseMs(ev.ResponseMs || 0)
        }
      } catch {}
    }

    es.onerror = () => {
      // SSE connection error, keep current status
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [enabled, monitorId])

  // Don't render if disabled or no monitor selected
  if (!enabled || !monitorId || status === 'loading' || status === 'error') {
    return null
  }

  return (
    <>
      <div className="h-3 w-[1px] bg-slate-200 dark:bg-neutral-800" />
      <div className={cn("flex items-center gap-2", className)}>
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
          <>
            <div className="h-3 w-[1px] bg-slate-200 dark:bg-neutral-800" />
            <span className="text-[10px] text-muted-foreground">
              {responseMs}ms
            </span>
          </>
        )}
      </div>
    </>
  )
}
