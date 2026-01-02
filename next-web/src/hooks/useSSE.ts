import { useEffect } from 'react'
import { sseManager } from '@/lib/sse'
import { useSSEStore, useMonitorStore } from '@/stores'
import type { SSEEvent, NotificationItem } from '@/types/index'

interface UseSSEReturn {
  connected: boolean
  notifications: NotificationItem[]
  lastEvent: SSEEvent | null
}

let notificationIdCounter = 0

/**
 * Hook for managing SSE connection and events
 */
export function useSSE(): UseSSEReturn {
  const {
    connected,
    notifications,
    lastEvent,
    setConnected,
    setLastEvent,
    addNotification,
  } = useSSEStore()
  
  const { updateMonitor, setLatestResult } = useMonitorStore()

  useEffect(() => {
    // Handle connection state changes
    const unsubConnection = sseManager.onConnectionChange((isConnected) => {
      setConnected(isConnected)
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
          id: ++notificationIdCounter,
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
      // Don't disconnect here - let SSEProvider manage the connection lifecycle
    }
  }, [setConnected, setLastEvent, addNotification, updateMonitor, setLatestResult])

  return {
    connected,
    notifications,
    lastEvent,
  }
}
