import useSWR from 'swr'
import { useEffect } from 'react'
import { arrayFetcher } from '@/lib/fetcher'
import { useMonitorStore } from '@/stores'
import type { Group } from '@/types/index'

interface UseGroupsReturn {
  groups: Group[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing groups data with SWR
 */
export function useGroups(): UseGroupsReturn {
  const { groups: storeGroups, setGroups } = useMonitorStore()

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Group[]>('/api/groups', arrayFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  // Sync to store
  useEffect(() => {
    if (data) {
      setGroups(data)
    }
  }, [data, setGroups])

  const refresh = async () => {
    await mutate()
  }

  return {
    groups: storeGroups.length > 0 ? storeGroups : (data || []),
    isLoading,
    error: error || null,
    refresh,
  }
}
