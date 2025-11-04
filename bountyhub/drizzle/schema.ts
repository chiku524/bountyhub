import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  tokenAccountAddress: text('token_account_address'),
  role: text('role', { enum: ['user', 'moderator', 'admin'] }).notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  reputationPoints: integer('reputation_points').notNull().default(0),
  integrityScore: real('integrity_score').notNull().default(5.0),
  totalRatings: integer('total_ratings').notNull().default(0),
  // GitHub integration fields
  githubId: text('github_id').unique(),
  githubUsername: text('github_username'),
  githubAccessToken: text('github_access_token'), // Should be encrypted in production
  githubAvatarUrl: text('github_avatar_url'),
  githubConnectedAt: integer('github_connected_at', { mode: 'timestamp' }),
});

// Profiles table
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  facebook: text('facebook'),
  twitter: text('twitter'),
  instagram: text('instagram'),
  linkedin: text('linkedin'),
  github: text('github'),
  youtube: text('youtube'),
  tiktok: text('tiktok'),
  discord: text('discord'),
  reddit: text('reddit'),
  medium: text('medium'),
  stackoverflow: text('stackoverflow'),
  devto: text('devto'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Posts table
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  editedAt: integer('edited_at', { mode: 'timestamp' }),
  visibilityVotes: integer('visibility_votes').notNull().default(0),
  qualityUpvotes: integer('quality_upvotes').notNull().default(0),
  qualityDownvotes: integer('quality_downvotes').notNull().default(0),
  hasBounty: integer('has_bounty', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['OPEN', 'CLOSED', 'COMPLETED'] }).notNull().default('OPEN'),
});

// Media table
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // IMAGE, VIDEO, AUDIO
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  isScreenRecording: integer('is_screen_recording', { mode: 'boolean' }).notNull().default(false),
  cloudinaryId: text('cloudinary_id').notNull(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Comments table
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  answerId: text('answer_id').references(() => answers.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
});

// Answers table
export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  isAccepted: integer('is_accepted', { mode: 'boolean' }).notNull().default(false),
});

