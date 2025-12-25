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
import { useState, useMemo } from 'react'
import { Search, CheckSquare, Square } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMonitors = useMemo(() => {
    if (!searchTerm) return monitors
    return monitors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [monitors, searchTerm])

  const handleSelectAll = () => {
    const newSelected = new Set(selected)
    filteredMonitors.forEach(m => newSelected.add(m.id))
    setSelected(Array.from(newSelected))
  }

  const handleDeselectAll = () => {
    const newSelected = new Set(selected)
    filteredMonitors.forEach(m => newSelected.delete(m.id))
    setSelected(Array.from(newSelected))
  }

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
        <SheetHeader className="space-y-1 pb-4 border-b">
          <SheetTitle className="text-xl">{monitor ? `订阅 · ${monitor.name}` : '统一订阅'}</SheetTitle>
          <SheetDescription id="subscribe-desc">
            订阅关注的站点，当状态发生变化时接收邮件通知
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 py-4 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-full flex flex-col">
              {!monitor && monitors.length > 0 && (
                <FormItem className="flex-1 min-h-0 flex flex-col space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索站点..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll} title="全选当前列表">
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={handleDeselectAll} title="取消全选">
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 rounded-md border min-h-[300px] flex flex-col overflow-hidden">
                    <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-b flex justify-between">
                      <span>{filteredMonitors.length} 个站点</span>
                      <span>已选 {selected.length} 个</span>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="divide-y">
                        {filteredMonitors.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            未找到匹配的站点
                          </div>
                        ) : (
                          filteredMonitors.map((m) => {
                            const checked = selected.includes(m.id)
                            return (
                              <div 
                                key={m.id} 
                                className={`flex flex-col space-y-3 p-3 transition-colors ${checked ? 'bg-muted/30' : 'hover:bg-muted/10'}`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`monitor-${m.id}`}
                                    checked={checked}
                                    onCheckedChange={(v) => {
                                      if (v) setSelected((prev) => [...prev, m.id])
                                      else setSelected((prev) => prev.filter((x) => x !== m.id))
                                    }}
                                  />
                                  <Label htmlFor={`monitor-${m.id}`} className="font-medium text-base cursor-pointer flex-1">
                                    {m.name}
                                  </Label>
                                </div>
                                {checked && (
                                  <div className="pl-7 flex flex-wrap gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                                    {[
                                      { id: "offline", label: "离线", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                                      { id: "online", label: "恢复", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                                      { id: "ssl_expiry", label: "证书", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
                                    ].map((item) => {
                                      const set = selectedEvents[m.id] ?? new Set<string>()
                                      const isChecked = set.has(item.id)
                                      return (
                                        <div 
                                          key={item.id} 
                                          className={`
                                            flex items-center space-x-1.5 px-2 py-1 rounded-md border text-xs cursor-pointer transition-colors
                                            ${isChecked ? `${item.color} border-transparent` : 'border-dashed hover:border-solid'}
                                          `}
                                          onClick={() => {
                                            setSelectedEvents((prev) => {
                                              const cur = new Set(prev[m.id] ?? new Set<string>())
                                              if (cur.has(item.id)) cur.delete(item.id)
                                              else cur.add(item.id)
                                              return { ...prev, [m.id]: cur }
                                            })
                                          }}
                                        >
                                          <div className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-current' : 'bg-muted-foreground'}`} />
                                          <span className={isChecked ? 'font-medium' : 'text-muted-foreground'}>{item.label}</span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </FormItem>
              )}
              
              <div className="pt-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>接收邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="name@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  首次订阅需要验证邮箱，验证链接将发送至该地址
                </div>
              </div>

              <SheetFooter className="mt-auto pt-4 border-t">
                <Button type="submit" className="w-full sm:w-auto min-w-[120px]">
                  {monitor ? '订阅此站点' : `订阅已选 (${selected.length})`}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
