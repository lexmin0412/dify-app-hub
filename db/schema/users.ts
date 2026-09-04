import { mysqlTable, varchar, datetime, uniqueIndex, int } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'
import { generateUuidV4 } from '@/lib/helpers'

export const users = mysqlTable(
	'users',
	{
		id: varchar({ length: 36 })
			.primaryKey()
			.$defaultFn(() => generateUuidV4()),
		name: varchar({ length: 255 }),
		email: varchar({ length: 255 }).notNull(),
		password: varchar({ length: 255 }).notNull(),
		sessionVersion: int('session_version').default(0).notNull(),
		createdAt: datetime('created_at', { fsp: 3 })
			.default(sql`CURRENT_TIMESTAMP(3)`)
			.notNull(),
		updatedAt: datetime('updated_at', { fsp: 3 })
			.default(sql`CURRENT_TIMESTAMP(3)`)
			.notNull(),
	},
	table => [uniqueIndex('users_email_key').on(table.email)],
)
