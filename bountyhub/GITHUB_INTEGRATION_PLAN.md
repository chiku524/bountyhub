# GitHub Integration Plan for BountyHub

## Overview
This document outlines the comprehensive plan for integrating GitHub authentication and open-source collaboration features into the BountyHub platform.

## Phase 1: GitHub Authentication & Account Linking

### 1.1 GitHub OAuth Setup
- **Register OAuth App** with GitHub
  - Redirect URI: `https://bountyhub.tech/auth/github/callback`
  - Scopes needed: `user:email`, `read:user`, `repo` (for repository access)
- **Environment Variables**:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CALLBACK_URL`

### 1.2 Database Schema Updates
```sql
-- Add GitHub integration fields to users table
ALTER TABLE users ADD COLUMN github_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN github_username TEXT;
ALTER TABLE users ADD COLUMN github_access_token TEXT; -- Encrypted
ALTER TABLE users ADD COLUMN github_avatar_url TEXT;
ALTER TABLE users ADD COLUMN github_connected_at TIMESTAMP;

-- Create GitHub repositories table
CREATE TABLE github_repositories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  github_repo_id INTEGER UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  html_url TEXT NOT NULL,
  language TEXT,
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_github_repositories_user_id ON github_repositories(user_id);
CREATE INDEX idx_github_repositories_github_repo_id ON github_repositories(github_repo_id);
```

### 1.3 API Endpoints
- `POST /api/auth/github` - Initiate GitHub OAuth flow
- `GET /api/auth/github/callback` - Handle OAuth callback
- `POST /api/auth/github/connect` - Link existing account to GitHub
- `DELETE /api/auth/github/disconnect` - Unlink GitHub account
- `GET /api/user/github` - Get user's GitHub profile info
- `GET /api/user/github/repos` - Get user's GitHub repositories

### 1.4 Frontend Components
- **GitHub Connect Button** - In Settings/Profile page
- **GitHub Profile Display** - Show GitHub username, avatar, repos
- **GitHub Sign In Option** - On login/signup pages

## Phase 2: Bug Bounty Campaign System

### 2.1 Database Schema
```sql
-- Bug bounty campaigns table
CREATE TABLE bug_bounty_campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  github_repo_id TEXT REFERENCES github_repositories(id),
  github_repo_url TEXT NOT NULL,
  bounty_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BBUX',
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'COMPLETED')),
  max_bounties INTEGER DEFAULT 1,
  min_severity TEXT CHECK (min_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (github_repo_id) REFERENCES github_repositories(id) ON DELETE SET NULL
);

CREATE INDEX idx_bug_bounty_campaigns_user_id ON bug_bounty_campaigns(user_id);
CREATE INDEX idx_bug_bounty_campaigns_status ON bug_bounty_campaigns(status);
CREATE INDEX idx_bug_bounty_campaigns_github_repo_id ON bug_bounty_campaigns(github_repo_id);

-- Bug bounty submissions table
CREATE TABLE bug_bounty_submissions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES bug_bounty_campaigns(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  github_issue_url TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'DUPLICATE')),
  reward_amount DECIMAL(10, 2),
  verified_at TIMESTAMP,
  verified_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES bug_bounty_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_bug_bounty_submissions_campaign_id ON bug_bounty_submissions(campaign_id);
