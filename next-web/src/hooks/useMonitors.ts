import useSWR from 'swr'
import { useEffect } from 'react'
import { arrayFetcher, fetcherWithNull } from '@/lib/fetcher'
import { useMonitorStore } from '@/stores'
import type { Monitor, Group, SSLInfo } from '@/types/index'
import type { LatestResultResponse } from '@/types/api'

interface UseMonitorsReturn {
  monitors: Monitor[]
  groups: Group[]
  sslMap: Record<number, SSLInfo | null>
  latestResults: Record<number, number>
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing monitors data with SWR
 */
export function useMonitors(): UseMonitorsReturn {
  const {
    monitors: storeMonitors,
    groups: storeGroups,
    sslMap,
    latestResults,
    setMonitors,
    setGroups,
    setSSL,
    setLatestResult,
  } = useMonitorStore()

  // Fetch monitors
  const {
    data: monitorsData,
    error: monitorsError,
    isLoading: monitorsLoading,
    mutate: mutateMonitors,
  } = useSWR<Monitor[]>('/api/monitors', arrayFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  // Fetch groups
  const {
    data: groupsData,
    error: groupsError,
    isLoading: groupsLoading,
    mutate: mutateGroups,
  } = useSWR<Group[]>('/api/groups', arrayFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  // Sync monitors to store
  useEffect(() => {
    if (monitorsData) {
      setMonitors(monitorsData)
    }
  }, [monitorsData, setMonitors])

  // Sync groups to store
  useEffect(() => {
    if (groupsData) {
      setGroups(groupsData)
    }
  }, [groupsData, setGroups])

  // Fetch SSL info for each monitor
  useEffect(() => {
    if (monitorsData) {
      monitorsData.forEach(async (monitor) => {
        try {
          const ssl = await fetcherWithNull<SSLInfo>(`/api/ssl/${monitor.id}`)
          setSSL(monitor.id, ssl)
        } catch {
          // Ignore SSL fetch errors
        }
      })
    }
  }, [monitorsData, setSSL])

  // Fetch latest results for each monitor
  useEffect(() => {
    if (monitorsData) {
      monitorsData.forEach(async (monitor) => {
        try {
          const result = await fetcherWithNull<LatestResultResponse>(`/api/monitors/${monitor.id}/latest`)
          if (result && typeof result.response_ms === 'number') {
            setLatestResult(monitor.id, result.response_ms)
          }
        } catch {
          // Ignore latest result fetch errors
        }
      })
    }
  }, [monitorsData, setLatestResult])

  const refresh = async () => {
    await Promise.all([mutateMonitors(), mutateGroups()])
  }

  return {
    monitors: storeMonitors.length > 0 ? storeMonitors : (monitorsData || []),
    groups: storeGroups.length > 0 ? storeGroups : (groupsData || []),
    sslMap,
    latestResults,
    isLoading: monitorsLoading || groupsLoading,
    error: monitorsError || groupsError || null,
    refresh,
  }
}
