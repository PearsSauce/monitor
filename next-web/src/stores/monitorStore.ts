import { create } from 'zustand'
import type { Monitor, Group, SSLInfo } from '@/types/index'

interface MonitorState {
  monitors: Monitor[]
  groups: Group[]
  sslMap: Record<number, SSLInfo | null>
  latestResults: Record<number, number>
  
  // Actions
  setMonitors: (monitors: Monitor[]) => void
  updateMonitor: (id: number, data: Partial<Monitor>) => void
  removeMonitor: (id: number) => void
  setGroups: (groups: Group[]) => void
  updateGroup: (id: number, data: Partial<Group>) => void
  removeGroup: (id: number) => void
  setSSL: (id: number, ssl: SSLInfo | null) => void
  setLatestResult: (id: number, ms: number) => void
  reset: () => void
}

const initialState = {
  monitors: [] as Monitor[],
  groups: [] as Group[],
  sslMap: {} as Record<number, SSLInfo | null>,
  latestResults: {} as Record<number, number>,
}

export const useMonitorStore = create<MonitorState>((set) => ({
  ...initialState,
  
  setMonitors: (monitors) => set({ monitors }),
  
  updateMonitor: (id, data) => set((state) => ({
    monitors: state.monitors.map((m) => 
      m.id === id ? { ...m, ...data } : m
    )
  })),
  
  removeMonitor: (id) => set((state) => ({
    monitors: state.monitors.filter((m) => m.id !== id),
    sslMap: Object.fromEntries(
      Object.entries(state.sslMap).filter(([key]) => Number(key) !== id)
    ),
    latestResults: Object.fromEntries(
      Object.entries(state.latestResults).filter(([key]) => Number(key) !== id)
    ),
  })),
  
  setGroups: (groups) => set({ groups }),
  
  updateGroup: (id, data) => set((state) => ({
    groups: state.groups.map((g) => 
      g.id === id ? { ...g, ...data } : g
    )
  })),
  
  removeGroup: (id) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== id)
  })),
  
  setSSL: (id, ssl) => set((state) => ({
    sslMap: { ...state.sslMap, [id]: ssl }
  })),
  
  setLatestResult: (id, ms) => set((state) => ({
    latestResults: { ...state.latestResults, [id]: ms }
  })),
  
  reset: () => set(initialState),
}))
