import type { LoginForm, SignupForm, PostForm, User, Post, WalletInfo, CodeBlock, Media } from '../types'
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

  async deletePost(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Wallet
  async getWalletInfo(): Promise<WalletInfo> {
    return this.request('/api/wallet')
  }

  async performWalletAction(action: string, amount: number): Promise<{ success: boolean }> {
    return this.request('/api/wallet', {
      method: 'POST',
      body: JSON.stringify({ action, amount }),
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
}

export const api = new ApiClient() 