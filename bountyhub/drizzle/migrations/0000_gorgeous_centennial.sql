CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`author_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`downvotes` integer DEFAULT 0 NOT NULL,
	`is_accepted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bounties` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`winner_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer,
	`signature` text,
	`mint_address` text,
	`token_decimals` integer DEFAULT 9 NOT NULL,
	`refund_lock_period` integer DEFAULT 24 NOT NULL,
	`first_answer_at` integer,
	`refund_reason` text,
	`refund_penalty` real DEFAULT 0 NOT NULL,
	`community_fee` real DEFAULT 0.05 NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bounties_post_id_unique` ON `bounties` (`post_id`);--> statement-breakpoint
CREATE TABLE `code_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`author_id` text NOT NULL,
	`post_id` text NOT NULL,
	`answer_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`downvotes` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrity_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`points` integer NOT NULL,
	`description` text NOT NULL,
	`reference_id` text,
	`reference_type` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrity_violations` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`target_user_id` text NOT NULL,
	`violation_type` text NOT NULL,
	`description` text NOT NULL,
	`evidence` text,
	`reference_id` text,
	`reference_type` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`moderator_notes` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`is_screen_recording` integer DEFAULT false NOT NULL,
	`cloudinary_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`visibility_votes` integer DEFAULT 0 NOT NULL,
	`quality_upvotes` integer DEFAULT 0 NOT NULL,
	`quality_downvotes` integer DEFAULT 0 NOT NULL,
	`has_bounty` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`profile_picture` text,
	`bio` text,
	`location` text,
	`website` text,
	`facebook` text,
	`twitter` text,
	`instagram` text,
	`linkedin` text,
	`github` text,
	`youtube` text,
	`tiktok` text,
	`discord` text,
	`reddit` text,
	`medium` text,
	`stackoverflow` text,
	`devto` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `refund_request_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`refund_request_id` text NOT NULL,
	`voter_id` text NOT NULL,
	`vote` integer NOT NULL,
	`reason` text,
	`reward_amount` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`refund_request_id`) REFERENCES `refund_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`voter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `refund_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`bounty_id` text NOT NULL,
	`requester_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`community_votes` integer DEFAULT 0 NOT NULL,
	`required_votes` integer DEFAULT 5 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`bounty_id`) REFERENCES `bounties`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reputation_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`points` integer NOT NULL,
	`action` text NOT NULL,
	`reference_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#8B5CF6' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `transaction_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`transaction_id` text NOT NULL,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`status` text NOT NULL,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`rater_id` text NOT NULL,
	`rated_user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`reason` text NOT NULL,
	`context` text NOT NULL,
	`reference_id` text,
	`reference_type` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rater_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rated_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`solana_address` text,
	`token_account_address` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reputation_points` integer DEFAULT 0 NOT NULL,
	`integrity_score` real DEFAULT 5 NOT NULL,
	`total_ratings` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_solana_address_unique` ON `users` (`solana_address`);--> statement-breakpoint
CREATE TABLE `virtual_wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`total_deposited` real DEFAULT 0 NOT NULL,
	`total_withdrawn` real DEFAULT 0 NOT NULL,
	`total_earned` real DEFAULT 0 NOT NULL,
	`total_spent` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `virtual_wallets_user_id_unique` ON `virtual_wallets` (`user_id`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text,
	`comment_id` text,
	`answer_id` text,
	`value` integer NOT NULL,
	`vote_type` text NOT NULL,
	`is_quality_vote` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`wallet_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`balance_before` real NOT NULL,
	`balance_after` real NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`solana_signature` text,
	`bounty_id` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`wallet_id`) REFERENCES `virtual_wallets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bounty_id`) REFERENCES `bounties`(`id`) ON UPDATE no action ON DELETE set null
);
