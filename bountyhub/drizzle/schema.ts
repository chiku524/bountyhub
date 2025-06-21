import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  solanaAddress: text('solana_address').unique(),
  tokenAccountAddress: text('token_account_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  reputationPoints: integer('reputation_points').notNull().default(0),
  integrityScore: real('integrity_score').notNull().default(5.0),
  totalRatings: integer('total_ratings').notNull().default(0),
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

// Wallet transactions table
export const walletTransactions = sqliteTable('wallet_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  walletId: text('wallet_id').notNull().references(() => virtualWallets.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['DEPOSIT', 'WITHDRAW', 'BOUNTY_CREATED', 'BOUNTY_CLAIMED', 'BOUNTY_REFUNDED', 'BOUNTY_EARNED', 'COMPENSATION'] }).notNull(),
  amount: real('amount').notNull(),
  balanceBefore: real('balance_before').notNull(),
  balanceAfter: real('balance_after').notNull(),
  description: text('description').notNull(),
  status: text('status', { enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] }).notNull().default('PENDING'),
  solanaSignature: text('solana_signature'),
  bountyId: text('bounty_id').references(() => bounties.id, { onDelete: 'set null' }),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Transaction logs table
export const transactionLogs = sqliteTable('transaction_logs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  transactionId: text('transaction_id').notNull(),
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
  reputationHistory,
  bounties,
  virtualWallets,
  walletTransactions,
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
}; 