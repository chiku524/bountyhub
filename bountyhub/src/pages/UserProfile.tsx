import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { config } from '../utils/config'
import type { User, Post } from '../types'
import { FiThumbsUp, FiEdit2, FiCamera, FiStar, FiShield } from 'react-icons/fi'
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaTiktok, FaDiscord, FaReddit, FaMedium, FaStackOverflow, FaDev } from 'react-icons/fa'
import IntegrityRatingModal from '../components/IntegrityRatingModal'

const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed='

interface ReputationHistory {
  id: string
  points: number
  action: string
  createdAt: string
}

interface ProfileData {
  firstName: string | null
  lastName: string | null
  bio: string | null
  location: string | null
  website: string | null
  github: string | null
  twitter: string | null
  linkedin: string | null
  instagram: string | null
  facebook: string | null
  youtube: string | null
  tiktok: string | null
  discord: string | null
  reddit: string | null
  medium: string | null
  stackoverflow: string | null
  devto: string | null
}

function getReputationLevel(points: number): string {
  if (points >= 10000) return 'Legend'
  if (points >= 5000) return 'Expert'
  if (points >= 1000) return 'Veteran'
  if (points >= 500) return 'Regular'
  if (points >= 100) return 'Contributor'
  if (points >= 50) return 'Member'
  return 'Newbie'
}

function getProfilePicture(profilePicture: string | null, username: string): string {
  if (profilePicture) {
    return profilePicture
  }
  return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`
}

function truncateContent(content: string | undefined | null): string {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

function getActivityDescription(action: string): string {
  const descriptions: { [key: string]: string } = {
    'POST_CREATED': 'Created a new post',
    'POST_UPVOTED': 'Received an upvote on your post',
    'POST_DOWNVOTED': 'Received a downvote on your post',
    'COMMENT_CREATED': 'Added a comment',
    'COMMENT_UPVOTED': 'Received an upvote on your comment',
    'COMMENT_DOWNVOTED': 'Received a downvote on your comment',
    'ANSWER_CREATED': 'Provided an answer',
    'ANSWER_UPVOTED': 'Received an upvote on your answer',
    'ANSWER_DOWNVOTED': 'Received a downvote on your answer',
    'ANSWER_ACCEPTED': 'Your answer was accepted as the best solution',
    'PROFILE_COMPLETED': 'Completed your profile information',
    'DAILY_LOGIN': 'Logged in for the day',
    'WEEKLY_STREAK': 'Maintained a weekly activity streak',
    'MONTHLY_CONTRIBUTOR': 'Active contributor this month',
    'HELPFUL_MEMBER': 'Recognized as a helpful community member',
    'FIRST_POST': 'Created your first post',
    'FIRST_ANSWER': 'Provided your first answer',
    'FIRST_COMMENT': 'Added your first comment',
    'REPUTATION_MILESTONE': 'Reached a reputation milestone',
    'COMMUNITY_ENGAGEMENT': 'Active participation in the community',
    'CREATE_POST': 'Created a new post'
  }
  
  return descriptions[action] || action
}

const SocialMediaIcons = ({ profile }: { profile: ProfileData }) => {
  const socialLinks = [
    { icon: FaGithub, url: profile.github, label: 'GitHub', color: 'hover:text-[#333]' },
    { icon: FaTwitter, url: profile.twitter, label: 'Twitter', color: 'hover:text-[#1DA1F2]' },
    { icon: FaLinkedin, url: profile.linkedin, label: 'LinkedIn', color: 'hover:text-[#0077B5]' },
    { icon: FaInstagram, url: profile.instagram, label: 'Instagram', color: 'hover:text-[#E4405F]' },
    { icon: FaFacebook, url: profile.facebook, label: 'Facebook', color: 'hover:text-[#1877F2]' },
    { icon: FaYoutube, url: profile.youtube, label: 'YouTube', color: 'hover:text-[#FF0000]' },
    { icon: FaTiktok, url: profile.tiktok, label: 'TikTok', color: 'hover:text-[#000000]' },
    { icon: FaDiscord, url: profile.discord, label: 'Discord', color: 'hover:text-[#5865F2]' },
    { icon: FaReddit, url: profile.reddit, label: 'Reddit', color: 'hover:text-[#FF4500]' },
    { icon: FaMedium, url: profile.medium, label: 'Medium', color: 'hover:text-[#000000]' },
    { icon: FaStackOverflow, url: profile.stackoverflow, label: 'Stack Overflow', color: 'hover:text-[#F48024]' },
    { icon: FaDev, url: profile.devto, label: 'Dev.to', color: 'hover:text-[#0A0A0A]' }
  ].filter(link => link.url)

  if (socialLinks.length === 0) return null

  return (
    <div className="flex flex-wrap gap-4">
      {socialLinks.map(({ icon: Icon, url, label, color }) => (
        <a
          key={label}
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-400 ${color} transition-colors p-2 rounded-lg hover:bg-white/10`}
          title={label}
        >
          <Icon className="w-6 h-6" />
        </a>
      ))}
    </div>
  )
}

