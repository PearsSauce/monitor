import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { SettingsResponse } from '@/types/api'

interface UseSettingsReturn {
  settings: SettingsResponse | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching settings data with SWR
 */
export function useSettings(): UseSettingsReturn {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<SettingsResponse>('/api/settings', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })

  const refresh = async () => {
    await mutate()
  }

  return {
    settings: data || null,
    isLoading,
    error: error || null,
    refresh,
  }
}
