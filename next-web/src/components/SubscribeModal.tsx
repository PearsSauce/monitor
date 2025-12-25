'use client'

import { Monitor } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet'
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
    <Sheet open={visible} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-[500px] flex flex-col h-full w-full" aria-describedby="subscribe-desc">
        <SheetHeader>
          <SheetTitle>{monitor ? `订阅 · ${monitor.name}` : '统一订阅'}</SheetTitle>
          <SheetDescription id="subscribe-desc">
            订阅该站点的通知类型并验证邮箱
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 py-4 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
              {!monitor && monitors.length > 0 && (
                <FormItem className="flex-1 min-h-0 flex flex-col">
                  <FormLabel>选择站点</FormLabel>
                  <ScrollArea className="flex-1 rounded-md border p-3 min-h-[300px]">
                    <div className="space-y-4 pr-3">
                      {monitors.map((m) => {
                        const checked = selected.includes(m.id)
                        return (
                          <div key={m.id} className="flex flex-col space-y-2 border-b pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  if (v) setSelected((prev) => [...prev, m.id])
                                  else setSelected((prev) => prev.filter((x) => x !== m.id))
                                }}
                              />
                              <Label className="font-medium text-base">{m.name}</Label>
                            </div>
                            {checked && (
                              <div className="pl-7 flex flex-wrap gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                {[
                                  { id: "offline", label: "离线" },
                                  { id: "online", label: "恢复" },
                                  { id: "ssl_expiry", label: "证书" },
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
                                      <Label className="font-normal text-sm text-muted-foreground">{item.label}</Label>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
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
              <SheetFooter className="mt-auto pt-4">
                <Button type="submit" className="w-full sm:w-auto">发送验证</Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
