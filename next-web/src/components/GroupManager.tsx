'use client'

import { useState, useEffect } from 'react'
import { Group } from '@/types'
import { createGroup, updateGroup, deleteGroup } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { SvgIcon } from './SvgIcon'

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  icon: z.string().optional(),
  color: z.string().optional(),
})

interface GroupManagerProps {
  visible: boolean
  onClose: () => void
  groups: Group[]
  onOk: () => void
}

export function GroupManager({ visible, onClose, groups, onOk }: GroupManagerProps) {
  const [editing, setEditing] = useState<Group | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '',
    },
  })

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        icon: editing.icon,
        color: editing.color,
      })
    } else {
      form.reset({
        name: '',
        icon: '',
        color: '',
      })
    }
  }, [editing, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editing) await updateGroup(editing.id, values)
      else await createGroup(values)
      toast.success('分组已保存')
      onOk()
      setEditing(null)
      form.reset()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const remove = (g: Group) => {
    setDeleteTarget(g)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteGroup(deleteTarget.id)
      toast.success('分组已删除')
      onOk()
      setDeleteTarget(null)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open={visible} onOpenChange={(open) => {
      if (!open) {
        onClose()
        setEditing(null)
      }
    }}>
      <DialogContent className="sm:max-w-[800px]" aria-describedby="group-manager-desc">
        <DialogHeader>
          <DialogTitle>分组管理</DialogTitle>
        </DialogHeader>
        <p id="group-manager-desc" className="sr-only">管理监控分组的名称、图标与颜色</p>
        <div className="space-y-6">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>图标</TableHead>
                  <TableHead>颜色</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {g.icon && g.icon.toLowerCase().includes('<svg') ? <SvgIcon html={g.icon} size={16} /> : (g.icon ? <span>{g.icon}</span> : <span>-</span>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: g.color || '#ccc' }}>
                        {g.color || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(g)}>编辑</Button>
                        <Button size="sm" variant="destructive" onClick={() => remove(g)}>删除</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">{editing ? '编辑分组' : '新建分组'}</h3>
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
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图标（支持粘贴 SVG 代码，统一渲染 16px）</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：🔵 或 <svg>...</svg>" {...field} />
                      </FormControl>
                      {field.value ? (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground mr-2">预览：</span>
                          {field.value.toLowerCase().includes('<svg') ? <SvgIcon html={field.value} size={16} /> : <span>{field.value}</span>}
                        </div>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>颜色</FormLabel>
                      <FormControl>
                        <Input placeholder="#22c55e" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                   {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); form.reset(); }}>取消编辑</Button>}
                   <Button type="submit">保存</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除分组 "{deleteTarget?.name}" 吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。该分组下的监控项将失去分组信息，但不会被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
