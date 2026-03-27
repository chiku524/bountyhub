import { useEffect, useState, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import { config } from '../utils/config'
import { useAuth } from '../contexts/AuthProvider'
import { useToast } from '../contexts/ToastContext'
import type { User } from '../types'
import { FiUser, FiLink, FiMail, FiLock, FiSave, FiCheck, FiMonitor } from 'react-icons/fi'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { isDesktopApp } from '../utils/desktop'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'

type SettingsTab = 'profile' | 'social' | 'account' | 'security' | 'desktop'

interface ProfileData {
  firstName: string
  lastName: string
  bio: string
  location: string
  website: string
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  github: string
  youtube: string
  tiktok: string
  discord: string
  reddit: string
  medium: string
  stackoverflow: string
  devto: string
  profilePicture: string | null
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Settings() {
  const { user: authUser, loading: authLoading, refreshUser } = useAuth()
  const toast = useToast()
  const desktopUpdate = useDesktopUpdate()
  const isDesktop = isDesktopApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [nativeAppVersion, setNativeAppVersion] = useState('')
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    github: '',
    youtube: '',
    tiktok: '',
    discord: '',
    reddit: '',
    medium: '',
    stackoverflow: '',
    devto: '',
    profilePicture: null
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [githubConnected, setGithubConnected] = useState(false)
  const [githubUsername, setGithubUsername] = useState<string | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const githubStatusFetchedRef = useRef(false)

  // Sync active tab with URL so /settings?tab=account opens Account tab
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const allowed: SettingsTab[] = isDesktopApp()
      ? ['profile', 'social', 'account', 'security', 'desktop']
      : ['profile', 'social', 'account', 'security']
    if (tabParam && allowed.includes(tabParam as SettingsTab)) {
      setActiveTab(tabParam as SettingsTab)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isDesktop || activeTab !== 'desktop') return
    let cancelled = false
    import('@tauri-apps/api/core')
      .then(({ invoke }) => invoke<string>('get_app_version'))
      .then((v) => {
        if (!cancelled) setNativeAppVersion(v)
      })
      .catch(() => {
        if (!cancelled) setNativeAppVersion('')
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, isDesktop])

  // Derive GitHub state from auth user; if me didn't return githubUsername (e.g. old API), fetch profile once
  useEffect(() => {
    if (authUser) {
      setGithubConnected(!!authUser.githubUsername)
      setGithubUsername(authUser.githubUsername ?? null)
      // Fallback: when /api/auth/me doesn't include githubUsername yet, fetch profile once so UI shows connected
      if (!authUser.githubUsername && !githubStatusFetchedRef.current) {
        githubStatusFetchedRef.current = true
        loadGitHubStatus()
      }
    } else {
      githubStatusFetchedRef.current = false
      if (!authLoading) {
        setLoading(false)
      }
    }
  }, [authUser, authLoading])

  useEffect(() => {
    if (!authUser) return
    loadUserData()

    const githubConnectedParam = searchParams.get('github_connected')
    const githubError = searchParams.get('error')

    if (githubConnectedParam === 'true') {
      setSuccess('GitHub account connected successfully')
      toast.success('GitHub account connected successfully')
      setTimeout(() => setSuccess(null), 5000)
      refreshUser().then(() => loadGitHubStatus())
      searchParams.delete('github_connected')
      setSearchParams(searchParams, { replace: true })
    }

    if (githubError) {
      let errorMessage = 'Failed to connect GitHub account'
      if (githubError === 'github_already_connected') {
        errorMessage = 'This GitHub account is already connected to another user'
      } else if (githubError === 'user_not_found') {
        errorMessage = 'User not found. Please try again.'
      } else if (githubError === 'connect_failed') {
        errorMessage = 'Connection failed. Please try connecting again.'
      }
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
      searchParams.delete('error')
      setSearchParams(searchParams, { replace: true })
    }
  }, [authUser, searchParams, setSearchParams])

  const loadGitHubStatus = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/auth/github/profile`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setGithubConnected(true)
        setGithubUsername(data.githubUsername ?? null)
      } else if (response.status === 404) {
        // Only set disconnected on definitive "not connected"; avoid overwriting on 5xx/network
        setGithubConnected(false)
        setGithubUsername(null)
      }
    } catch (_error) {
      // On network error, keep existing state from auth user so nav from landing doesn't flash disconnected
      if (!authUser?.githubUsername) {
        setGithubConnected(false)
        setGithubUsername(null)
      }
    }
  }

  const handleGitHubConnect = async () => {
    try {
      setGithubLoading(true)
      setError(null)
      const response = await fetch(`${config.api.baseUrl}/api/auth/github/connect`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json().catch(() => ({}))
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError(data?.error || data?.details || `Failed to connect GitHub account (${response.status})`)
      }
    } catch (_error) {
      setError('Failed to connect GitHub account')
    } finally {
      setGithubLoading(false)
    }
  }

  const handleGitHubDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account? You will need to set a password if you don\'t have one.')) {
      return
    }
    
    try {
      setGithubLoading(true)
      setError(null)
      const response = await fetch(`${config.api.baseUrl}/api/auth/github/disconnect`, {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle error response
        if (data.requiresPassword) {
          setError(`${data.error} Please go to the Security tab to set a password first.`)
          // Optionally switch to security tab
          setActiveTab('security')
        } else {
          setError(data.error || data.details || 'Failed to disconnect GitHub account')
        }
        return
      }
      
      if (data.success) {
        setGithubConnected(false)
        setGithubUsername(null)
        setSuccess('GitHub account disconnected successfully')
        toast.success('GitHub account disconnected successfully')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to disconnect GitHub account')
      }
    } catch (error: any) {
      console.error('Disconnect error:', error)
      setError(error?.message || 'Failed to disconnect GitHub account')
    } finally {
      setGithubLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await api.getProfile()
      setUser(userData)
      
      // Load profile data if available
      if (userData.profile) {
        setProfileData({
          firstName: userData.profile.firstName || '',
          lastName: userData.profile.lastName || '',
          bio: userData.profile.bio || '',
          location: userData.profile.location || '',
          website: userData.profile.website || '',
          facebook: userData.profile.facebook || '',
          twitter: userData.profile.twitter || '',
          instagram: userData.profile.instagram || '',
          linkedin: userData.profile.linkedin || '',
          github: userData.profile.github || '',
          youtube: userData.profile.youtube || '',
          tiktok: userData.profile.tiktok || '',
          discord: userData.profile.discord || '',
          reddit: userData.profile.reddit || '',
          medium: userData.profile.medium || '',
          stackoverflow: userData.profile.stackoverflow || '',
          devto: userData.profile.devto || '',
          profilePicture: userData.profile.profilePicture || null
        })
      }
    } catch (err: any) {
      console.error('Settings error:', err)
      setError(err.message || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === 'desktop') {
      return
    }

    // If we're on the security tab, handle password change
    if (activeTab === 'security') {
      await handlePasswordChange()
      return
    }
    
    // Otherwise handle profile update
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      await api.updateProfile({
        ...user,
        profile: profileData
      })
      
      setSuccess('Profile changes saved successfully!')
      toast.success('Profile changes saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validate password fields
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('All password fields are required')
        return
      }

      if (passwordData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long')
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New password and confirm password do not match')
        return
      }

      // Call API to change password
      const result = await api.changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.success) {
        setSuccess('Password changed successfully!')
        toast.success('Password changed successfully!')
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.message || 'Failed to change password')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordInputChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const tabs = useMemo(() => {
    const base: { id: SettingsTab; label: string; icon: typeof FiUser }[] = [
      { id: 'profile', label: 'Profile', icon: FiUser },
      { id: 'social', label: 'Social Links', icon: FiLink },
      { id: 'account', label: 'Account', icon: FiMail },
      { id: 'security', label: 'Security', icon: FiLock },
    ]
    if (isDesktop) {
      base.push({ id: 'desktop', label: 'Desktop app', icon: FiMonitor })
    }
    return base
  }, [isDesktop])

  const selectTab = (tabId: SettingsTab) => {
    setActiveTab(tabId)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', tabId)
        return next
      },
      { replace: true },
    )
  }

  const handleDesktopCheckUpdates = () => {
    desktopUpdate?.setPhase('checking')
    desktopUpdate?.retryUpdate()
  }

  const releasesUrl = import.meta.env.VITE_GITHUB_RELEASES_URL ?? 'https://github.com/chiku524/bountyhub/releases/latest'

  if (loading) {
    return (
      <PageContainer maxWidth="narrow">
        <PageHeader title="Settings" />
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading settings...</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="narrow">
      <PageHeader title="Settings" description="Manage your profile, account, and security" />

        {/* Success Notice */}
        {success && (
          <div className="mb-6 p-3 sm:p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm sm:text-base">
            <FiCheck className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm sm:text-base">
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/80 dark:bg-neutral-800/80 rounded-lg border-2 border-violet-500/50 dark:border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-violet-500/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                    : 'text-neutral-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
              {activeTab === 'profile' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 sm:gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Last Name
                    </label>
                      <input
                        id="lastName"
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                        Bio
                      </label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                      <label htmlFor="location" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                        Location
                      </label>
                    <input
                      id="location"
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                      <label htmlFor="website" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                        Website
                      </label>
                    <input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://your-website.com"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Facebook
                    </label>
                    <input
                      id="facebook"
                      type="text"
                      value={profileData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      placeholder="facebook.com/username"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Twitter
                    </label>
                    <input
                      id="twitter"
                      type="text"
                      value={profileData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      type="text"
                      value={profileData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@username"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      type="text"
                      value={profileData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      GitHub
                    </label>
                    {githubConnected && (
                      <div className="mb-2 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-green-700 dark:text-green-300">
                          Account connected{githubUsername ? ` (@${githubUsername})` : ''} - You can sync repositories from the Repositories page
                        </span>
                      </div>
                    )}
                    <input
                      id="github"
                      type="text"
                      value={profileData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="github.com/username"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs text-neutral-500 dark:text-gray-400">
                      This is your public GitHub profile URL. To connect your account for repository syncing, use the GitHub Integration section in the Account tab.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      YouTube
                    </label>
                    <input
                      id="youtube"
                      type="text"
                      value={profileData.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                      placeholder="youtube.com/@username"
                      className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="tiktok" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      TikTok
                    </label>
                    <input
                      id="tiktok"
                      type="text"
                      value={profileData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="discord" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Discord
                    </label>
                    <input
                      id="discord"
                      type="text"
                      value={profileData.discord}
                      onChange={(e) => handleInputChange('discord', e.target.value)}
                      placeholder="username#0000"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="reddit" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Reddit
                    </label>
                    <input
                      id="reddit"
                      type="text"
                      value={profileData.reddit}
                      onChange={(e) => handleInputChange('reddit', e.target.value)}
                      placeholder="u/username"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="medium" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Medium
                    </label>
                    <input
                      id="medium"
                      type="text"
                      value={profileData.medium}
                      onChange={(e) => handleInputChange('medium', e.target.value)}
                      placeholder="medium.com/@username"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="stackoverflow" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Stack Overflow
                    </label>
                    <input
                      id="stackoverflow"
                      type="text"
                      value={profileData.stackoverflow}
                      onChange={(e) => handleInputChange('stackoverflow', e.target.value)}
                      placeholder="stackoverflow.com/users/username"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="devto" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Dev.to
                    </label>
                    <input
                      id="devto"
                      type="text"
                      value={profileData.devto}
                      onChange={(e) => handleInputChange('devto', e.target.value)}
                      placeholder="dev.to/username"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      placeholder="Your email address"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={user?.username || ''}
                      disabled
                      placeholder="Your username"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* GitHub Integration */}
                  <div className="pt-6 border-t border-neutral-200 dark:border-violet-500/30">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">GitHub Integration</h3>
                    {githubConnected ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              Connected to GitHub
                            </p>
                            {githubUsername && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                @{githubUsername}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleGitHubDisconnect}
                            disabled={githubLoading}
                            className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          >
                            {githubLoading ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-neutral-600 dark:text-gray-400">
                          Connect your GitHub account to enable features like bug bounty campaigns, repository integration, and contribution tracking.
                        </p>
                        <button
                          type="button"
                          onClick={handleGitHubConnect}
                          disabled={githubLoading}
                          className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                          </svg>
                          <span>{githubLoading ? 'Connecting...' : 'Connect GitHub Account'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'desktop' && isDesktop && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    The desktop app checks for updates periodically while it is open. You can also check manually from the
                    tray menu, the menu bar, or here.
                  </p>
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="font-medium text-violet-600 dark:text-violet-300">Native app version</dt>
                      <dd className="mt-1 text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {nativeAppVersion || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-violet-600 dark:text-violet-300">Bundled UI build</dt>
                      <dd className="mt-1 text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {import.meta.env.VITE_APP_VERSION || import.meta.env.MODE}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleDesktopCheckUpdates}
                      className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      Check for updates
                    </button>
                    <a
                      href={releasesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-violet-500/40 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/15"
                    >
                      Release notes
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-violet-600 dark:text-violet-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/30 rounded-lg text-neutral-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>
              )}

              {activeTab !== 'desktop' && (
                <div className="flex justify-end pt-6 border-t border-violet-500/30">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-5 h-5" />
                    {saving
                      ? 'Saving...'
                      : activeTab === 'security'
                        ? 'Change Password'
                        : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
    </PageContainer>
  )
} 