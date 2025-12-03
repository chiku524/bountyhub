import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { config } from '../utils/config'
import type { Post } from '../types'
import { FiEdit2, FiArrowLeft } from 'react-icons/fi'
import { LoadingSpinner } from '../components/LoadingSpinner'

function truncateContent(content: string | undefined | null): string {
  if (!content) return ''
  return content.length > 150 ? content.substring(0, 150) + '...' : content
}

export default function UserPosts() {
  const { username } = useParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    loadUserPosts()
  }, [username])

  const loadUserPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch user profile with posts
      const response = await fetch(`${config.api.baseUrl}/api/users/${username}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user posts')
      }
      
      const userData = await response.json()
      setUser(userData)
      setPosts(userData.posts || [])
      
    } catch (err: any) {
      console.error('User posts error:', err)
      setError(err.message || 'Failed to load user posts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Posts</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" className="mb-4" />
              <span className="ml-3 text-gray-300">Loading posts...</span>
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
            <h1 className="text-2xl font-bold text-white">Posts</h1>
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

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <div className="flex items-center gap-4">
            <Link 
              to={`/users/${username}`}
              className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Profile
            </Link>
            <h1 className="text-2xl font-bold text-white">{user.username}'s Posts</h1>
          </div>
        </div>

        <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No posts yet</p>
              <p className="text-gray-500 mt-2">This user hasn't created any posts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className={`p-4 bg-neutral-700/50 rounded-lg border border-violet-500/30 ${post.reward && post.reward > 0 ? 'border-l-4 border-cyan-400/60 bg-gradient-to-r from-cyan-500/5 to-neutral-700/50' : ''}`}>
                  <Link to={`/posts/${post.id}`} className={`block hover:bg-neutral-600/50 rounded-lg p-2 -m-2 transition-colors ${post.reward && post.reward > 0 ? 'hover:bg-cyan-500/10' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-violet-500/20 rounded-lg flex-shrink-0">
                        <FiEdit2 className="w-4 h-4 text-violet-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-violet-300">{post.title}</h3>
                          {post.reward && post.reward > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-full">
                              <span className="text-cyan-300 text-sm">💰</span>
                              <span className="text-cyan-200 text-sm font-medium">{post.reward} BBUX</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-3 line-clamp-3">{truncateContent(post.content)}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-400">
                              +{post.qualityUpvotes || 0} upvotes
                            </span>
                            <span className="text-red-400">
                              -{post.qualityDownvotes || 0} downvotes
                            </span>
                            <span className="text-violet-400 hover:text-violet-300 transition-colors">
                              Read full post →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 