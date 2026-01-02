'use client'

import { UseFormReturn } from 'react-hook-form'
import { Monitor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'

interface NotifyFormValues {
  enable_notifications: boolean
  notify_events: string[]
  smtp_server?: string
  smtp_port?: number
  smtp_user?: string
  smtp_password?: string
  from_email?: string
  to_emails?: string
}

interface NotifyTabProps {
  form: UseFormReturn<NotifyFormValues>
  onSubmit: (values: NotifyFormValues) => Promise<void>
  monitors: Monitor[]
  testType: string
  testMonitor: string
  onTestTypeChange: (value: string) => void
  onTestMonitorChange: (value: string) => void
  onSendTest: () => void
}

export function NotifyTab({
  form,
  onSubmit,
  monitors,
  testType,
  testMonitor,
  onTestTypeChange,
  onTestMonitorChange,
  onSendTest,
}: NotifyTabProps) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>通知配置</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="enable_notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">开启通知</FormLabel>
                    <FormDescription>全局启用或禁用通知发送</FormDescription>
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
            <FormField
              control={form.control}
              name="notify_events"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">通知事件</FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {['online', 'offline', 'ssl_expiry'].map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="notify_events"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item === 'online' ? '恢复' : item === 'offline' ? '离线' : '证书到期'}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">邮件通知</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="smtp_server"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP服务器</FormLabel>
                      <FormControl><Input placeholder="smtp.example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtp_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>端口</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发件邮箱</FormLabel>
                      <FormControl><Input placeholder="noreply@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtp_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtp_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to_emails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>收件人邮箱(逗号分隔)</FormLabel>
                      <FormControl><Input placeholder="a@example.com,b@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">保存通知设置</Button>
          </form>
        </Form>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">测试通知</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-[200px]">
              <label className="text-sm font-medium mb-2 block">类型</label>
              <Select value={testType} onValueChange={onTestTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                  <SelectItem value="ssl_expiry">证书到期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[300px]">
              <label className="text-sm font-medium mb-2 block">选择站点</label>
              <Select value={testMonitor} onValueChange={onTestMonitorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择站点" />
                </SelectTrigger>
                <SelectContent>
                  {monitors.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onSendTest}>发送测试通知</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
