'use client'

import { useEffect, useRef } from 'react'
import { sseManager } from '@/lib/sse'
import { useSSEStore, useMonitorStore } from '@/stores'
import type { SSEEvent, NotificationItem } from '@/types/index'

interface SSEProviderProps {
  children: React.ReactNode
}

/**
 * SSE Provider - Manages SSE connection at app level
 * Connects SSE events to global stores
 */
export function SSEProvider({ children }: SSEProviderProps) {
  const setConnected = useSSEStore((state) => state.setConnected)
  const setLastEvent = useSSEStore((state) => state.setLastEvent)
  const addNotification = useSSEStore((state) => state.addNotification)
  const updateMonitor = useMonitorStore((state) => state.updateMonitor)
  const setLatestResult = useMonitorStore((state) => state.setLatestResult)
  
  const notificationIdRef = useRef(0)

  useEffect(() => {
    // Handle connection state changes
    const unsubConnection = sseManager.onConnectionChange((connected) => {
      setConnected(connected)
    })

    // Handle SSE messages
    const unsubMessage = sseManager.onMessage((event: SSEEvent) => {
      setLastEvent(event)
      
      // Update monitor state
      if (event.MonitorID) {
        updateMonitor(event.MonitorID, {
          last_online: event.Online,
          last_checked_at: event.CheckedAt,
        })
        
        if (typeof event.ResponseMs === 'number') {
          setLatestResult(event.MonitorID, event.ResponseMs)
        }
      }
      
      // Create notification for status changes
      if (event.EventType === 'status_change' || event.EventType === 'ssl_expiry') {
        const notification: NotificationItem = {
          id: ++notificationIdRef.current,
          monitor_id: event.MonitorID,
          created_at: event.CheckedAt,
          type: event.EventType,
          message: event.Message || (event.Online ? '服务恢复在线' : '服务离线'),
          monitor_name: event.MonitorName || `Monitor ${event.MonitorID}`,
        }
        addNotification(notification)
      }
    })

    // Connect to SSE
    sseManager.connect()

    // Cleanup on unmount
    return () => {
      unsubConnection()
      unsubMessage()
      sseManager.disconnect()
    }
  }, [setConnected, setLastEvent, addNotification, updateMonitor, setLatestResult])

  return <>{children}</>
}
