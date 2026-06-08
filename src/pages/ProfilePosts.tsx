import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import type { Post } from '../types'
import { FiEdit2, FiArrowLeft, FiPlus } from 'react-icons/fi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'

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

      const [userData, postsData] = await Promise.all([api.getProfile(), api.getPosts()])

      const postsList = Array.isArray(postsData) ? postsData : postsData.posts
      const userPosts = postsList.filter((post: Post) => post.authorId === userData.id)
      setPosts(userPosts)
    } catch (err: unknown) {
      console.error('Posts error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts data')
    } finally {
      setLoading(false)
    }
  }

  const headerActions = (
    <Link
      to="/posts/create"
      className="inline-flex items-center gap-2 rounded-lg border-2 border-violet-500/50 bg-violet-500 px-4 py-2 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-colors hover:bg-violet-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
    >
      <FiPlus className="h-4 w-4" />
      <span className="hidden @sm/main:inline">Create Post</span>
      <span className="@sm/main:hidden">Create</span>
    </Link>
  )

  if (loading) {
    return (
      <PageContainer maxWidth="wide">
        <PageHeader title="All Posts" compact />
        <div className="card border-violet-500/50 p-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
            <span className="ml-3 text-neutral-600 dark:text-gray-300">Loading posts...</span>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="wide">
        <PageHeader title="All Posts" compact />
        <div className="card border-violet-500/50 p-6 text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <Link to="/profile" className="mt-4 inline-block text-violet-600 hover:text-violet-500 dark:text-violet-400">
            Back to Profile
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="All Posts"
        compact
        actions={
          <>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-100 p-2 text-violet-700 transition-colors hover:bg-violet-200 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30"
              aria-label="Back to profile"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            {headerActions}
          </>
        }
      />

      <div className="card border-violet-500/50 p-4 @sm/main:p-6">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`rounded-lg border border-violet-500/30 bg-neutral-100 p-4 transition-colors hover:bg-neutral-200 dark:bg-neutral-700/50 dark:hover:bg-neutral-600/50 ${
                  post.reward && post.reward > 0
                    ? 'border-l-4 border-cyan-400/60 bg-linear-to-r from-cyan-500/5 to-neutral-100 dark:to-neutral-700/50'
                    : ''
                }`}
              >
                <Link to={`/posts/${post.id}`} className="block">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0 rounded-lg bg-violet-100 p-2 dark:bg-violet-500/20">
                      <FiEdit2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base @sm/main:text-lg font-semibold text-violet-700 dark:text-violet-300">
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
                        <div className="flex flex-wrap items-center gap-3">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.editedAt && (
                            <span className="text-neutral-500 dark:text-gray-500">
                              (edited {new Date(post.editedAt).toLocaleDateString()})
                            </span>
                          )}
                          <span>{post.commentCount || 0} comments</span>
                        </div>
                        <span className="text-violet-600 dark:text-violet-400">Read post →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-lg text-neutral-600 dark:text-gray-400">No posts yet</p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-gray-500">
              Start sharing your knowledge with the community
            </p>
            <Link
              to="/posts/create"
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-white transition-colors hover:bg-violet-600"
            >
              <FiPlus className="h-4 w-4" />
              Create Your First Post
            </Link>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
