'use client'

import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Monitor } from '@/types'

interface WebsiteFormValues {
  site_name: string
  subtitle?: string
  tab_subtitle?: string
  show_system_status?: boolean
  status_monitor_id?: number
}

interface WebsiteTabProps {
  form: UseFormReturn<WebsiteFormValues>
  onSubmit: (values: WebsiteFormValues) => Promise<void>
  monitors?: Monitor[]
}

export function WebsiteTab({ form, onSubmit, monitors = [] }: WebsiteTabProps) {
  const showStatus = form.watch('show_system_status')

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网站名称</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>副标题</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tab_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签页副标题</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">保存网站设置</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>页脚运行状态</CardTitle>
          <CardDescription>在页脚显示指定监控站点的实时运行状态</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="show_system_status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">显示运行状态</FormLabel>
                      <FormDescription>
                        开启后将在页脚显示选定站点的实时状态
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {showStatus && (
                <FormField
                  control={form.control}
                  name="status_monitor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>选择监控站点</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择要显示状态的站点" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {monitors.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        选择一个监控站点，其状态将实时显示在页脚
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <Button type="submit">保存状态设置</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
