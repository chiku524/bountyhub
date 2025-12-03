import type { LoginForm, SignupForm, PostForm, User, Post, WalletInfo, CodeBlock, Media, TransactionLog, BugBountyCampaign, BugSubmission, GitHubRepository } from '../types'
import { config } from './config'

interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface CreatePostData {
  title: string;
  content: string;
  selectedTags: string[];
  codeBlocks: CodeBlock[];
  media: Media[];
  hasBounty: boolean;
  bountyAmount: number;
  bountyDuration: number;
}

export class ApiClient {
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${config.api.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      const errorObj = new Error(error.error || error.details || `HTTP ${response.status}`)
      // Attach response for detailed error handling
      ;(errorObj as any).response = response
      ;(errorObj as any).errorData = error
      throw errorObj
    }

    const data = await response.json()
    return data
  }

  // Special method for tags that uses production API in development
  private async requestTags<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = import.meta.env.DEV 
      ? 'https://bountyhub-api.nico-chikuji.workers.dev' 
      : config.api.baseUrl
    const url = `${baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async login(data: LoginForm): Promise<{ user: User }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async signup(data: SignupForm): Promise<{ user: User }> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request('/api/auth/me')
    } catch {
      return null
    }
  }

  // Tags - uses production API in development
  async getTags(): Promise<Tag[]> {
    const response = await this.requestTags<{ success: boolean; data: Tag[] }>('/api/tags')
    return response.data
  }

  // Posts
  async getPosts(page: number = 1, limit: number = 20): Promise<{ posts: Post[], pagination: { page: number, limit: number, total: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean } } | Post[]> {
    const response = await this.request<{ posts: Post[], pagination: any } | Post[]>(`/api/posts?page=${page}&limit=${limit}`)
    // Backward compatibility: if response is array, return it; otherwise return posts array
    if (Array.isArray(response)) {
      return response
    }
    return response
  }
  
  // Get all posts (for backward compatibility, fetches all with pagination)
  async getAllPosts(): Promise<Post[]> {
    const response = await this.request<{ posts: Post[], pagination: any } | Post[]>(`/api/posts?limit=1000`)
    if (Array.isArray(response)) {
      return response
    }
    return response.posts || []
  }

  async createPost(data: CreatePostData): Promise<{ success: boolean; post: Post; message: string }> {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPost(id: string): Promise<Post> {
    return this.request(`/api/posts/${id}`)
  }

  async updatePost(id: string, data: Partial<PostForm>): Promise<Post> {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async editPost(id: string, data: { 
    title: string; 
    content: string; 
    tags?: string[];
    codeBlocks?: CodeBlock[];
    media?: Media[];
  }): Promise<Post> {
    return this.updatePost(id, data)
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Wallet
  async getWalletInfo(): Promise<WalletInfo> {
    return this.request('/api/wallet')
  }

  async getRecentTransactions(): Promise<TransactionLog[]> {
    return this.request('/api/wallet/transactions')
  }

  async getAllTransactions(page: number = 1, limit: number = 20): Promise<{ transactions: TransactionLog[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
    return this.request(`/api/wallet/transactions/all?page=${page}&limit=${limit}`)
  }

  async performWalletAction(action: string, amount: number): Promise<{ success: boolean; transactionId?: string; message?: string; platformAddress?: string }> {
    return this.request('/api/wallet/action', {
      method: 'POST',
      body: JSON.stringify({ action, amount }),
    })
  }

  async performWalletActionWithAddress(action: string, amount: number, destinationAddress?: string): Promise<{ success: boolean; transactionId?: string; message?: string; platformAddress?: string; fee?: number; netAmount?: number }> {
    return this.request('/api/wallet/action', {
      method: 'POST',
      body: JSON.stringify({ action, amount, destinationAddress }),
    })
  }

  // Additional wallet methods for deposit/withdrawal flow
  async confirmDirectDeposit(amount: number, signature: string, destinationAddress: string): Promise<{ success: boolean; transactionId?: string; message?: string }> {
    return this.request('/api/wallet/confirm-direct-deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, signature, destinationAddress }),
    })
  }

  async confirmDeposit(transactionId: string, signature: string): Promise<{ success: boolean; message?: string; bbuxAmount?: number; signature?: string }> {
    return this.request('/api/wallet/confirm-deposit', {
      method: 'POST',
      body: JSON.stringify({ transactionId, signature }),
    })
  }

  async processWithdrawal(transactionId: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/api/wallet/process-withdrawal', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    })
  }

  // Profile
  async getProfile(): Promise<User> {
    return this.request('/api/profile')
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/api/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async uploadProfilePicture(file: File): Promise<{ success: boolean; message: string; profilePicture: string }> {
    const formData = new FormData()
    formData.append('profilePicture', file)
    
    const url = `${config.api.baseUrl}/api/profile/picture`
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // User profiles
  async getUserProfile(username: string): Promise<User> {
    return this.request(`/api/users/${username}`)
  }

  async getUserPosts(username: string): Promise<Post[]> {
    return this.request(`/api/users/${username}/posts`)
  }

  // Platform Statistics
  async getPlatformStats(): Promise<{
    activeBounties: number
    questionsAnswered: number
    totalRewards: string
    communityMembers: number
    totalPosts: number
    totalAnswers: number
    totalBBUX: string
  }> {
    return this.request('/api/stats')
  }

  // Admin methods
  async getAdminUsers(): Promise<{ users: User[] }> {
    return this.request('/api/admin')
  }

  async getAdminStats(): Promise<{ stats: { totalUsers: number; userCount: number; moderatorCount: number; adminCount: number } }> {
    return this.request('/api/admin/stats')
  }

  async updateUserRole(userId: string, role: 'user' | 'moderator' | 'admin'): Promise<{ success: boolean; message: string; user: User }> {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  // Bug Bounty Campaign methods
  async getBugBountyCampaigns(params?: {
    page?: number
    limit?: number
    status?: string
    ownerId?: string
    isPublic?: boolean
  }): Promise<{ campaigns: BugBountyCampaign[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.ownerId) queryParams.append('ownerId', params.ownerId)
    if (params?.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString())
    
    const query = queryParams.toString()
    return this.request(`/api/bug-bounty/campaigns${query ? `?${query}` : ''}`)
  }

  async getBugBountyCampaign(id: string): Promise<BugBountyCampaign> {
    return this.request(`/api/bug-bounty/campaigns/${id}`)
  }

  async createBugBountyCampaign(data: {
    title: string
    description: string
    repositoryId?: string
    status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
    totalBudget: number
    minReward: number
    maxReward: number
    scope?: any
    rules?: any
    severityLevels?: any
    startDate?: string
    endDate?: string
    isPublic?: boolean
    allowTeamBounties?: boolean
  }): Promise<BugBountyCampaign> {
    return this.request('/api/bug-bounty/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBugBountyCampaign(id: string, data: Partial<{
    title: string
    description: string
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
    totalBudget: number
    minReward: number
    maxReward: number
    scope: any
    rules: any
    severityLevels: any
    startDate: string
    endDate: string
    isPublic: boolean
    allowTeamBounties: boolean
  }>): Promise<BugBountyCampaign> {
    return this.request(`/api/bug-bounty/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBugBountyCampaign(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/bug-bounty/campaigns/${id}`, {
      method: 'DELETE',
    })
  }

  // Bug Submission methods
  async getBugSubmissions(campaignId: string, params?: {
    page?: number
    limit?: number
    status?: string
    severity?: string
  }): Promise<{ submissions: BugSubmission[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.severity) queryParams.append('severity', params.severity)
    
    const query = queryParams.toString()
    return this.request(`/api/bug-bounty/campaigns/${campaignId}/submissions${query ? `?${query}` : ''}`)
  }

  async getBugSubmission(id: string): Promise<BugSubmission> {
    return this.request(`/api/bug-bounty/submissions/${id}`)
  }

  async createBugSubmission(campaignId: string, data: {
    title: string
    description: string
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
    evidence?: any
    stepsToReproduce?: string
    impact?: string
    suggestedFix?: string
  }): Promise<BugSubmission> {
    return this.request(`/api/bug-bounty/campaigns/${campaignId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBugSubmission(id: string, data: Partial<{
    status: 'SUBMITTED' | 'REVIEWING' | 'VERIFIED' | 'REJECTED' | 'DUPLICATE' | 'RESOLVED' | 'AWARDED'
    verificationNotes: string
    githubIssueUrl: string
    githubIssueNumber: number
    rewardAmount: number
  }>): Promise<BugSubmission> {
    return this.request(`/api/bug-bounty/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // GitHub Repository methods
  async getGitHubRepositories(): Promise<{ repositories: GitHubRepository[] }> {
    return this.request('/api/github/repositories')
  }

  async syncGitHubRepositories(): Promise<{ repositories: GitHubRepository[]; message: string }> {
    return this.request('/api/github/repositories/sync', {
      method: 'POST',
    })
  }

  // Contribution methods
  async getContributions(params?: {
    userId?: string
    repositoryId?: string
    type?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ contributions: any[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.repositoryId) queryParams.append('repositoryId', params.repositoryId)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const query = queryParams.toString()
    return this.request(`/api/contributions${query ? `?${query}` : ''}`)
  }
}

export const api = new ApiClient() 