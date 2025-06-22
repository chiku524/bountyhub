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

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...')
      const userData = await api.getCurrentUser()
      console.log('getCurrentUser response:', userData)
      if (userData) {
        console.log('Setting user in context:', userData)
        setUser(userData)
      } else {
        console.log('No user data returned, user is not authenticated')
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
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
      console.log('Starting signup process...')
      const result = await api.signup({ email, password, username })
      console.log('Signup API response:', result)
      setUser(result.user)
      
      // Add a small delay to ensure the session cookie is set before checking auth status
      setTimeout(() => {
        console.log('Re-checking auth status after signup...')
        checkAuthStatus()
      }, 100)
      
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 