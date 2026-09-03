import { mysqlTable, varchar, datetime, int, boolean, text } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'
import { generateUuidV4 } from '@/lib/helpers'

export const difyApps = mysqlTable('dify_apps', {
	id: varchar({ length: 36 })
		.primaryKey()
		.$defaultFn(() => generateUuidV4()),
	createdAt: datetime('created_at', { fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updated_at', { fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	name: varchar({ length: 255 }).notNull(),
	mode: varchar({ length: 255 }),
	description: text(),
	tags: text(),
	isEnabled: int('is_enabled').default(1),
	apiBase: varchar('api_base', { length: 500 }).notNull(),
	apiKey: varchar('api_key', { length: 255 }).notNull(),
	enableAnswerForm: boolean('enable_answer_form').default(false).notNull(),
	answerFormFeedbackText: text('answer_form_feedback_text'),
	enableUpdateInputAfterStarts: boolean('enable_update_input_after_starts')
		.default(false)
		.notNull(),
	openingStatementDisplayMode: varchar('opening_statement_display_mode', { length: 20 }),
	enableAnnotation: boolean('enable_annotation').default(false).notNull(),
})
