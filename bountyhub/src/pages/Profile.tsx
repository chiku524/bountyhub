import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCamera, FiShield, FiStar, FiThumbsUp } from 'react-icons/fi'
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaTiktok, FaDiscord, FaReddit, FaMedium, FaStackOverflow, FaDev } from 'react-icons/fa'
import { api } from '../utils/api'
import type { User, Post, Bookmark, ReputationHistory } from '../types'

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
  
  // Simple fallback using a basic SVG
  const firstLetter = username.charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#6366f1"/><text x="64" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${firstLetter}</text></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
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

const ProfilePictureUpload = ({ currentPicture, username, onPictureUpdate }: { currentPicture: string | null; username: string; onPictureUpdate: (newPicture: string) => void }) => {
  const [preview, setPreview] = useState<string | null>(currentPicture)
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const getFallbackImage = () => {
    const firstLetter = username.charAt(0).toUpperCase()
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#6366f1"/><text x="64" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${firstLetter}</text></svg>`)}`
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPreview(result.profilePicture || null)
        // Update the parent component's user state
        onPictureUpdate(result.profilePicture || null)
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
          src={imageError ? getFallbackImage() : (preview || getProfilePicture(currentPicture, username))}
          alt={`${username}'s profile`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => document.getElementById('profile-picture-input')?.click()}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
            disabled={isUploading}
          >
            <FiCamera className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      <input
        id="profile-picture-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}

const IntegrityDisplay = ({ user }: { user: { id: string; username: string; integrityScore: number | undefined; totalRatings: number | undefined } }) => {
  const integrityScore = user.integrityScore ?? 5.0 // Default to 5.0 if undefined
  const totalRatings = user.totalRatings ?? 0 // Default to 0 if undefined
  
  const integrityLevel = getIntegrityLevel(integrityScore)
  const integrityColor = getIntegrityColor(integrityScore)

  return (
    <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FiShield className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-violet-300">Integrity Score</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Score Display */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${integrityColor}`}>
            {integrityScore.toFixed(1)}
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
                  star <= integrityScore
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-400'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-400">
            {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Integrity Level Badge */}
      <div className="mt-3 flex justify-center">
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntegrityBadgeStyle(integrityScore)}`}>
          {integrityLevel} Integrity
        </div>
      </div>

      {/* Quick Stats */}
      {totalRatings > 0 && (
        <div className="mt-4 pt-3 border-t border-violet-500/20">
          <div className="text-xs text-gray-400 text-center">
            Based on {totalRatings} community rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}

function getIntegrityLevel(score: number): string {
  if (score >= 9.0) return 'Exceptional'
  if (score >= 8.0) return 'Excellent'
  if (score >= 7.0) return 'Good'
  if (score >= 6.0) return 'Fair'
  if (score >= 5.0) return 'Average'
  if (score >= 4.0) return 'Below Average'
  if (score >= 3.0) return 'Poor'
  if (score >= 2.0) return 'Very Poor'
  return 'Unacceptable'
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

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [reputationHistory, setReputationHistory] = useState<ReputationHistory[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set limits for each section
  const RECENT_ACTIVITY_LIMIT = 7;
  const RECENT_POSTS_LIMIT = 5;
  const BOOKMARKS_LIMIT = 4;

  useEffect(() => {
    loadProfileData()
  }, [])

  // Refresh data when page becomes visible (e.g., after performing actions)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProfileData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [userData, postsData] = await Promise.all([
        api.getProfile(),
        api.getPosts() // This will get all posts, we'll filter for user's posts
      ])
      
      setUser(userData)
      
      // Filter posts for current user (in a real app, you'd have a specific endpoint)
      const userPosts = postsData.filter(post => post.authorId === userData.id)
      setPosts(userPosts)
      
      // Use real bookmarks data from API
      setBookmarks(userData.bookmarks || [])
      
      // Use real reputation history from API
      setReputationHistory(userData.reputationHistory || [])
      
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

  const reputationLevel = getReputationLevel(user.reputationPoints || 0)
  const recentActivities = reputationHistory.slice(0, RECENT_ACTIVITY_LIMIT)
  const limitedPosts = posts.slice(0, RECENT_POSTS_LIMIT)
  const limitedBookmarks = bookmarks.slice(0, BOOKMARKS_LIMIT)

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <Link 
            to="/posts/create" 
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Post
          </Link>
        </div>

        <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <div className="flex items-start space-x-6">
            <ProfilePictureUpload 
              currentPicture={user.profilePicture || null}
              username={user.username}
              onPictureUpdate={(newPicture) => {
                setUser({
                  ...user,
                  profilePicture: newPicture
                })
              }}
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
                integrityScore: user.integrityScore,
                totalRatings: user.totalRatings,
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {recentActivities.map((history) => (
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
                ))}
                {reputationHistory.length > RECENT_ACTIVITY_LIMIT && (
                  <div className="mt-3 text-center">
                    <Link to="/profile/activity" className="inline-block px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md">
                      See All Activity
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Posts</h2>
              <div className="space-y-2">
                {limitedPosts.map((post) => (
                  <div key={post.id} className="p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                    <Link to={`/posts/${post.id}`} className="block hover:bg-neutral-600/50 rounded-lg p-1.5 -m-1.5 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-violet-500/20 rounded-lg">
                          <FiThumbsUp className="w-3.5 h-3.5 text-violet-300" />
                        </div>
                        <h3 className="text-sm font-medium text-violet-300">{post.title}</h3>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-2">{truncateContent(post.content)}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <span className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                          Read more →
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
                {posts.length > RECENT_POSTS_LIMIT && (
                  <div className="mt-3 text-center">
                    <Link to="/profile/posts" className="inline-block px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md">
                      See All Posts
                    </Link>
                  </div>
                )}
                {posts.length === 0 && (
                  <div className="p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                    <p className="text-sm text-gray-300">No posts yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Bookmarked Posts</h2>
            {limitedBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {limitedBookmarks.map((bookmark) => (
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
            {bookmarks.length > BOOKMARKS_LIMIT && (
              <div className="mt-3 text-center">
                <Link to="/profile/bookmarks" className="inline-block px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors border border-yellow-400/50 shadow-md">
                  See All Bookmarks
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 