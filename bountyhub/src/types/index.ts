// User types
export interface User {
  id: string
  email: string
  username: string
  profilePicture?: string
  reputation: number
  reputationLevel: string
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
  }
}

// Post types
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
  status: 'open' | 'claimed' | 'closed'
  reward?: number
  qualityUpvotes?: number
  qualityDownvotes?: number
  visibilityVotes?: number
  commentCount?: number
  hasBounty?: boolean
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
  balance: number
  totalDeposited: number
  totalWithdrawn: number
  totalEarned: number
  totalSpent: number
  createdAt: string
  updatedAt: string
} 