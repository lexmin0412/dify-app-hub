CREATE TABLE `password_reset_tokens` (
	`id` varchar(36) PRIMARY KEY,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`used_at` datetime(3),
	`created_at` datetime(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `session_version` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `password_reset_tokens_user_id_idx` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `password_reset_tokens_token_hash_idx` ON `password_reset_tokens` (`token_hash`);