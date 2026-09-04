'use client'

import { Alert, Button, Card, Form, Input, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ForgotPasswordPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [sent, setSent] = useState(false)
	const [mailConfigured, setMailConfigured] = useState<boolean | null>(null)

	useEffect(() => {
		fetch('/api/auth/forgot-password', { cache: 'no-store' })
			.then(response => response.json())
			.then(data => setMailConfigured(data.configured === true))
			.catch(() => setMailConfigured(false))
	}, [])

	const onFinish = async ({ email }: { email: string }) => {
		setLoading(true)
		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})
			if (!response.ok) {
				message.error('请求失败，请稍后重试')
				return
			}
			setSent(true)
		} catch {
			message.error('请求失败，请稍后重试')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="bg-theme-bg flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md dark:bg-gray-700">
				<h1 className="mb-2 text-2xl font-bold">找回密码</h1>
				{mailConfigured === false ? (
					<Alert
						className="mb-4"
						message="邮件服务未配置，请联系管理员。"
						type="warning"
					/>
				) : null}
				{mailConfigured === false ? null : sent ? (
					<>
						<p className="mb-6">如果邮箱存在，重置链接将发送到你的邮箱，请注意查收。</p>
						<Button
							block
							onClick={() => router.replace('/login')}
						>
							返回登录
						</Button>
					</>
				) : (
					<Form
						onFinish={onFinish}
						layout="vertical"
						size="large"
					>
						<Form.Item
							label="邮箱"
							name="email"
							rules={[{ required: true }, { type: 'email', message: '请输入有效的邮箱地址' }]}
						>
							<Input placeholder="邮箱地址" />
						</Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							block
						>
							发送重置链接
						</Button>
					</Form>
				)}
			</Card>
		</div>
	)
}
