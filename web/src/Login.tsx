import React, { useState } from 'react'
import { Form, Input, Button, Card, Message, Typography } from '@arco-design/web-react'
import { IconLock } from '@arco-design/web-react/icon'
import { login } from './api'
import useTheme from './useTheme'

export default function Login() {
  useTheme()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const v = await form.validate()
      setLoading(true)
      await login(v.password)
      Message.success('登录成功')
      window.location.reload()
    } catch (e: any) {
      Message.error(e.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <Card className="w-96 shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <IconLock className="text-2xl text-blue-600 dark:text-blue-300" />
          </div>
          <Typography.Title heading={4} className="!m-0 text-slate-800 dark:text-slate-100">系统登录</Typography.Title>
          <Typography.Text className="text-slate-500 dark:text-slate-400 mt-2 block">请输入管理员密码以继续</Typography.Text>
        </div>
        <Form form={form} onSubmit={handleSubmit} layout="vertical" className="px-4">
          <Form.Item field="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<IconLock />} placeholder="请输入管理员密码" onPressEnter={handleSubmit} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" long loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
