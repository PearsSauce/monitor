'use client'

import { useUIStore } from '@/stores'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Offline indicator banner
 */
export function OfflineIndicator() {
  const isOffline = useUIStore((state) => state.isOffline)

  if (!isOffline) return null

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-950 py-2 px-4',
        'flex items-center justify-center gap-2 text-sm font-medium',
        'animate-in slide-in-from-top duration-300'
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>网络连接已断开，显示的是缓存数据</span>
    </div>
  )
}
