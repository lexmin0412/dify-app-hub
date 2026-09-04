import nodemailer from 'nodemailer'

function maskEmail(email: string) {
	const [localPart, domain] = email.split('@')
	if (!localPart || !domain) return '[invalid-email]'
	return `${localPart.slice(0, 2)}***@${domain}`
}

export function isMailConfigured() {
	return Boolean(
		process.env.SMTP_ENABLED === 'true' &&
		process.env.SMTP_SERVER &&
		process.env.SMTP_PORT &&
		process.env.SMTP_USERNAME &&
		process.env.SMTP_PASSWORD &&
		process.env.MAIL_DEFAULT_SEND_FROM &&
		process.env.APP_URL,
	)
}

export async function sendPasswordResetEmail(email: string, token: string) {
	if (!isMailConfigured()) throw new Error('邮件服务未配置')

	const port = Number(process.env.SMTP_PORT)
	const secure = process.env.SMTP_USE_TLS !== 'false' && port === 465
	const transport = nodemailer.createTransport({
		host: process.env.SMTP_SERVER,
		port,
		secure,
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	})
	const baseUrl = process.env.APP_URL?.replace(/\/$/, '')
	if (!baseUrl) throw new Error('APP_URL 未配置')

	try {
		const result = await transport.sendMail({
			from: process.env.MAIL_DEFAULT_SEND_FROM,
			to: email,
			subject: '重置管理员密码',
			text: `请在 15 分钟内访问以下链接重置密码：\n${baseUrl}/reset-password?token=${token}`,
		})
		console.info('密码重置邮件已被 SMTP 接受', {
			to: maskEmail(email),
			messageId: result.messageId,
			accepted: result.accepted.length,
			rejected: result.rejected.length,
			response: result.response,
		})
	} catch (error) {
		console.error('SMTP 发送密码重置邮件失败', {
			to: maskEmail(email),
			error: error instanceof Error ? error.message : String(error),
		})
		throw error
	}
}
