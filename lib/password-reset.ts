import { createHash, randomBytes } from 'crypto'

export const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000

export function createPasswordResetToken() {
	const token = randomBytes(32).toString('hex')
	return {
		token,
		tokenHash: createHash('sha256').update(token).digest('hex'),
		expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
	}
}

export function hashPasswordResetToken(token: string) {
	return createHash('sha256').update(token).digest('hex')
}
