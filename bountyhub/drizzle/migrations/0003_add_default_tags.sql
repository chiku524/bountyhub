CREATE TABLE `bounty_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`answer_id` text NOT NULL,
	`claimant_id` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`claimant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrity_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`rater_id` text NOT NULL,
	`post_id` text NOT NULL,
	`rating` integer NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rater_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`post_id` text,
	`comment_id` text,
	`answer_id` text,
	`reason` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Migration: add_default_tags
-- Created at: 2024-12-19 10:30:00

-- Add default tags
INSERT INTO tags (id, name, description, color) VALUES 
('tag-js-001', 'javascript', 'JavaScript programming language', '#F7DF1E'),
('tag-ts-002', 'typescript', 'TypeScript programming language', '#3178C6'),
('tag-py-003', 'python', 'Python programming language', '#3776AB'),
('tag-react-004', 'react', 'React.js framework', '#61DAFB'),
('tag-node-005', 'nodejs', 'Node.js runtime', '#339933'),
('tag-sol-006', 'solana', 'Solana blockchain', '#14F195'),
('tag-web3-007', 'web3', 'Web3 and blockchain development', '#FF6B35'),
('tag-front-008', 'frontend', 'Frontend development', '#FF6B6B'),
('tag-back-009', 'backend', 'Backend development', '#4ECDC4'),
('tag-db-010', 'database', 'Database and data management', '#45B7D1'),
('tag-api-011', 'api', 'API development and integration', '#96CEB4'),
('tag-sec-012', 'security', 'Security and authentication', '#FFEAA7'),
('tag-dep-013', 'deployment', 'Deployment and DevOps', '#DDA0DD'),
('tag-test-014', 'testing', 'Testing and quality assurance', '#98D8C8'),
('tag-perf-015', 'performance', 'Performance optimization', '#F7DC6F'),
('tag-mob-016', 'mobile', 'Mobile app development', '#BB8FCE'),
('tag-ai-017', 'ai', 'Artificial Intelligence and Machine Learning', '#85C1E9'),
('tag-game-018', 'game-dev', 'Game development', '#F8C471'),
('tag-ui-019', 'ui-ux', 'UI/UX design', '#F1948A'),
('tag-bug-020', 'bug', 'Bug reports and issues', '#E74C3C'),
('tag-feat-021', 'feature', 'Feature requests', '#2ECC71'),
('tag-help-022', 'help', 'General help and support', '#3498DB'),
('tag-disc-023', 'discussion', NULL, '#9B59B6'),
('tag-tut-024', 'tutorial', 'Tutorials and guides', '#E67E22');