const ProfilePictureUpload = ({ currentPicture, username, isOwnProfile }: { currentPicture: string | null; username: string; isOwnProfile: boolean }) => {
  const [preview, setPreview] = useState<string | null>(currentPicture)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile) return
    
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    const formData = new FormData()
    formData.append('profilePicture', file)

    try {
      const response = await fetch(`${config.api.baseUrl}/api/profile/picture`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPreview(result.profilePicture || null)
        window.location.reload()
      } else {
        alert(result.error || 'Failed to upload profile picture')
        setPreview(currentPicture)
      }
    } catch (error) {
      alert('Failed to upload profile picture')
      setPreview(currentPicture)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative group">
      <div className="relative w-32 h-32 rounded-full overflow-hidden">
        <img
          src={preview || getProfilePicture(currentPicture, username)}
          alt={`${username}'s profile`}
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => document.getElementById('profile-picture-input')?.click()}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
              disabled={isUploading}
            >
              <FiCamera className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>
      {isOwnProfile && (
        <input
          id="profile-picture-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  )
}

const IntegrityDisplay = ({ 
  user, 
  currentUserId, 
  canRate = false 
}: { 
  user: { id: string; username: string; integrityScore: number; totalRatings: number }
  currentUserId?: string
  canRate?: boolean
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false)
  
  const integrityLevel = getIntegrityLevel(user.integrityScore)
  const integrityColor = getIntegrityColor(user.integrityScore)
  const badgeStyle = getIntegrityBadgeStyle(user.integrityScore)

  return (
    <>
      <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <FiShield className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-300">Integrity Score</h3>
              <p className="text-sm text-gray-400">Based on {user.totalRatings} community ratings</p>
            </div>
          </div>
          {canRate && currentUserId !== user.id && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            >
              Rate User
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${integrityColor}`}>
              {user.integrityScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">out of 10</div>
            <div className={`text-sm font-medium ${integrityColor} mt-1`}>
              {integrityLevel}
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${
                    star <= user.integrityScore
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">
              {user.totalRatings} rating{user.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Integrity Level Badge */}
        <div className="mt-3 flex justify-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeStyle}`}>
            {integrityLevel} Integrity
          </div>
        </div>

        {/* Quick Stats */}
        {user.totalRatings > 0 && (
          <div className="mt-4 pt-3 border-t border-violet-500/20">
            <div className="text-xs text-gray-400 text-center">
              Based on {user.totalRatings} community rating{user.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <IntegrityRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        targetUser={user}
      />
    </>
  )
}

function getIntegrityLevel(score: number): string {
  if (score >= 9.0) return 'Exceptional'
  if (score >= 8.0) return 'Excellent'
  if (score >= 7.0) return 'Very Good'
  if (score >= 6.0) return 'Good'
  if (score >= 4.0) return 'Fair'
  return 'Poor'
}

function getIntegrityColor(score: number): string {
  if (score >= 8.0) return 'text-green-400'
  if (score >= 6.0) return 'text-yellow-400'
  if (score >= 4.0) return 'text-orange-400'
  return 'text-red-400'
}

function getIntegrityBadgeStyle(score: number): string {
  if (score >= 8.0) {
    return 'bg-green-500/20 text-green-400 border-green-500/50'
  }
  if (score >= 6.0) {
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
  }
  if (score >= 4.0) {
    return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
  }
  return 'bg-red-500/20 text-red-400 border-red-500/50'
}

export default function UserProfile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [reputationHistory, setReputationHistory] = useState<ReputationHistory[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    loadProfileData()
  }, [username])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch user profile
      const response = await fetch(`${config.api.baseUrl}/api/users/${username}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user profile')
      }
      
      const userData = await response.json()
      setUser(userData)
      
      // Use real posts data from API
      setPosts(userData.posts || [])
      
      // Use real reputation history data from API
      setReputationHistory(userData.reputationHistory || [])
      
      // Use real bookmarks data from API
      setBookmarks(userData.bookmarks || [])
      
    } catch (err: any) {
      console.error('Profile error:', err)
      setError(err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              <span className="ml-3 text-gray-300">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="flex flex-col justify-center items-center w-full h-full">
              <h1 className="text-white text-2xl">User not found</h1>
              <Link to="/community" className="mt-4 text-violet-400 hover:text-violet-300">Go to Community</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === user.id
  const reputationLevel = getReputationLevel(user.reputationPoints || 0)
  const recentActivities = reputationHistory.slice(0, 5)

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-2xl font-bold text-white">
            {isOwnProfile ? 'Your Profile' : `${user.username}'s Profile`}
          </h1>
          {isOwnProfile && (
            <Link 
              to="/posts/create" 
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Post
            </Link>
          )}
        </div>

        <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <div className="flex items-start space-x-6">
            <ProfilePictureUpload 
              currentPicture={user.profilePicture || null}
              username={user.username}
              isOwnProfile={isOwnProfile}
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">{user.username}</h2>
              <p className="text-gray-400 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50">
                    <span className="text-violet-300 font-medium">{reputationLevel}</span>
                  </div>
                  <div className="bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50">
                    <span className="text-violet-300 font-medium">{user.reputationPoints || 0} points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-violet-300 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                <label htmlFor="bio" className="block text-sm font-medium text-violet-300">Bio</label>
                <p id="bio" className="mt-1 text-sm text-gray-300">{user.profile?.bio || 'No bio provided'}</p>
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                <label htmlFor="location" className="block text-sm font-medium text-violet-300">Location</label>
                <p id="location" className="mt-1 text-sm text-gray-300">{user.profile?.location || 'No location provided'}</p>
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                <label htmlFor="website" className="block text-sm font-medium text-violet-300">Website</label>
                <p id="website" className="mt-1 text-sm text-gray-300">
                  {user.profile?.website ? (
                    <a href={user.profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-violet-400 hover:text-violet-300">
                      {user.profile.website}
                    </a>
                  ) : 'No website provided'}
                </p>
              </div>
              <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                <label htmlFor="socialMedia" className="block text-sm font-medium text-violet-300">Social Media</label>
                <div id="socialMedia" className="mt-2">
                  {user.profile ? (
                    <SocialMediaIcons profile={user.profile} />
                  ) : (
                    <p className="text-sm text-gray-300">No social media links provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Integrity Display */}
          <div className="mt-8">
            <IntegrityDisplay
              user={{
                id: user.id,
                username: user.username,
                integrityScore: user.integrityScore || 8.5,
                totalRatings: user.totalRatings || 12,
              }}
              currentUserId={currentUser?.id}
              canRate={!!currentUser && currentUser.id !== user.id}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((history) => (
                    <div key={history.id} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-violet-500/20 rounded-lg">
                          <FiThumbsUp className="w-3.5 h-3.5 text-violet-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-violet-300">{getActivityDescription(history.action)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${history.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {history.points > 0 ? '+' : ''}{history.points}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
                {reputationHistory.length > 5 && (
                  <div className="mt-3 text-center">
                    <Link to="/profile/activity" className="inline-block px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md">
                      View All Activity
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Posts</h2>
              <div className="space-y-2">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                      <Link to={`/posts/${post.id}`} className="block hover:bg-neutral-600/50 rounded-lg p-1.5 -m-1.5 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 bg-violet-500/20 rounded-lg">
                            <FiEdit2 className="w-3.5 h-3.5 text-violet-300" />
                          </div>
                          <h3 className="text-sm font-medium text-violet-300">{post.title}</h3>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">{truncateContent(post.content)}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-400">
                              +{post.qualityUpvotes || 0}
                            </span>
                            <span className="text-xs text-red-400">
                              -{post.qualityDownvotes || 0}
                            </span>
                            <span className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                              Read more →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                    <p className="text-sm text-gray-300">No posts yet</p>
                  </div>
                )}
                {posts.length > 5 && (
                  <div className="mt-3 text-center">
                    <Link to={`/users/${username}/posts`} className="inline-block px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md">
                      View All Posts
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Bookmarked Posts</h2>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="bg-neutral-800/80 rounded-lg p-4 border border-yellow-400/40 transition-all duration-300 hover:bg-neutral-700/80 hover:border-yellow-300/60 hover:shadow-lg hover:shadow-yellow-400/20 hover:scale-[1.02] group">
                    <Link to={`/posts/${bookmark.post.id}`} className="block">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                        {bookmark.post.title}
                      </h3>
                      <p className="text-gray-300 mb-2 truncate group-hover:text-gray-200 transition-colors duration-300">
                        {bookmark.post.content.length > 100 ? bookmark.post.content.substring(0, 100) + '...' : bookmark.post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(bookmark.post.createdAt).toLocaleDateString()}</span>
                        <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                          Read post →
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-neutral-800/80 rounded-lg p-6 border border-yellow-400/40 text-center">
                <p className="text-gray-400">No bookmarked posts yet</p>
                <p className="text-sm text-gray-500 mt-1">Bookmark posts from the community to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 