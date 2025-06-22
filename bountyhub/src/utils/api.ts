import type { LoginForm, SignupForm, PostForm, User, Post, WalletInfo, CodeBlock, Media } from '../types'
import type { Transaction } from '../types'
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

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
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
  async getPosts(): Promise<Post[]> {
    return this.request('/api/posts')
  }

  async createPost(data: CreatePostData): Promise<{ success: boolean; data: Post }> {
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

  async getRecentTransactions(): Promise<Transaction[]> {
    return this.request('/api/wallet/transactions')
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
  async confirmDirectDeposit(amount: number, signature: string): Promise<{ success: boolean; transactionId?: string; message?: string }> {
    return this.request('/api/wallet/confirm-direct-deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, signature }),
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
}

export const api = new ApiClient() 