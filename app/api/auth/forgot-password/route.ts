import { and, count, eq, gt, isNull } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { getDb } from '@/db'
import { passwordResetTokens, users } from '@/db/schema'
import { createPasswordResetToken } from '@/lib/password-reset'
import { isMailConfigured, sendPasswordResetEmail } from '@/lib/mail'
import { generateUuidV4 } from '@/lib/helpers'

const genericResponse = { message: '如果邮箱存在，重置链接将发送到你的邮箱' }

export const dynamic = 'force-dynamic'

export function GET() {
	return NextResponse.json({ configured: isMailConfigured() })
}

export async function POST(request: NextRequest) {
	try {
		if (!isMailConfigured()) return NextResponse.json(genericResponse)

		const { email } = await request.json()
		if (typeof email !== 'string' || !email.trim()) return NextResponse.json(genericResponse)

		const normalizedEmail = email.trim().toLowerCase()
		const requestIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
		const db = getDb()
		const rows = await db
			.select({ id: users.id, email: users.email })
			.from(users)
			.where(eq(users.email, normalizedEmail))
			.limit(1)
		if (!rows[0]) return NextResponse.json(genericResponse)

		const recentRequests = await db
			.select({ count: count() })
			.from(passwordResetTokens)
			.where(
				and(
					eq(passwordResetTokens.userId, rows[0].id),
					eq(passwordResetTokens.requestIp, requestIp),
					gt(passwordResetTokens.createdAt, new Date(Date.now() - 60 * 1000)),
				),
			)
		if ((recentRequests[0]?.count ?? 0) >= 3) return NextResponse.json(genericResponse)

		await db
			.update(passwordResetTokens)
			.set({ usedAt: new Date() })
			.where(and(eq(passwordResetTokens.userId, rows[0].id), isNull(passwordResetTokens.usedAt)))
		const resetToken = createPasswordResetToken()
		await db.insert(passwordResetTokens).values({
			id: generateUuidV4(),
			userId: rows[0].id,
			requestIp,
			tokenHash: resetToken.tokenHash,
			expiresAt: resetToken.expiresAt,
			createdAt: new Date(),
		})
		await sendPasswordResetEmail(rows[0].email, resetToken.token)
		return NextResponse.json(genericResponse)
	} catch (error) {
		console.error('发送密码重置邮件失败:', error)
		return NextResponse.json(genericResponse)
	}
}
