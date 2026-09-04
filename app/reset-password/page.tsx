'use client'

import { Button, Card, Form, Input, message, Result } from 'antd'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

function ResetPasswordContent() {
	const token = useSearchParams().get('token') || ''
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const onFinish = async (values: { password: string; confirmPassword: string }) => {
		setLoading(true)
		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, ...values }),
			})
			const data = await response.json()
			if (!response.ok) return message.error(data.message || '密码重置失败')
			message.success('密码重置成功，请重新登录')
			router.replace('/login')
		} finally {
			setLoading(false)
		}
	}

	if (!token)
		return (
			<Result
				status="error"
				title="重置链接无效"
			/>
		)

	return (
		<div className="bg-theme-bg flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md dark:bg-gray-700">
				<h1 className="mb-6 text-2xl font-bold">重置管理员密码</h1>
				<Form
					onFinish={onFinish}
					layout="vertical"
					size="large"
				>
					<Form.Item
						label="新密码"
						name="password"
						rules={[{ required: true }, { min: 8, message: '密码至少需要 8 位' }]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item
						label="确认密码"
						name="confirmPassword"
						rules={[
							{ required: true },
							({ getFieldValue }) => ({
								validator: (_, value) =>
									value === getFieldValue('password')
										? Promise.resolve()
										: Promise.reject(new Error('两次密码不一致')),
							}),
						]}
					>
						<Input.Password />
					</Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						loading={loading}
						block
					>
						重置密码
					</Button>
				</Form>
			</Card>
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={null}>
			<ResetPasswordContent />
		</Suspense>
	)
}
