import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import type { Post } from '../types'
import { FiEdit2, FiArrowLeft, FiPlus } from 'react-icons/fi'

function truncateContent(content: string | undefined | null): string {
  if (!content) return ''
  return content.length > 150 ? content.substring(0, 150) + '...' : content
}

export default function ProfilePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPostsData()
  }, [])

  const loadPostsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [userData, postsData] = await Promise.all([
        api.getProfile(),
        api.getPosts()
      ])
      
      // Filter posts for current user
      // Handle both array and paginated response
      const posts = Array.isArray(postsData) ? postsData : postsData.posts
      const userPosts = posts.filter((post: Post) => post.authorId === userData.id)
      setPosts(userPosts)
      
    } catch (err: any) {
      console.error('Posts error:', err)
      setError(err.message || 'Failed to load posts data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">All Posts</h1>
          </div>
          <div className="bg-white dark:bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 dark:border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              <span className="ml-3 text-neutral-600 dark:text-gray-300">Loading posts...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">All Posts</h1>
          </div>
          <div className="bg-white dark:bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 dark:border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <Link to="/profile" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <div className="flex items-center gap-4">
            <Link 
              to="/profile" 
              className="p-2 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors border border-violet-300 dark:border-violet-500/50"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">All Posts</h1>
          </div>
          <Link 
            to="/posts/create" 
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
          >
            <FiPlus className="w-4 h-4" />
            Create Post
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 dark:border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className={`p-4 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg border border-violet-500/30 dark:border-violet-500/30 hover:bg-neutral-200 dark:hover:bg-neutral-600/50 transition-colors ${post.reward && post.reward > 0 ? 'border-l-4 border-cyan-400/60 bg-gradient-to-r from-cyan-500/5 to-neutral-100 dark:to-neutral-700/50' : ''}`}>
                  <Link to={`/posts/${post.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg mt-1">
                        <FiEdit2 className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-violet-600 dark:text-violet-300">{post.title}</h3>
                          {post.reward && post.reward > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-full">
                              <span className="text-cyan-600 dark:text-cyan-300 text-sm">💰</span>
                              <span className="text-cyan-700 dark:text-cyan-200 text-sm font-medium">{post.reward} BBUX</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-gray-300 mb-3 line-clamp-3">{truncateContent(post.content)}</p>
                        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            {post.editedAt && (
                              <span className="text-neutral-500 dark:text-gray-500">(edited {new Date(post.editedAt).toLocaleDateString()})</span>
                            )}
                            <span>{post.commentCount || 0} comments</span>
                          </div>
                          <span className="text-violet-400 hover:text-violet-300 transition-colors">
                            Read post →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 dark:text-gray-400 text-lg">No posts yet</p>
              <p className="text-sm text-neutral-500 dark:text-gray-500 mt-2">Start sharing your knowledge with the community</p>
              <Link 
                to="/posts/create" 
                className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <FiPlus className="w-4 h-4" />
                Create Your First Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 