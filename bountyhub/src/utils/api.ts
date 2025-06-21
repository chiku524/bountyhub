import type { LoginForm, SignupForm, PostForm, User, Post, WalletInfo } from '../types'

const API_BASE = '/api'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
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

  // Authentication
  async login(data: LoginForm): Promise<{ user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async signup(data: SignupForm): Promise<{ user: User }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request('/auth/me')
    } catch {
      return null
    }
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return this.request('/posts')
  }

  async createPost(data: PostForm): Promise<Post> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPost(id: string): Promise<Post> {
    return this.request(`/posts/${id}`)
  }

  async updatePost(id: string, data: Partial<PostForm>): Promise<Post> {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Wallet
  async getWalletInfo(): Promise<WalletInfo> {
    return this.request('/wallet')
  }

  async performWalletAction(action: string, amount: number): Promise<{ success: boolean }> {
    return this.request('/wallet', {
      method: 'POST',
      body: JSON.stringify({ action, amount }),
    })
  }

  // Profile
  async getProfile(): Promise<User> {
    return this.request('/profile')
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // User profiles
  async getUserProfile(username: string): Promise<User> {
    return this.request(`/users/${username}`)
  }

  async getUserPosts(username: string): Promise<Post[]> {
    return this.request(`/users/${username}/posts`)
  }
}

export const api = new ApiClient() 