import { create } from 'zustand'

interface UIState {
  isOffline: boolean
  pendingOperations: Set<string>
  
  // Actions
  setOffline: (offline: boolean) => void
  addPendingOp: (id: string) => void
  removePendingOp: (id: string) => void
  clearPendingOps: () => void
  hasPendingOp: (id: string) => boolean
  reset: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isOffline: false,
  pendingOperations: new Set<string>(),
  
  setOffline: (offline) => set({ isOffline: offline }),
  
  addPendingOp: (id) => set((state) => ({
    pendingOperations: new Set([...state.pendingOperations, id])
  })),
  
  removePendingOp: (id) => set((state) => {
    const newSet = new Set(state.pendingOperations)
    newSet.delete(id)
    return { pendingOperations: newSet }
  }),
  
  clearPendingOps: () => set({ pendingOperations: new Set() }),
  
  hasPendingOp: (id) => get().pendingOperations.has(id),
  
  reset: () => set({ isOffline: false, pendingOperations: new Set() }),
}))
