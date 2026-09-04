import bcrypt from 'bcryptjs'
import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { getDb } from '@/db'
import { passwordResetTokens, users } from '@/db/schema'
import { hashPasswordResetToken } from '@/lib/password-reset'

export async function POST(request: NextRequest) {
	try {
		const { token, password, confirmPassword } = await request.json()
		if (
			typeof token !== 'string' ||
			typeof password !== 'string' ||
			password.length < 8 ||
			password !== confirmPassword
		) {
			return NextResponse.json({ message: '重置链接或密码无效' }, { status: 400 })
		}

		const db = getDb()
		const passwordHash = await bcrypt.hash(password, 12)

		// 事务，防止并发请求
		try {
			await db.transaction(async tx => {
				const now = new Date()

				// 先判断是否能找到重置 token 对应的行（避免重复消费）
				const rows = await tx
					.select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
					.from(passwordResetTokens)
					.where(
						and(
							eq(passwordResetTokens.tokenHash, hashPasswordResetToken(token)),
							gt(passwordResetTokens.expiresAt, now),
							isNull(passwordResetTokens.usedAt),
						),
					)
					.limit(1)
				if (!rows[0]) throw new Error('RESET_TOKEN_INVALID')

				// 更新 usedAt
				const claimed = await tx
					.update(passwordResetTokens)
					.set({
						usedAt: now,
					})
					.where(
						and(
							eq(passwordResetTokens.id, rows[0].id), // 匹配记录
							gt(passwordResetTokens.expiresAt, now), // 未过期
							isNull(passwordResetTokens.usedAt),
						),
					)
				if (claimed[0].affectedRows !== 1) {
					throw new Error('RESET_TOKEN_INVALID')
				}

				const updated = await tx
					.update(users)
					.set({
						password: passwordHash,
						sessionVersion: sql`${users.sessionVersion} + 1`,
						updatedAt: now,
					})
					.where(eq(users.id, rows[0].userId))

				if (updated[0].affectedRows !== 1) {
					throw new Error('RESET_TOKEN_INVALID')
				}
			})
		} catch (error) {
			if (error instanceof Error && error.message === 'RESET_TOKEN_INVALID') {
				return NextResponse.json(
					{
						message: '重置链接已失效',
					},
					{
						status: 400,
					},
				)
			}
			return NextResponse.json(
				{
					message: '密码重置失败',
				},
				{
					status: 500,
				},
			)
		}

		return NextResponse.json({ message: '密码重置成功' })
	} catch (error) {
		console.error('重置密码失败:', error)
		return NextResponse.json({ message: '密码重置失败' }, { status: 500 })
	}
}
