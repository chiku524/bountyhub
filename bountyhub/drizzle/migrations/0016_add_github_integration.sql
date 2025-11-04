-- Migration: Add GitHub integration fields to users table
-- Date: 2025-11-04

-- Add GitHub integration fields to users table
-- Note: SQLite doesn't support adding UNIQUE constraint directly with ALTER TABLE
-- So we add the column first, then create a unique index
ALTER TABLE users ADD COLUMN github_id TEXT;
ALTER TABLE users ADD COLUMN github_username TEXT;
ALTER TABLE users ADD COLUMN github_access_token TEXT; -- Will be encrypted in application
ALTER TABLE users ADD COLUMN github_avatar_url TEXT;
ALTER TABLE users ADD COLUMN github_connected_at INTEGER; -- Timestamp

-- Add unique index for GitHub ID lookups (enforces uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Update password to be nullable (for GitHub-only users)
-- Note: SQLite doesn't support ALTER COLUMN, so we'll handle this in application logic
-- Users with GitHub auth will have a placeholder password hash

