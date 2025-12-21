'use client'

import { useState, useEffect } from 'react'
import { Monitor, Group } from '@/types'
import { createMonitor, updateMonitor } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().min(1, "URL不能为空"),
  method: z.string(),
  group_id: z.string().optional(),
  headers_json: z.string().optional(),
  body: z.string().optional(),
  expected_status_min: z.coerce.number().min(100).max(599),
  expected_status_max: z.coerce.number().min(100).max(599),
  keyword: z.string().optional(),
  interval_seconds: z.coerce.number().min(0),
})

interface MonitorFormProps {
  visible: boolean
  onClose: () => void
  editing: Monitor | null
  groups: Group[]
  onOk: () => void
}

export function MonitorForm({ visible, onClose, editing, groups, onOk }: MonitorFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      url: '',
      method: 'GET',
      expected_status_min: 200,
      expected_status_max: 299,
      interval_seconds: 30,
      headers_json: '',
      body: '',
      keyword: '',
    },
  })

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        url: editing.url,
        method: editing.method,
        headers_json: editing.headers_json,
        body: editing.body,
        expected_status_min: editing.expected_status_min,
        expected_status_max: editing.expected_status_max,
        keyword: editing.keyword,
        group_id: editing.group_id ? String(editing.group_id) : undefined,
        interval_seconds: editing.interval_seconds,
      })
    } else {
      form.reset({
        name: '',
        url: '',
        method: 'GET',
        expected_status_min: 200,
        expected_status_max: 299,
        interval_seconds: 30,
        headers_json: '',
        body: '',
        keyword: '',
        group_id: undefined
      })
    }
  }, [editing, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.headers_json) {
      try {
        JSON.parse(values.headers_json)
      } catch {
        toast.error('请求头必须是合法的 JSON 格式')
        return
      }
    }

    try {
      const payload = {
        ...values,
        group_id: values.group_id ? Number(values.group_id) : undefined,
      }
      if (editing) await updateMonitor(editing.id, payload)
      else await createMonitor(payload)
      toast.success('已保存')
      onOk()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑监控' : '新建监控'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>请求方法</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="HEAD">HEAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分组</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择分组" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">无分组</SelectItem>
                        {(groups || []).map(g => (
                          <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="headers_json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>请求头 (JSON)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='{"User-Agent":"Monitor"}' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>请求体</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_status_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态码下限</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expected_status_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态码上限</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>关键词检测</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interval_seconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>检查间隔 (秒)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