// Votes table
export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  commentId: text('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  answerId: text('answer_id').references(() => answers.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(),
  voteType: text('vote_type').notNull(),
  isQualityVote: integer('is_quality_vote', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Code blocks table
export const codeBlocks = sqliteTable('code_blocks', {
  id: text('id').primaryKey(),
  language: text('language').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Answer code blocks table
export const answerCodeBlocks = sqliteTable('answer_code_blocks', {
  id: text('id').primaryKey(),
  language: text('language').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  answerId: text('answer_id').notNull().references(() => answers.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Reputation history table
export const reputationHistory = sqliteTable('reputation_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points').notNull(),
  action: text('action').notNull(),
  referenceId: text('reference_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Bounties table
export const bounties = sqliteTable('bounties', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().unique().references(() => posts.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  status: text('status', { enum: ['ACTIVE', 'CLAIMED', 'REFUNDED', 'EXPIRED'] }).notNull().default('ACTIVE'),
  winnerId: text('winner_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  signature: text('signature'),
  mintAddress: text('mint_address'),
  tokenDecimals: integer('token_decimals').notNull().default(9),
  refundLockPeriod: integer('refund_lock_period').notNull().default(24),
  firstAnswerAt: integer('first_answer_at', { mode: 'timestamp' }),
  refundReason: text('refund_reason'),
  refundPenalty: real('refund_penalty').notNull().default(0),
  communityFee: real('community_fee').notNull().default(0.05),
});

// Virtual wallets table
export const virtualWallets = sqliteTable('virtual_wallets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  balance: real('balance').notNull().default(0),
  totalDeposited: real('total_deposited').notNull().default(0),
  totalWithdrawn: real('total_withdrawn').notNull().default(0),
  totalEarned: real('total_earned').notNull().default(0),
  totalSpent: real('total_spent').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Transaction logs table
export const transactionLogs = sqliteTable('transaction_logs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  transactionId: text('transaction_id').notNull().unique(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  status: text('status').notNull(),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// User ratings table
export const userRatings = sqliteTable('user_ratings', {
  id: text('id').primaryKey(),
  raterId: text('rater_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ratedUserId: text('rated_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  reason: text('reason').notNull(),
  context: text('context').notNull(),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Integrity violations table
export const integrityViolations = sqliteTable('integrity_violations', {
  id: text('id').primaryKey(),
  reporterId: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetUserId: text('target_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  violationType: text('violation_type').notNull(),
  description: text('description').notNull(),
  evidence: text('evidence'),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  status: text('status', { enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'] }).notNull().default('PENDING'),
  moderatorNotes: text('moderator_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Integrity history table
export const integrityHistory = sqliteTable('integrity_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  points: integer('points').notNull(),
  description: text('description').notNull(),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').notNull().default('#8B5CF6'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Post tags junction table
export const postTags = sqliteTable('post_tags', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

// Bookmarks table
export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Refund requests table
export const refundRequests = sqliteTable('refund_requests', {
  id: text('id').primaryKey(),
  bountyId: text('bounty_id').notNull().references(() => bounties.id, { onDelete: 'cascade' }),
  requesterId: text('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'] }).notNull().default('PENDING'),
  communityVotes: integer('community_votes').notNull().default(0),
  requiredVotes: integer('required_votes').notNull().default(5),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

// Refund request votes table
export const refundRequestVotes = sqliteTable('refund_request_votes', {
  id: text('id').primaryKey(),
  refundRequestId: text('refund_request_id').notNull().references(() => refundRequests.id, { onDelete: 'cascade' }),
  voterId: text('voter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vote: integer('vote', { mode: 'boolean' }).notNull(),
  reason: text('reason'),
  rewardAmount: real('reward_amount').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Reports table
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  reporterId: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  commentId: text('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  answerId: text('answer_id').references(() => answers.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'] }).notNull().default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Bounty claims table
export const bountyClaims = sqliteTable('bounty_claims', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  answerId: text('answer_id').notNull().references(() => answers.id, { onDelete: 'cascade' }),
  claimantId: text('claimant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).notNull().default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Integrity ratings table
export const integrityRatings = sqliteTable('integrity_ratings', {
  id: text('id').primaryKey(),
  raterId: text('rater_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  reason: text('reason').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp' })
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['comment', 'vote', 'answer', 'bounty', 'system'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  navigationType: text('navigation_type'),
  navigationId: text('navigation_id'),
  navigationUrl: text('navigation_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Notification settings table
export const notificationSettings = sqliteTable('notification_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).notNull().default(true),
  pushNotifications: integer('push_notifications', { mode: 'boolean' }).notNull().default(true),
  commentNotifications: integer('comment_notifications', { mode: 'boolean' }).notNull().default(true),
  voteNotifications: integer('vote_notifications', { mode: 'boolean' }).notNull().default(true),
  bountyNotifications: integer('bounty_notifications', { mode: 'boolean' }).notNull().default(true),
  systemNotifications: integer('system_notifications', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Governance treasury table
export const governanceTreasury = sqliteTable('governance_treasury', {
  id: text('id').primaryKey(),
  balance: real('balance').notNull().default(0),
  totalCollected: real('total_collected').notNull().default(0),
  totalDistributed: real('total_distributed').notNull().default(0),
  lastDistributionAt: integer('last_distribution_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Governance stakes table
export const governanceStakes = sqliteTable('governance_stakes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  stakedAt: integer('staked_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  lastRewardAt: integer('last_reward_at', { mode: 'timestamp' }),
  totalRewardsEarned: real('total_rewards_earned').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Governance rewards table
export const governanceRewards = sqliteTable('governance_rewards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  rewardType: text('reward_type', { enum: ['STAKING', 'ACTIVITY', 'BOUNTY_PLACEMENT', 'BOUNTY_CLAIM', 'DAILY_LOGIN', 'GOVERNANCE_PARTICIPATION'] }).notNull(),
  description: text('description').notNull(),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Governance activity table
export const governanceActivity = sqliteTable('governance_activity', {
  id: text('id').primaryKey(),
  activityType: text('activity_type', { enum: ['FEE_COLLECTED', 'REWARD_DISTRIBUTED', 'STAKE_ADDED', 'STAKE_REMOVED', 'TREASURY_UPDATE'] }).notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Transparency logs table
export const transparencyLogs = sqliteTable('transparency_logs', {
  id: text('id').primaryKey(),
  logType: text('log_type', { enum: ['BOUNTY_PLACED', 'BOUNTY_CLAIMED', 'GOVERNANCE_FEE', 'REWARD_DISTRIBUTED', 'STAKE_ADDED', 'STAKE_REMOVED', 'TREASURY_UPDATE'] }).notNull(),
  amount: real('amount').notNull(),
  feeAmount: real('fee_amount').notNull().default(0),
  description: text('description').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  balanceBefore: real('balance_before'),
  balanceAfter: real('balance_after'),
  treasuryBalanceBefore: real('treasury_balance_before'),
  treasuryBalanceAfter: real('treasury_balance_after'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Governance proposals table
export const governanceProposals = sqliteTable('governance_proposals', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  proposerId: text('proposer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['DRAFT', 'ACTIVE', 'PASSED', 'REJECTED', 'EXPIRED'] }).notNull().default('DRAFT'),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  requiredStake: real('required_stake').notNull().default(0),
  yesVotes: real('yes_votes').notNull().default(0),
  noVotes: real('no_votes').notNull().default(0),
  totalVotes: real('total_votes').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Governance votes table
export const governanceVotes = sqliteTable('governance_votes', {
  id: text('id').primaryKey(),
  proposalId: text('proposal_id').notNull().references(() => governanceProposals.id, { onDelete: 'cascade' }),
  voterId: text('voter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vote: integer('vote', { mode: 'boolean' }).notNull(), // true = yes, false = no
  votingPower: real('voting_power').notNull(),
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Chat rooms table
export const chatRooms = sqliteTable('chat_rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['GLOBAL', 'PRIVATE', 'GROUP'] }).notNull().default('GLOBAL'),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Chat messages table
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type', { enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'] }).notNull().default('TEXT'),
  mediaUrl: text('media_url'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  replyToId: text('reply_to_id'), // Will be handled in application logic
  isEdited: integer('is_edited', { mode: 'boolean' }).notNull().default(false),
  editedAt: integer('edited_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Chat room participants table
export const chatRoomParticipants = sqliteTable('chat_room_participants', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['MEMBER', 'MODERATOR', 'ADMIN'] }).notNull().default('MEMBER'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  lastReadAt: integer('last_read_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// Chat message reactions table
export const chatMessageReactions = sqliteTable('chat_message_reactions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reaction: text('reaction').notNull(), // emoji or reaction type
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Chat message reads table
export const chatMessageReads = sqliteTable('chat_message_reads', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: integer('read_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Export all tables for use in the application
export const schema = {
  users,
  profiles,
  posts,
  media,
  comments,
  answers,
  votes,
  codeBlocks,
  answerCodeBlocks,
  reputationHistory,
  bounties,
  virtualWallets,
  transactionLogs,
  userRatings,
  integrityViolations,
  integrityHistory,
  tags,
  postTags,
  bookmarks,
  refundRequests,
  refundRequestVotes,
  reports,
  bountyClaims,
  integrityRatings,
  sessions,
  notifications,
  notificationSettings,
  governanceTreasury,
  governanceStakes,
  governanceRewards,
  governanceActivity,
  transparencyLogs,
  governanceProposals,
  governanceVotes,
  chatRooms,
  chatMessages,
  chatRoomParticipants,
  chatMessageReactions,
  chatMessageReads,
}; 