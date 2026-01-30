import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../utils/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  /** Refetch current user from API (e.g. after connecting GitHub). */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Check for OAuth success parameter and refresh after auth loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('oauth_success') === 'true' && !loading && user) {
      // Remove the query parameter and update URL without reload
      urlParams.delete('oauth_success')
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
      window.history.replaceState({}, '', newUrl)
    }
  }, [loading, user])

  const checkAuthStatus = async () => {
    try {
      const userData = await api.getCurrentUser()
      if (userData) {
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (_error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await api.login({ email, password })
      setUser(result.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  const signup = async (email: string, password: string, username: string) => {
    try {
      const result = await api.signup({ email, password, username })
      setUser(result.user)
      
      // Add a small delay to ensure the session cookie is set before checking auth status
      setTimeout(() => {
        checkAuthStatus()
      }, 100)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Signup failed' }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser()
      setUser(userData ?? null)
    } catch {
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 