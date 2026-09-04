import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db'
import { users } from '@/db/schema'

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: '邮箱', type: 'email' },
				password: { label: '密码', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const db = getDb()
				const rows = await db
					.select()
					.from(users)
					.where(eq(users.email, credentials.email))
					.limit(1)
				const user = rows[0]

				if (!user) {
					return null
				}

				const valid = await bcrypt.compare(credentials.password, user.password)

				if (!valid) {
					return null
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					sessionVersion: user.sessionVersion,
				}
			},
		}),
	],
	session: {
		strategy: 'jwt' as const,
	},
	pages: {
		signIn: '/login',
	},
	callbacks: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async jwt({ token, user }: any) {
			if (user) {
				token.id = user.id
				token.sessionVersion = user.sessionVersion
				return token
			}

			if (token.id) {
				const db = getDb()
				const rows = await db
					.select({ sessionVersion: users.sessionVersion })
					.from(users)
					.where(eq(users.id, token.id))
					.limit(1)

				if (!rows[0] || rows[0].sessionVersion !== token.sessionVersion) {
					return null
				}
			}
			return token
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		session({ session, token }: any) {
			if (token && session.user) {
				session.user.id = token.id as string
			}
			return session
		},
	},
}
