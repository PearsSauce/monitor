import type { Monitor, Group, SSLInfo, NotificationItem, SSEEvent } from './index'

// Monitor Store State
export interface MonitorState {
  monitors: Monitor[]
  groups: Group[]
  sslMap: Record<number, SSLInfo>
  latestResults: Record<number, number>
  
  // Actions
  setMonitors: (monitors: Monitor[]) => void
  updateMonitor: (id: number, data: Partial<Monitor>) => void
  removeMonitor: (id: number) => void
  setGroups: (groups: Group[]) => void
  updateGroup: (id: number, data: Partial<Group>) => void
  removeGroup: (id: number) => void
  setSSL: (id: number, ssl: SSLInfo) => void
  setLatestResult: (id: number, ms: number) => void
}

// SSE Store State
export interface SSEState {
  connected: boolean
  lastEvent: SSEEvent | null
  notifications: NotificationItem[]
  
  // Actions
  setConnected: (connected: boolean) => void
  setLastEvent: (event: SSEEvent | null) => void
  addNotification: (notification: NotificationItem) => void
  removeNotification: (id: number) => void
  clearNotifications: () => void
}

// UI Store State
export interface UIState {
  isOffline: boolean
  pendingOperations: Set<string>
  
  // Actions
  setOffline: (offline: boolean) => void
  addPendingOp: (id: string) => void
  removePendingOp: (id: string) => void
  clearPendingOps: () => void
  hasPendingOp: (id: string) => boolean
}

// Combined Store type for convenience
export interface RootState {
  monitor: MonitorState
  sse: SSEState
  ui: UIState
}
