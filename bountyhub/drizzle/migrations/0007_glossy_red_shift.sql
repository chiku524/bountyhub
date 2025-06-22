CREATE TABLE `governance_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`user_id` text,
	`reference_id` text,
	`reference_type` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `governance_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`proposer_id` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`required_stake` real DEFAULT 0 NOT NULL,
	`yes_votes` real DEFAULT 0 NOT NULL,
	`no_votes` real DEFAULT 0 NOT NULL,
	`total_votes` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`proposer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`reward_type` text NOT NULL,
	`description` text NOT NULL,
	`reference_id` text,
	`reference_type` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_stakes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`staked_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_reward_at` integer,
	`total_rewards_earned` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_treasury` (
	`id` text PRIMARY KEY NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`total_collected` real DEFAULT 0 NOT NULL,
	`total_distributed` real DEFAULT 0 NOT NULL,
	`last_distribution_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `governance_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`voter_id` text NOT NULL,
	`vote` integer NOT NULL,
	`voting_power` real NOT NULL,
	`reason` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `governance_proposals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`voter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transparency_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`log_type` text NOT NULL,
	`amount` real NOT NULL,
	`fee_amount` real DEFAULT 0 NOT NULL,
	`description` text NOT NULL,
	`user_id` text,
	`reference_id` text,
	`reference_type` text,
	`balance_before` real,
	`balance_after` real,
	`treasury_balance_before` real,
	`treasury_balance_after` real,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
