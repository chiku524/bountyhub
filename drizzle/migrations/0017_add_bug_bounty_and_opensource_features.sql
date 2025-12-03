-- Migration: Add Bug Bounty Campaign System and Open Source Collaboration Features
-- Date: 2025-11-04

-- GitHub Repositories table
CREATE TABLE IF NOT EXISTS github_repositories (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  html_url TEXT NOT NULL,
  language TEXT,
  stars INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  is_private INTEGER NOT NULL DEFAULT 0,
  is_fork INTEGER NOT NULL DEFAULT 0,
  default_branch TEXT NOT NULL DEFAULT 'main',
  topics TEXT,
  last_synced_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bug Bounty Campaigns table
CREATE TABLE IF NOT EXISTS bug_bounty_campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repository_id TEXT REFERENCES github_repositories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
  total_budget REAL NOT NULL DEFAULT 0,
  remaining_budget REAL NOT NULL DEFAULT 0,
  min_reward REAL NOT NULL DEFAULT 0,
  max_reward REAL NOT NULL DEFAULT 0,
  scope TEXT,
  rules TEXT,
  severity_levels TEXT,
  start_date INTEGER,
  end_date INTEGER,
  is_public INTEGER NOT NULL DEFAULT 1,
  allow_team_bounties INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bug Submissions table
CREATE TABLE IF NOT EXISTS bug_submissions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES bug_bounty_campaigns(id) ON DELETE CASCADE,
  submitter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVIEWING', 'VERIFIED', 'REJECTED', 'DUPLICATE', 'RESOLVED', 'AWARDED')),
  reward_amount REAL,
  github_issue_url TEXT,
  github_issue_number INTEGER,
  evidence TEXT,
  steps_to_reproduce TEXT,
  impact TEXT,
  suggested_fix TEXT,
  verification_notes TEXT,
  verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  verified_at INTEGER,
  awarded_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bug Submission Verification Workflow table
CREATE TABLE IF NOT EXISTS bug_submission_verifications (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES bug_submissions(id) ON DELETE CASCADE,
  verifier_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN ('INITIAL_REVIEW', 'REPRODUCTION', 'IMPACT_ASSESSMENT', 'VERIFICATION', 'FINAL_REVIEW')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED')),
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repository_id TEXT REFERENCES github_repositories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('COMMIT', 'PULL_REQUEST', 'ISSUE', 'CODE_REVIEW', 'BUG_SUBMISSION', 'FEATURE_SUGGESTION', 'DOCUMENTATION')),
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  github_id INTEGER,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'MERGED', 'CLOSED', 'REJECTED')),
  contribution_date INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reward_amount REAL NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CONTRIBUTION', 'ACHIEVEMENT', 'COLLABORATION', 'EXPERTISE', 'COMMUNITY')),
  rarity TEXT NOT NULL DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  requirements TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reference_id TEXT,
  reference_type TEXT
);

-- Team Bounties table
CREATE TABLE IF NOT EXISTS team_bounties (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES bug_bounty_campaigns(id) ON DELETE CASCADE,
  submission_id TEXT REFERENCES bug_submissions(id) ON DELETE SET NULL,
  team_name TEXT NOT NULL,
  reward_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  team_members TEXT,
  contribution_distribution TEXT,
  completed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GitHub Activity Feed table
CREATE TABLE IF NOT EXISTS github_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repository_id TEXT REFERENCES github_repositories(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('COMMIT', 'PULL_REQUEST', 'PULL_REQUEST_REVIEW', 'ISSUE', 'ISSUE_COMMENT', 'FORK', 'STAR', 'RELEASE')),
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT NOT NULL,
  github_id INTEGER,
  metadata TEXT,
  activity_date INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_github_repos_owner_id ON github_repositories(owner_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_full_name ON github_repositories(full_name);
CREATE INDEX IF NOT EXISTS idx_bug_bounty_campaigns_owner_id ON bug_bounty_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_bug_bounty_campaigns_status ON bug_bounty_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_bug_bounty_campaigns_repository_id ON bug_bounty_campaigns(repository_id);
CREATE INDEX IF NOT EXISTS idx_bug_submissions_campaign_id ON bug_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bug_submissions_submitter_id ON bug_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_bug_submissions_status ON bug_submissions(status);
CREATE INDEX IF NOT EXISTS idx_bug_submissions_severity ON bug_submissions(severity);
CREATE INDEX IF NOT EXISTS idx_bug_submission_verifications_submission_id ON bug_submission_verifications(submission_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_repository_id ON contributions(repository_id);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_team_bounties_campaign_id ON team_bounties(campaign_id);
CREATE INDEX IF NOT EXISTS idx_github_activity_user_id ON github_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_github_activity_repository_id ON github_activity(repository_id);
CREATE INDEX IF NOT EXISTS idx_github_activity_type ON github_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_github_activity_date ON github_activity(activity_date DESC);

