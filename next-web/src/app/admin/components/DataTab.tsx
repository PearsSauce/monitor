'use client'

import { useState, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getMonitors, createMonitor, getToken } from '@/lib/api'
import { Download, Upload, Loader2, CheckCircle, AlertCircle, Database, Settings2 } from 'lucide-react'
import type { Monitor, HistoryItem } from '@/types'
import type { CreateMonitorInput } from '@/types/api'

interface DataFormValues {
  history_days_frontend: number
  retention_days: number
  check_interval_seconds: number
  debounce_seconds: number
  flap_threshold: number
}

interface DataTabProps {
  form: UseFormReturn<DataFormValues>
  onSubmit: (values: DataFormValues) => Promise<void>
}

// Export format for config only
interface ExportMonitorConfig {
  name: string
  url: string
  method: string
  headers_json: string
  body: string
  expected_status_min: number
  expected_status_max: number
  keyword: string
  group_id?: number
  interval_seconds: number
}

// Export format with history data
interface ExportMonitorWithHistory extends ExportMonitorConfig {
  history: HistoryItem[]
}

interface ExportDataConfig {
  version: string
  exported_at: string
  monitors: ExportMonitorConfig[]
}

interface ExportDataWithHistory {
  version: string
  exported_at: string
  monitors: ExportMonitorWithHistory[]
}

export function DataTab({ form, onSubmit }: DataTabProps) {
  const [isExportingConfig, setIsExportingConfig] = useState(false)
  const [isExportingData, setIsExportingData] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exportDays, setExportDays] = useState('30')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export config only (no history)
  const handleExportConfig = async () => {
    setIsExportingConfig(true)
    setError(null)
    try {
      const monitors = await getMonitors()
      const exportData: ExportDataConfig = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        monitors: monitors.map((m: Monitor) => ({
          name: m.name,
          url: m.url,
          method: m.method,
          headers_json: m.headers_json,
          body: m.body,
          expected_status_min: m.expected_status_min,
          expected_status_max: m.expected_status_max,
          keyword: m.keyword,
          group_id: m.group_id,
          interval_seconds: m.interval_seconds,
        })),
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `monitors_config_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    } finally {
      setIsExportingConfig(false)
    }
  }

  // Export with history data
  const handleExportData = async () => {
    setIsExportingData(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(`/api/monitors?export=true&days=${exportDays}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        throw new Error('导出失败')
      }
      const exportData: ExportDataWithHistory = await res.json()
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `monitors_data_${exportDays}days_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    } finally {
      setIsExportingData(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)
    setImportResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportDataConfig | ExportDataWithHistory
      
      if (!data.monitors || !Array.isArray(data.monitors)) {
        throw new Error('无效的导入文件格式')
      }

      let success = 0
      let failed = 0

      for (const monitor of data.monitors) {
        try {
          const input: CreateMonitorInput = {
            name: monitor.name,
            url: monitor.url,
            method: monitor.method || 'GET',
            headers_json: monitor.headers_json || '{}',
            body: monitor.body || '',
            expected_status_min: monitor.expected_status_min || 200,
            expected_status_max: monitor.expected_status_max || 299,
            keyword: monitor.keyword || '',
            group_id: monitor.group_id,
            interval_seconds: monitor.interval_seconds || 60,
          }
          await createMonitor(input)
          success++
        } catch {
          failed++
        }
      }

      setImportResult({ success, failed })
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Import/Export Card */}
      <Card>
        <CardHeader>
          <CardTitle>监控数据导入导出</CardTitle>
          <CardDescription>导出监控站点配置或完整监控数据，或从JSON文件导入</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Config Only */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings2 className="h-4 w-4" />
              <span>导出配置</span>
            </div>
            <p className="text-xs text-muted-foreground">仅导出监控站点配置，不包含历史数据</p>
            <Button onClick={handleExportConfig} disabled={isExportingConfig} variant="outline">
              {isExportingConfig ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              导出配置
            </Button>
          </div>

          {/* Export with History */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              <span>导出完整数据</span>
            </div>
            <p className="text-xs text-muted-foreground">导出监控站点配置及历史监控数据</p>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={exportDays} onValueChange={setExportDays}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="选择天数" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">最近 7 天</SelectItem>
                  <SelectItem value="30">最近 30 天</SelectItem>
                  <SelectItem value="90">最近 90 天</SelectItem>
                  <SelectItem value="180">最近 180 天</SelectItem>
                  <SelectItem value="365">最近 365 天</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportData} disabled={isExportingData} variant="outline">
                {isExportingData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                导出数据
              </Button>
            </div>
          </div>

          {/* Import */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              <span>导入配置</span>
            </div>
            <p className="text-xs text-muted-foreground">从JSON文件导入监控站点配置（仅导入配置，不导入历史数据）</p>
            <Button onClick={handleImportClick} disabled={isImporting} variant="outline">
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              导入配置
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {importResult && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>导入完成: 成功 {importResult.success} 个, 失败 {importResult.failed} 个</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>数据与检测</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="history_days_frontend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>历史数据时间范围(天)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retention_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>数据保留天数(后端)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="check_interval_seconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>网站检测间隔(秒)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debounce_seconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>防抖时间(秒)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="flap_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>震荡次数阈值</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">保存数据设置</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
