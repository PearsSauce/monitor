import { useEffect } from 'react'
import { useUIStore } from '@/stores'

/**
 * Hook for detecting and managing offline state
 */
export function useOffline() {
  const { isOffline, setOffline } = useUIStore()

  useEffect(() => {
    // Set initial state
    setOffline(!navigator.onLine)

    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])

  return { isOffline }
}
