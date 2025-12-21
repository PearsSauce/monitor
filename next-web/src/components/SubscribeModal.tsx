'use client'

import { Monitor } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { publicSubscribe } from '@/lib/api'
import { toast } from 'sonner'

const formSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  events: z.array(z.string()).refine((value) => value.length > 0, {
    message: "请至少选择一种通知类型",
  }),
})

interface SubscribeModalProps {
  visible: boolean
  onClose: () => void
  monitor: Monitor | null
}

export function SubscribeModal({ visible, onClose, monitor }: SubscribeModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      events: ["offline", "online", "ssl_expiry"],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!monitor) return
    try {
      await publicSubscribe(monitor.id, values.email, values.events)
      toast.success("验证邮件已发送，请查收并完成验证")
      onClose()
    } catch (e: any) {
      toast.error(e.message || "订阅失败")
    }
  }

  if (!monitor) return null

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>订阅 · {monitor.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="events"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">通知类型</FormLabel>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {[
                      { id: "offline", label: "离线" },
                      { id: "online", label: "恢复" },
                      { id: "ssl_expiry", label: "证书到期" },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="events"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
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
