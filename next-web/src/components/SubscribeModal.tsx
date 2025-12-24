'use client'

import { Monitor } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { publicSubscribe } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'

const formSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" })
})

interface SubscribeModalProps {
  visible: boolean
  onClose: () => void
  monitor: Monitor | null
  monitors?: Monitor[]
}

export function SubscribeModal({ visible, onClose, monitor, monitors = [] }: SubscribeModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  const [selected, setSelected] = useState<number[]>([])
  const [selectedEvents, setSelectedEvents] = useState<Record<number, Set<string>>>({})

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (monitor) {
        const evs = Array.from(selectedEvents[monitor.id] ?? new Set<string>(["offline","online","ssl_expiry"]))
        await publicSubscribe(monitor.id, values.email, evs)
      } else {
        if (!selected.length) {
          toast.error("请至少选择一个站点")
          return
        }
        for (const id of selected) {
          const evs = Array.from(selectedEvents[id] ?? new Set<string>())
          if (!evs.length) {
            toast.error("请为所选站点至少选择一种通知类型")
            return
          }
          await publicSubscribe(id, values.email, evs)
        }
      }
      toast.success("验证邮件已发送，请查收并完成验证")
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "订阅失败"
      toast.error(msg)
    }
  }

  if (!monitor && !monitors.length) return null

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="subscribe-desc">
        <DialogHeader>
          <DialogTitle>{monitor ? `订阅 · ${monitor.name}` : '统一订阅'}</DialogTitle>
        </DialogHeader>
        <p id="subscribe-desc" className="sr-only">订阅该站点的通知类型并验证邮箱</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!monitor && monitors.length > 0 && (
              <FormItem>
                <FormLabel>选择站点</FormLabel>
                <ScrollArea className="h-[180px] rounded-md border p-3">
                  <div className="space-y-2">
                    {monitors.map((m) => {
                      const checked = selected.includes(m.id)
                      return (
                        <div key={m.id} className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                if (v) setSelected((prev) => [...prev, m.id])
                                else setSelected((prev) => prev.filter((x) => x !== m.id))
                              }}
                            />
                            <Label className="font-normal">{m.name}</Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            {[
                              { id: "offline", label: "离线" },
                              { id: "online", label: "恢复" },
                              { id: "ssl_expiry", label: "证书到期" },
                            ].map((item) => {
                              const set = selectedEvents[m.id] ?? new Set<string>()
                              const isChecked = set.has(item.id)
                              return (
                                <div key={item.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(v) => {
                                      setSelectedEvents((prev) => {
                                        const cur = new Set(prev[m.id] ?? new Set<string>())
                                        if (v) cur.add(item.id)
                                        else cur.delete(item.id)
                                        return { ...prev, [m.id]: cur }
                                      })
                                    }}
                                  />
                                  <Label className="font-normal text-sm">{item.label}</Label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </FormItem>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-xs text-muted-foreground mt-2">
              将向该邮箱发送验证邮件，验证通过后即可订阅。
            </div>
            <DialogFooter>
              <Button type="submit">发送验证</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
