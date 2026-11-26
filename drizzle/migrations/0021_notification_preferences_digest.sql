-- Per-type alert choices and the optional email digest.
-- notification_settings already exists (0004); rows are created lazily the first time a user saves preferences.
ALTER TABLE `notification_settings` ADD COLUMN `answer_notifications` integer DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE `notification_settings` ADD COLUMN `digest_frequency` text DEFAULT 'off' NOT NULL;
--> statement-breakpoint
ALTER TABLE `notification_settings` ADD COLUMN `last_digest_sent_at` integer;
--> statement-breakpoint
ALTER TABLE `notification_settings` ADD COLUMN `digest_token` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `notification_settings_digest_idx` ON `notification_settings` (`digest_frequency`, `last_digest_sent_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `notification_settings_digest_token_unique` ON `notification_settings` (`digest_token`);
