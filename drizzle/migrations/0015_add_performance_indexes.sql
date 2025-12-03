-- Migration: Add performance indexes for frequently queried columns
-- This migration adds indexes to improve query performance on commonly used columns
-- Date: 2025-01-XX

-- Posts table indexes
-- Used for: Listing posts by creation date (most common query)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
-- Used for: Finding posts by author
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
-- Used for: Filtering posts by status (OPEN, CLOSED, COMPLETED)
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
-- Used for: Filtering posts with bounties
CREATE INDEX IF NOT EXISTS idx_posts_has_bounty ON posts(has_bounty);
-- Composite index for common query: status + created_at (for active posts ordered by date)
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts(status, created_at DESC);

-- Bounties table indexes
-- Used for: Finding active bounties (most common query)
CREATE INDEX IF NOT EXISTS idx_bounties_status ON bounties(status);
-- Used for: Finding bounties by post
CREATE INDEX IF NOT EXISTS idx_bounties_post_id ON bounties(post_id);
-- Used for: Finding bounties by winner
CREATE INDEX IF NOT EXISTS idx_bounties_winner_id ON bounties(winner_id);
-- Composite index for active bounties ordered by creation
CREATE INDEX IF NOT EXISTS idx_bounties_status_created_at ON bounties(status, created_at DESC);

-- Answers table indexes
-- Used for: Finding answers by post (very common)
CREATE INDEX IF NOT EXISTS idx_answers_post_id ON answers(post_id);
-- Used for: Finding accepted answers
CREATE INDEX IF NOT EXISTS idx_answers_is_accepted ON answers(is_accepted);
-- Used for: Finding answers by author
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
-- Composite index for accepted answers by post
CREATE INDEX IF NOT EXISTS idx_answers_post_accepted ON answers(post_id, is_accepted);

-- Comments table indexes
-- Used for: Finding comments by post
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
-- Used for: Finding comments by author
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
-- Used for: Finding comments by answer
CREATE INDEX IF NOT EXISTS idx_comments_answer_id ON comments(answer_id);

-- Votes table indexes
-- Used for: Finding votes by user and post (common check)
CREATE INDEX IF NOT EXISTS idx_votes_user_post ON votes(user_id, post_id);
-- Used for: Finding votes by user and comment
CREATE INDEX IF NOT EXISTS idx_votes_user_comment ON votes(user_id, comment_id);
-- Used for: Finding votes by user and answer
CREATE INDEX IF NOT EXISTS idx_votes_user_answer ON votes(user_id, answer_id);
-- Used for: Finding votes by post
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id);

-- Bookmarks table indexes
-- Used for: Finding bookmarks by user (very common)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
-- Used for: Checking if user bookmarked a post (common check)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_post ON bookmarks(user_id, post_id);
-- Used for: Finding bookmarks by post
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- Notifications table indexes
-- Used for: Finding notifications by user (very common)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
-- Used for: Finding unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
-- Used for: Recent notifications ordered by date
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);

-- Chat messages table indexes
-- Used for: Finding messages by room (very common)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
-- Used for: Recent messages ordered by date
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created_at ON chat_messages(room_id, created_at DESC);
-- Used for: Finding messages by author
CREATE INDEX IF NOT EXISTS idx_chat_messages_author_id ON chat_messages(author_id);

-- Transaction logs table indexes
-- Used for: Finding transactions by user
CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_id ON transaction_logs(user_id);
-- Used for: Finding transactions by status
CREATE INDEX IF NOT EXISTS idx_transaction_logs_status ON transaction_logs(status);
-- Used for: Recent transactions ordered by date
CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_created_at ON transaction_logs(user_id, created_at DESC);

-- Post tags junction table indexes
-- Used for: Finding tags by post (very common)
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
-- Used for: Finding posts by tag
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Reputation history table indexes
-- Used for: Finding reputation history by user
CREATE INDEX IF NOT EXISTS idx_reputation_history_user_id ON reputation_history(user_id);
-- Used for: Recent reputation changes ordered by date
CREATE INDEX IF NOT EXISTS idx_reputation_history_user_created_at ON reputation_history(user_id, created_at DESC);

-- Virtual wallets table indexes
-- Used for: Finding wallet by user (already has unique index, but adding for completeness)
-- Note: user_id already has unique index, but adding explicit index for clarity
CREATE INDEX IF NOT EXISTS idx_virtual_wallets_user_id ON virtual_wallets(user_id);

-- Sessions table indexes
-- Used for: Finding sessions by user
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
-- Used for: Finding active sessions by expiration
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Governance stakes table indexes
-- Used for: Finding stakes by user
CREATE INDEX IF NOT EXISTS idx_governance_stakes_user_id ON governance_stakes(user_id);
-- Used for: Finding active stakes
CREATE INDEX IF NOT EXISTS idx_governance_stakes_is_active ON governance_stakes(is_active);

-- Refund requests table indexes
-- Used for: Finding refund requests by status
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
-- Used for: Finding refund requests by bounty
CREATE INDEX IF NOT EXISTS idx_refund_requests_bounty_id ON refund_requests(bounty_id);
-- Used for: Finding refund requests by requester
CREATE INDEX IF NOT EXISTS idx_refund_requests_requester_id ON refund_requests(requester_id);

