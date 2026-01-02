import { useState, useCallback } from 'react'
import { getHistory } from '@/lib/api'
import type { HistoryItem } from '@/types/index'

interface UseExportReturn {
  exportHistory: (monitorId: number, days: number, monitorName?: string) => Promise<void>
  isExporting: boolean
}

/**
 * Generate CSV content from history data
 */
export function generateCSV(history: HistoryItem[]): string {
  const headers = ['timestamp', 'status', 'response_ms', 'status_code', 'error']
  const rows = history.map((item) => [
    item.checked_at,
    item.online ? 'online' : 'offline',
    String(item.response_ms),
    String(item.status_code),
    item.error || '',
  ])
  
  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
  
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')
  
  return csvContent
}

/**
 * Trigger browser download of a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Hook for exporting monitor history data
 */
export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)

  const exportHistory = useCallback(async (
    monitorId: number,
    days: number,
    monitorName?: string
  ): Promise<void> => {
    setIsExporting(true)
    
    try {
      const history = await getHistory(monitorId, days)
      const csv = generateCSV(history)
      
      const timestamp = new Date().toISOString().split('T')[0]
      const name = monitorName?.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') || `monitor_${monitorId}`
      const filename = `${name}_history_${timestamp}.csv`
      
      downloadFile(csv, filename, 'text/csv;charset=utf-8')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    exportHistory,
    isExporting,
  }
}
