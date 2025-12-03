CREATE TABLE `answer_code_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`answer_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE cascade
);
