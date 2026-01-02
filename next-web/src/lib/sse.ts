import type { SSEEvent } from '@/types/index'
import { API_BASE } from './api'

type MessageHandler = (event: SSEEvent) => void

/**
 * SSE Manager - Singleton pattern for managing Server-Sent Events connection
 * Implements exponential backoff for reconnection
 */
class SSEManager {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private baseDelay = 1000 // 1 second
  private maxDelay = 30000 // 30 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private connectionHandlers: Set<(connected: boolean) => void> = new Set()
  private isConnecting = false
  private shouldReconnect = true

  /**
   * Connect to SSE endpoint
   */
  connect(): void {
    if (this.eventSource || this.isConnecting) {
      return
    }

    this.isConnecting = true
    this.shouldReconnect = true

    try {
      const url = `${API_BASE}/api/events`
      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.notifyConnectionChange(true)
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data)
          this.notifyMessage(data)
        } catch (e) {
          console.error('Failed to parse SSE message:', e)
        }
      }

      this.eventSource.onerror = () => {
        this.isConnecting = false
        this.notifyConnectionChange(false)
        this.cleanup()
        
        if (this.shouldReconnect) {
          this.scheduleReconnect()
        }
      }
    } catch (e) {
      this.isConnecting = false
      console.error('Failed to create EventSource:', e)
      
      if (this.shouldReconnect) {
        this.scheduleReconnect()
      }
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.shouldReconnect = false
    this.cleanup()
    this.notifyConnectionChange(false)
  }

  /**
   * Subscribe to SSE messages
   * @returns Unsubscribe function
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * Subscribe to connection state changes
   * @returns Unsubscribe function
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }

  /**
   * Get current reconnect attempt count (for testing)
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  /**
   * Calculate delay for next reconnect attempt (exponential backoff)
   */
  getReconnectDelay(): number {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    )
    // Add jitter (±10%)
    const jitter = delay * 0.1 * (Math.random() * 2 - 1)
    return Math.round(delay + jitter)
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached')
      return
    }

    const delay = this.getReconnectDelay()
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private notifyMessage(event: SSEEvent): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(event)
      } catch (e) {
        console.error('Error in SSE message handler:', e)
      }
    })
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch (e) {
        console.error('Error in connection handler:', e)
      }
    })
  }

  /**
   * Reset manager state (for testing)
   */
  reset(): void {
    this.disconnect()
    this.reconnectAttempts = 0
    this.messageHandlers.clear()
    this.connectionHandlers.clear()
  }
}

// Singleton instance
export const sseManager = new SSEManager()
