import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { config } from '../utils/config'
import type { Post } from '../types'
import { FiEdit2, FiArrowLeft } from 'react-icons/fi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'

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

      const response = await fetch(`${config.api.baseUrl}/api/users/${username}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) throw new Error('User not found')
        throw new Error('Failed to fetch user posts')
      }

      const userData = await response.json()
      setUser(userData)
      setPosts(userData.posts || [])
    } catch (err: unknown) {
      console.error('User posts error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user posts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageContainer maxWidth="wide">
        <PageHeader title="Posts" compact />
        <div className="card border-violet-500/50 p-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-neutral-600 dark:text-gray-300">Loading posts...</span>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error || !user) {
    return (
      <PageContainer maxWidth="wide">
        <PageHeader title="Posts" compact />
        <div className="card border-violet-500/50 p-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">User not found</h2>
          <Link to="/community" className="mt-4 inline-block text-violet-600 hover:text-violet-500 dark:text-violet-400">
            Go to Community
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title={`${user.username}'s Posts`}
        compact
        actions={
          <Link
            to={`/users/${username}`}
            className="inline-flex items-center gap-2 text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            <FiArrowLeft className="h-5 w-5" />
            <span className="hidden @sm/main:inline">Back to Profile</span>
          </Link>
        }
      />

      <div className="card border-violet-500/50 p-4 @sm/main:p-6">
        {posts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-lg text-neutral-600 dark:text-gray-400">No posts yet</p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-gray-500">
              This user hasn&apos;t created any posts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`rounded-lg border border-violet-500/30 bg-neutral-100 p-4 dark:bg-neutral-700/50 ${
                  post.reward && post.reward > 0
                    ? 'border-l-4 border-cyan-400/60 bg-linear-to-r from-cyan-500/5 to-neutral-100 dark:to-neutral-700/50'
                    : ''
                }`}
              >
                <Link
                  to={`/posts/${post.id}`}
                  className={`block rounded-lg transition-colors hover:bg-neutral-200/80 dark:hover:bg-neutral-600/50 ${post.reward && post.reward > 0 ? 'hover:bg-cyan-500/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-violet-100 p-2 dark:bg-violet-500/20">
                      <FiEdit2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base @sm/main:text-lg font-medium text-violet-700 dark:text-violet-300">
                          {post.title}
                        </h3>
                        {post.reward && post.reward > 0 && (
                          <div className="flex items-center gap-1 rounded-full border border-cyan-400/40 bg-linear-to-r from-cyan-500/20 to-blue-500/20 px-2 py-1">
                            <span className="text-sm text-cyan-600 dark:text-cyan-300">💰</span>
                            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-200">{post.reward} BBUX</span>
                          </div>
                        )}
                      </div>
                      <p className="mb-3 line-clamp-3 text-sm text-neutral-700 dark:text-gray-300">
                        {truncateContent(post.content)}
                      </p>
                      <div className="flex flex-col gap-2 text-xs text-neutral-600 @sm/main:flex-row @sm/main:items-center @sm/main:justify-between dark:text-gray-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-green-600 dark:text-green-400">+{post.qualityUpvotes || 0} upvotes</span>
                          <span className="text-red-600 dark:text-red-400">-{post.qualityDownvotes || 0} downvotes</span>
                          <span className="text-violet-600 dark:text-violet-400">Read full post →</span>
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
    </PageContainer>
  )
}
