import { datetime, index, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const passwordResetTokens = mysqlTable(
	'password_reset_tokens',
	{
		id: varchar({ length: 36 }).primaryKey(),
		userId: varchar('user_id', { length: 36 }).notNull(),
		requestIp: varchar('request_ip', { length: 45 }).notNull(),
		tokenHash: varchar('token_hash', { length: 64 }).notNull(),
		expiresAt: datetime('expires_at', { fsp: 3 }).notNull(),
		usedAt: datetime('used_at', { fsp: 3 }),
		createdAt: datetime('created_at', { fsp: 3 }).notNull(),
	},
	table => [
		index('password_reset_tokens_user_id_idx').on(table.userId),
		index('password_reset_tokens_request_ip_idx').on(table.requestIp),
	],
)
