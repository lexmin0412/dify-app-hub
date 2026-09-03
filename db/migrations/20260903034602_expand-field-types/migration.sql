ALTER TABLE `dify_apps` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `mode` varchar(255);--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `description` text;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `tags` text;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `api_base` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `api_key` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `answer_form_feedback_text` text;--> statement-breakpoint
ALTER TABLE `dify_apps` MODIFY COLUMN `opening_statement_display_mode` varchar(20);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` varchar(255) NOT NULL;
