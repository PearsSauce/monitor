import { create } from 'zustand'
import type { SSEEvent, NotificationItem } from '@/types/index'

interface SSEState {
  connected: boolean
  lastEvent: SSEEvent | null
  notifications: NotificationItem[]
  
  // Actions
  setConnected: (connected: boolean) => void
  setLastEvent: (event: SSEEvent | null) => void
  addNotification: (notification: NotificationItem) => void
  removeNotification: (id: number) => void
  clearNotifications: () => void
  reset: () => void
}

const initialState = {
  connected: false,
  lastEvent: null as SSEEvent | null,
  notifications: [] as NotificationItem[],
}

export const useSSEStore = create<SSEState>((set) => ({
  ...initialState,
  
  setConnected: (connected) => set({ connected }),
  
  setLastEvent: (event) => set({ lastEvent: event }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications].slice(0, 100) // Keep max 100 notifications
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  reset: () => set(initialState),
}))
