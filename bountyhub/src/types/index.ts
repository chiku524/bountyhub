// User types
export interface User {
  id: string
  email: string
  username: string
  role?: 'user' | 'moderator' | 'admin'
  profilePicture?: string
  reputationPoints: number
  integrityScore?: number
  totalRatings?: number
  createdAt: string
  updatedAt: string
  profile?: {
    firstName: string | null
    lastName: string | null
    bio: string | null
    location: string | null
    website: string | null
    facebook: string | null
    twitter: string | null
    instagram: string | null
    linkedin: string | null
    github: string | null
    youtube: string | null
    tiktok: string | null
    discord: string | null
    reddit: string | null
    medium: string | null
    stackoverflow: string | null
    devto: string | null
    profilePicture: string | null
  }
  bookmarks?: Bookmark[]
  reputationHistory?: ReputationHistory[]
}

// Post types
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  author?: User
  createdAt: string
  updatedAt: string
  editedAt?: string
  status: 'OPEN' | 'CLOSED' | 'COMPLETED'
  reward?: number
  qualityUpvotes?: number
  qualityDownvotes?: number
  visibilityVotes?: number
  commentCount?: number
  hasBounty?: boolean
  codeBlocks?: CodeBlock[]
  media?: Media[]
  userVote?: number
  tags?: string[]
}

// Comment types
export interface Comment {
  id: string
  content: string
  authorId: string
  postId: string
  createdAt: string
  updatedAt: string
  upvotes: number
  downvotes: number
  author?: User
}

// Answer types
export interface Answer {
  id: string
  content: string
  authorId: string
  postId: string
  createdAt: string
  updatedAt: string
  upvotes: number
  downvotes: number
  isAccepted: boolean
  author?: User
  codeBlocks?: CodeBlock[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  password: string
  username: string
}

export interface PostForm {
  title: string
  content: string
  authorId: string
  codeBlocks?: CodeBlock[]
  media?: Media[]
}

export interface CodeBlock {
  language: string
  code: string
  description?: string
}

export interface Media {
  type: 'image' | 'video' | 'file'
  url: string
  thumbnailUrl?: string
  isScreenRecording: boolean
}

// Wallet types
export interface WalletInfo {
  address: string
  bbuxBalance: number
  solBalance: number
  platformAddress: string
  virtualBalance: number
  totalDeposited: number
  totalWithdrawn: number
  totalEarned: number
  totalSpent: number
  createdAt: string
  updatedAt: string
  user?: User
  supplyStats?: {
    initialSupply: number
    currentSupply: number
    burnedAmount: number
    burnPercentage: number
    totalDeposited: number
    totalWithdrawn: number
  }
}

// Transaction types (legacy wallet transactions)
export interface Transaction {
  id: string
  userId: string
  walletId: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'BOUNTY_CREATED' | 'BOUNTY_CLAIMED' | 'BOUNTY_REFUNDED' | 'BOUNTY_EARNED' | 'COMPENSATION'
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  solanaSignature?: string
  bountyId?: string
  metadata?: string
  createdAt: string
  updatedAt: string
}

// New transaction log types (for transactionLogs table)
export interface TransactionLog {
  id: string
  type: string
  userId: string
  amount: number
  transactionId: string
  timestamp: string
  status: string
  metadata?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

// Bookmark types
export interface Bookmark {
  id: string
  postId: string
  createdAt: string
  post: {
    id: string
    title: string
    content: string
    createdAt: string
    authorId: string
  }
}

// Reputation History types
export interface ReputationHistory {
  id: string
  points: number
  action: string
  createdAt: string
} 