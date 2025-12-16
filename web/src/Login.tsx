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
    <div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-6">
          <Typography.Title heading={4}>系统登录</Typography.Title>
        </div>
        <Form form={form} onSubmit={handleSubmit} layout="vertical">
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
