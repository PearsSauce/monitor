'use client'

import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

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

export function DataTab({ form, onSubmit }: DataTabProps) {
  return (
    <Card className="max-w-3xl">
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
  )
}
