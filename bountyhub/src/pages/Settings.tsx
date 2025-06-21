import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import type { User } from '../types'
import { FiUser, FiLink, FiMail, FiLock, FiSave, FiCheck } from 'react-icons/fi'

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
}

export default function Settings() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'account' | 'security'>('profile')
  
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
    devto: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

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
          devto: userData.profile.devto || ''
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
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      await api.updateProfile({
        ...user,
        profile: profileData
      })
      
      setSuccess('Changes saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
          <div className="card bg-neutral-800 border-neutral-700 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              <span className="ml-3 text-gray-300">Loading settings...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'social', label: 'Social Links', icon: FiLink },
    { id: 'account', label: 'Account', icon: FiMail },
    { id: 'security', label: 'Security', icon: FiLock },
  ]

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* Success Notice */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
            <FiCheck className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
            <span>{error}</span>
          </div>
        )}

        <div className="bg-neutral-800/80 rounded-lg border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {/* Tabs */}
          <div className="flex border-b border-violet-500/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-b-2 border-violet-400'
                    : 'text-gray-400 hover:text-violet-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-violet-300 mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-violet-300 mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-violet-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-violet-300 mb-2">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-violet-300 mb-2">
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://your-website.com"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-violet-300 mb-2">
                      Facebook
                    </label>
                    <input
                      id="facebook"
                      type="text"
                      value={profileData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      placeholder="facebook.com/username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-violet-300 mb-2">
                      Twitter
                    </label>
                    <input
                      id="twitter"
                      type="text"
                      value={profileData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-violet-300 mb-2">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      type="text"
                      value={profileData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-violet-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      type="text"
                      value={profileData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-violet-300 mb-2">
                      GitHub
                    </label>
                    <input
                      id="github"
                      type="text"
                      value={profileData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="github.com/username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-violet-300 mb-2">
                      YouTube
                    </label>
                    <input
                      id="youtube"
                      type="text"
                      value={profileData.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                      placeholder="youtube.com/@username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="tiktok" className="block text-sm font-medium text-violet-300 mb-2">
                      TikTok
                    </label>
                    <input
                      id="tiktok"
                      type="text"
                      value={profileData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="discord" className="block text-sm font-medium text-violet-300 mb-2">
                      Discord
                    </label>
                    <input
                      id="discord"
                      type="text"
                      value={profileData.discord}
                      onChange={(e) => handleInputChange('discord', e.target.value)}
                      placeholder="username#0000"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="reddit" className="block text-sm font-medium text-violet-300 mb-2">
                      Reddit
                    </label>
                    <input
                      id="reddit"
                      type="text"
                      value={profileData.reddit}
                      onChange={(e) => handleInputChange('reddit', e.target.value)}
                      placeholder="u/username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="medium" className="block text-sm font-medium text-violet-300 mb-2">
                      Medium
                    </label>
                    <input
                      id="medium"
                      type="text"
                      value={profileData.medium}
                      onChange={(e) => handleInputChange('medium', e.target.value)}
                      placeholder="medium.com/@username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="stackoverflow" className="block text-sm font-medium text-violet-300 mb-2">
                      Stack Overflow
                    </label>
                    <input
                      id="stackoverflow"
                      type="text"
                      value={profileData.stackoverflow}
                      onChange={(e) => handleInputChange('stackoverflow', e.target.value)}
                      placeholder="stackoverflow.com/users/username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="devto" className="block text-sm font-medium text-violet-300 mb-2">
                      Dev.to
                    </label>
                    <input
                      id="devto"
                      type="text"
                      value={profileData.devto}
                      onChange={(e) => handleInputChange('devto', e.target.value)}
                      placeholder="dev.to/username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-violet-300 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      placeholder="Your email address"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-violet-300 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={user?.username || ''}
                      disabled
                      placeholder="Your username"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-violet-300 mb-2">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-violet-300 mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-violet-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-violet-500/30">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 