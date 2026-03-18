-- Migration: Add GitHub integration fields to users table
-- Date: 2025-11-04

-- Add GitHub integration fields to users table
ALTER TABLE users ADD COLUMN github_id TEXT;
ALTER TABLE users ADD COLUMN github_username TEXT;
ALTER TABLE users ADD COLUMN github_access_token TEXT;
ALTER TABLE users ADD COLUMN github_avatar_url TEXT;
ALTER TABLE users ADD COLUMN github_connected_at INTEGER;

-- Add unique index for GitHub ID lookups (enforces uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