CREATE INDEX idx_bug_bounty_submissions_user_id ON bug_bounty_submissions(user_id);
CREATE INDEX idx_bug_bounty_submissions_status ON bug_bounty_submissions(status);
```

### 2.2 API Endpoints
- `GET /api/bug-bounties` - List all bug bounty campaigns
- `GET /api/bug-bounties/:id` - Get campaign details
- `POST /api/bug-bounties` - Create new campaign
- `PUT /api/bug-bounties/:id` - Update campaign
- `DELETE /api/bug-bounties/:id` - Delete campaign
- `POST /api/bug-bounties/:id/submit` - Submit bug report
- `GET /api/bug-bounties/:id/submissions` - Get submissions for campaign
- `PUT /api/bug-bounties/submissions/:id/verify` - Verify/reject submission
- `GET /api/bug-bounties/my-campaigns` - Get user's campaigns
- `GET /api/bug-bounties/my-submissions` - Get user's submissions

### 2.3 Frontend Pages
- **Bug Bounties Page** (`/bug-bounties`) - List all campaigns
- **Create Bug Bounty Page** (`/bug-bounties/create`) - Create new campaign
- **Bug Bounty Detail Page** (`/bug-bounties/:id`) - View campaign and submissions
- **Submit Bug Page** (`/bug-bounties/:id/submit`) - Submit bug report
- **My Bug Bounties Page** (`/profile/bug-bounties`) - User's campaigns and submissions

### 2.4 Features
- **GitHub Issue Integration**: Automatically create GitHub issues for verified bugs
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL with different reward tiers
- **Verification System**: Campaign owner verifies submissions
- **Duplicate Detection**: Prevent duplicate bug reports
- **Reward Distribution**: Automatic BBUX transfer on verification

## Phase 3: Open Source Collaboration Features

### 3.1 GitHub Repository Integration
- **Repository Display**: Show user's GitHub repos on profile
- **Repository Stats**: Stars, forks, contributions
- **Issue Tracking**: Link GitHub issues to bounties
- **Pull Request Integration**: Track PRs related to bounties

### 3.2 Contribution Tracking
- **Contribution Badges**: Recognize top contributors
- **Contribution Leaderboard**: Show most active contributors
- **GitHub Activity Feed**: Display user's GitHub activity
- **Contribution Statistics**: Commits, PRs, issues opened/closed

### 3.3 Collaboration Features
- **Team Bounties**: Multiple users can collaborate on bounties
- **Code Review Bounties**: Reward for code reviews
- **Documentation Bounties**: Reward for improving docs
- **Feature Request Bounties**: Reward for implementing features

### 3.4 Database Schema Extensions
```sql
-- User contributions tracking
CREATE TABLE user_contributions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  github_repo_id TEXT REFERENCES github_repositories(id),
  contribution_type TEXT CHECK (contribution_type IN ('COMMIT', 'PR', 'ISSUE', 'REVIEW')),
  github_id TEXT,
  title TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (github_repo_id) REFERENCES github_repositories(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX idx_user_contributions_github_repo_id ON user_contributions(github_repo_id);
```

## Phase 4: Additional Features

### 4.1 GitHub Profile Enhancement
- Display GitHub contribution graph
- Show GitHub achievements/badges
- Link GitHub profile to bountyhub profile
- Sync GitHub avatar to bountyhub

### 4.2 Repository Management
- Allow users to add/remove repositories
- Set repository visibility (public/private)
- Configure which repos can have bug bounties
- Repository-level analytics

### 4.3 Notification System
- GitHub webhook integration for real-time updates
- Notify on new bug submissions
- Notify on campaign status changes
- Notify on reward distribution

### 4.4 Analytics & Reporting
- Campaign performance metrics
- Most active repositories
- Top bug hunters
- Bug bounty payout statistics

## Implementation Priority

1. **High Priority** (Phase 1 + Basic Phase 2):
   - GitHub OAuth authentication
   - Account linking
   - Basic bug bounty campaign creation
   - Bug submission system

2. **Medium Priority** (Phase 2 Complete):
   - Verification system
   - GitHub issue integration
   - Reward distribution
   - My campaigns/submissions pages

3. **Low Priority** (Phase 3 + 4):
   - Contribution tracking
   - Advanced collaboration features
   - Analytics dashboard
   - Webhook integrations

## Security Considerations

1. **OAuth Token Security**:
   - Encrypt GitHub access tokens in database
   - Use secure token storage
   - Implement token refresh mechanism

2. **Rate Limiting**:
   - Limit GitHub API calls
   - Prevent abuse of bug bounty system
   - Rate limit submissions per user

3. **Verification**:
   - Require proof of bug (screenshots, logs)
   - Prevent fake submissions
   - Implement reporting system for abuse

4. **Access Control**:
   - Only campaign owners can verify submissions
   - Only connected GitHub accounts can create campaigns
   - Private repository access control

## API Dependencies

- **GitHub REST API v3**: For user repos, issues, PRs
- **GitHub GraphQL API v4**: For advanced queries (optional)
- **Octokit.js**: GitHub API client library

## Next Steps

1. Set up GitHub OAuth App
2. Create database migrations
3. Implement OAuth flow
4. Build basic bug bounty UI
5. Test with real GitHub accounts
6. Deploy to production

