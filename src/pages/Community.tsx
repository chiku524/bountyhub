import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { SearchBar } from '../components/SearchBar'
import { Pagination } from '../components/Pagination'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner, PostSkeleton } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { AdvancedFilters } from '../components/AdvancedFilters'
import { EmptyState } from '../components/EmptyState'
import { ExportButton } from '../components/ExportButton'
import { VoteButton } from '../components/VoteButton'
import { BookmarkButton } from '../components/BookmarkButton'
import { ProfilePicture } from '../components/ProfilePicture'
import { PageMetadata } from '../components/PageMetadata'
import { RelativeTime } from '../components/RelativeTime'
import type { Post } from '../types'
import { FiGrid, FiList, FiMinimize2 } from 'react-icons/fi'

const COMMUNITY_POST_VIEW_KEY = 'bountyhub:community-post-view'
type CommunityPostView = 'list' | 'compact' | 'card'

function readStoredPostView(): CommunityPostView {
  try {
    const raw = localStorage.getItem(COMMUNITY_POST_VIEW_KEY)
    if (raw === 'list' || raw === 'compact' || raw === 'card') return raw
  } catch {
    /* ignore */
  }
  return 'list'
}

function persistPostView(view: CommunityPostView) {
  try {
    localStorage.setItem(COMMUNITY_POST_VIEW_KEY, view)
  } catch {
    /* ignore */
  }
}

interface FilterOptions {
  status: string
  dateRange: string
  sortBy: string
  hasBounty: boolean
  selectedTags: string[]
}

// Separate component for post list to force re-render on sort changes
// Memoized to prevent unnecessary re-renders when parent updates
const PostList: React.FC<{
  posts: Post[]
  density?: 'comfortable' | 'compact'
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}> = memo(({ posts, onVoteChange, density = 'comfortable' }) => {
  const compact = density === 'compact'
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {posts.map((post) => (
        <li
          key={post.id}
          className={`${compact ? 'py-2 @sm/main:py-2.5' : 'py-3 @sm/main:py-4'} ${post.reward && post.reward > 0 ? 'bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 border border-cyan-200 dark:border-cyan-400/30 rounded-lg' : ''}`}
        >
          <div className={`flex ${compact ? 'space-x-2' : 'space-x-2 @sm/main:space-x-4'}`}>
            <div
              className={`flex shrink-0 items-center justify-center ${compact ? 'w-10 @sm/main:w-12' : 'w-12 @sm/main:w-16'}`}
            >
              <VoteButton
                itemId={post.id}
                itemType="post"
                voteType="quality"
                initialVotes={post.qualityUpvotes || 0}
                userVote={post.userVote || 0}
                onVoteChange={(newVotes, newUserVote) => onVoteChange(post.id, newVotes, newUserVote)}
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/posts/${post.id}`}
                className={`block rounded-lg transition hover:bg-neutral-100 dark:hover:bg-neutral-700/40 ${compact ? 'p-1.5 @sm/main:p-2' : 'p-2'} ${post.reward && post.reward > 0 ? 'hover:bg-cyan-100 dark:hover:bg-cyan-500/10' : ''}`}
              >
                <div className="flex flex-col @xl/main:flex-row @xl/main:items-center @xl/main:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-col gap-2 @xl/main:flex-row @xl/main:items-center">
                      <h2
                        className={`font-semibold text-neutral-900 dark:text-white ${compact ? 'line-clamp-1 text-sm @sm/main:text-base' : 'line-clamp-2 text-base @xl/main:text-xl'}`}
                      >
                        {post.title}
                      </h2>
                      {post.reward && post.reward > 0 && (
                        <div className="flex w-fit items-center gap-1 rounded-full border border-cyan-300 bg-linear-to-r from-cyan-100 to-blue-100 px-2 py-0.5 dark:border-cyan-400/40 dark:from-cyan-500/20 dark:to-blue-500/20 @sm/main:py-1">
                          <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300">💰</span>
                          <span className="text-xs font-medium text-cyan-700 dark:text-cyan-200">{post.reward} BBUX</span>
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-neutral-500 dark:text-gray-400 ${compact ? 'mt-0.5 line-clamp-1 text-xs @sm/main:text-sm' : 'mt-1 line-clamp-2 text-sm @sm/main:text-base'}`}
                    >
                      {post.content}
                    </p>
                    <div
                      className={`flex flex-col gap-2 text-neutral-400 @sm/main:gap-4 @xl/main:flex-row @xl/main:items-center dark:text-gray-500 ${compact ? 'mt-1 text-xs @sm/main:text-sm' : 'mt-2 text-xs @sm/main:text-sm'}`}
                    >
                      <span className="flex min-w-0 items-center space-x-2">
                        <ProfilePicture user={post.author} size="sm" />
                        <span className="truncate">
                          By:{' '}
                          <Link
                            to={`/users/${post.author?.username || post.authorId}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {post.author?.username || `User ${post.authorId}`}
                          </Link>
                        </span>
                      </span>
                      <RelativeTime
                        date={post.createdAt}
                        className="shrink-0 text-neutral-400 @sm/main:text-inherit dark:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className={`mt-2 flex flex-wrap items-center gap-2 @xl/main:mt-0 ${compact ? 'gap-1.5' : ''}`}>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium @sm/main:py-1 ${
                        post.status === 'OPEN'
                          ? 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white'
                          : post.status === 'COMPLETED'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-gray-600 dark:text-white'
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(compact ? post.tags.slice(0, 1) : post.tags.slice(0, 2)).map((tagName: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full border border-violet-300 bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/20 dark:text-violet-400 @sm/main:py-1"
                          >
                            {tagName}
                          </span>
                        ))}
                        {post.tags.length > (compact ? 1 : 2) && (
                          <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:border-gray-500/40 dark:bg-gray-500/20 dark:text-gray-400 @sm/main:py-1">
                            +{post.tags.length - (compact ? 1 : 2)}
                          </span>
                        )}
                      </div>
                    )}
                    <BookmarkButton postId={post.id} size="sm" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}, (prevProps, nextProps) =>
  prevProps.density === nextProps.density &&
  prevProps.posts.length === nextProps.posts.length &&
  prevProps.posts.every((post, index) => post.id === nextProps.posts[index]?.id) &&
  prevProps.onVoteChange === nextProps.onVoteChange)

const PostCardGrid: React.FC<{
  posts: Post[]
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}> = memo(({ posts, onVoteChange }) => {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-4 @md/main:grid-cols-2 @3xl/main:grid-cols-3 @sm/main:p-6">
      {posts.map((post) => (
        <li
          key={post.id}
          className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800/80 ${post.reward && post.reward > 0 ? 'border-cyan-200 bg-linear-to-b from-cyan-50/80 to-white dark:border-cyan-400/30 dark:from-cyan-500/10 dark:to-neutral-800/80' : ''}`}
        >
          <div className="flex items-start justify-between gap-2 border-b border-neutral-100 px-3 py-2 dark:border-neutral-700">
            <VoteButton
              itemId={post.id}
              itemType="post"
              voteType="quality"
              initialVotes={post.qualityUpvotes || 0}
              userVote={post.userVote || 0}
              onVoteChange={(newVotes, newUserVote) => onVoteChange(post.id, newVotes, newUserVote)}
            />
            <BookmarkButton postId={post.id} size="sm" />
          </div>
          <Link
            to={`/posts/${post.id}`}
            className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 transition hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
          >
            <div className="mb-2 flex flex-wrap items-start gap-2">
              <h2 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold text-neutral-900 dark:text-white">
                {post.title}
              </h2>
              {post.reward && post.reward > 0 && (
                <div className="flex w-fit shrink-0 items-center gap-1 rounded-full border border-cyan-300 bg-linear-to-r from-cyan-100 to-blue-100 px-2 py-1 dark:border-cyan-400/40 dark:from-cyan-500/20 dark:to-blue-500/20">
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300">💰</span>
                  <span className="text-xs font-medium text-cyan-700 dark:text-cyan-200">{post.reward} BBUX</span>
                </div>
              )}
            </div>
            <p className="line-clamp-3 flex-1 text-sm text-neutral-500 dark:text-gray-400">{post.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  post.status === 'OPEN'
                    ? 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white'
                    : post.status === 'COMPLETED'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-gray-600 dark:text-white'
                }`}
              >
                {post.status}
              </span>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 2).map((tagName: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full border border-violet-300 bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/20 dark:text-violet-400"
                    >
                      {tagName}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:border-gray-500/40 dark:bg-gray-500/20 dark:text-gray-400">
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-gray-400">
              <ProfilePicture user={post.author} size="sm" />
              <span className="min-w-0 truncate">
                <Link
                  to={`/users/${post.author?.username || post.authorId}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author?.username || `User ${post.authorId}`}
                </Link>
              </span>
              <RelativeTime date={post.createdAt} className="ml-auto shrink-0" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}, (prevProps, nextProps) =>
  prevProps.posts.length === nextProps.posts.length &&
  prevProps.posts.every((post, index) => post.id === nextProps.posts[index]?.id) &&
  prevProps.onVoteChange === nextProps.onVoteChange)

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortTimestamp, setSortTimestamp] = useState(Date.now())
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    dateRange: '',
    sortBy: 'newest',
    hasBounty: false,
    selectedTags: []
  })
  const postsPerPage = 10
  const everLoadedPostsRef = useRef(false)
  const [postView, setPostView] = useState<CommunityPostView>(() => readStoredPostView())

  const handlePostViewChange = useCallback((view: CommunityPostView) => {
    setPostView(view)
    persistPostView(view)
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const initial = !everLoadedPostsRef.current
    if (initial) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      const fetchedPosts = await api.getAllPosts()
      setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : [])
      everLoadedPostsRef.current = true
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Filter posts based on search query and filters
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.author?.username && post.author.username.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(post => post.status.toLowerCase() === filters.status.toLowerCase())
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date()
      const postDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(post => {
            postDate.setTime(new Date(post.createdAt).getTime())
            return postDate.toDateString() === now.toDateString()
          })
          break
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(post => new Date(post.createdAt) >= weekAgo)
          break
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(post => new Date(post.createdAt) >= monthAgo)
          break
        }
        case 'year': {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(post => new Date(post.createdAt) >= yearAgo)
          break
        }
      }
    }

    // Tags filter
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(post => {
        const postTags = post.tags || []
        return filters.selectedTags.some(selectedTag => 
          postTags.includes(selectedTag)
        )
      })
    }

    // Bounty filter (mock implementation)
    if (filters.hasBounty) {
      filtered = filtered.filter(post => post.reward && post.reward > 0)
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'mostVoted':
          return (b.qualityUpvotes || 0) - (a.qualityUpvotes || 0)
        case 'mostCommented':
          return (b.commentCount || 0) - (a.commentCount || 0)
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    // Force new array reference when sort changes to ensure React re-renders
    return [...filtered]
  }, [posts, searchQuery, filters])

  // Paginate filtered posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    return filteredPosts.slice(startIndex, endIndex)
  }, [filteredPosts, currentPage])

  const totalPages = useMemo(() => Math.ceil(filteredPosts.length / postsPerPage), [filteredPosts.length])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    // If sortBy changed, increment sortTimestamp to force re-render
    if (newFilters.sortBy !== filters.sortBy) {
      setSortTimestamp(Date.now())
      setCurrentPage(1)
    }
    setFilters(newFilters)
  }, [filters.sortBy])

  const handleVoteChange = useCallback((postId: string, newVotes: number, newUserVote?: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              qualityUpvotes: newVotes,
              userVote: newUserVote !== undefined ? newUserVote : post.userVote
            }
          : post
      )
    )
  }, [])

  if (error) return (
    <PageContainer>
      <ErrorMessage message={error} onRetry={fetchPosts} />
    </PageContainer>
  )

  return (
    <>
      <PageMetadata 
        title="Community - bountyhub"
        description="Browse active bounties, ask questions, and find opportunities to earn cryptocurrency rewards in the bountyhub community. Join thousands of users earning BBUX tokens."
        keywords="community, bounties, questions, cryptocurrency, rewards, BBUX, active bounties, earn crypto"
      />
      <PageContainer>
        <PageHeader
          title="Community"
          description="Browse bounties, ask questions, and earn rewards"
          actions={
            !loading ? (
              <>
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
                <ExportButton
                  data={filteredPosts}
                  filename="community-posts"
                />
              </>
            ) : undefined
          }
        />
          
          {isRefreshing && posts.length > 0 && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-3 py-2 text-sm text-indigo-900 dark:border-indigo-500/35 dark:bg-indigo-950/40 dark:text-indigo-100"
              role="status"
            >
              <LoadingSpinner size="sm" label={false} />
              <span>Updating posts…</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search posts by title, content, or author..."
              className="w-full max-w-md"
              debounceMs={300}
            />
          </div>

          {/* Results summary + layout toggle */}
          {!loading && !error && (
            <div className="mb-4 flex flex-col gap-3 @sm/main:flex-row @sm/main:items-center @sm/main:justify-between">
              <p className="text-sm text-neutral-500 @sm/main:text-base dark:text-gray-400">
                Showing {paginatedPosts.length} of {filteredPosts.length} posts
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
              <div
                className="inline-flex shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-600 dark:bg-neutral-900/60"
                role="group"
                aria-label="Post layout"
              >
                {(
                  [
                    { id: 'list' as const, label: 'List', icon: FiList },
                    { id: 'compact' as const, label: 'Compact', icon: FiMinimize2 },
                    { id: 'card' as const, label: 'Cards', icon: FiGrid },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handlePostViewChange(id)}
                    title={label}
                    aria-pressed={postView === id}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition @sm/main:px-3 @sm/main:text-sm ${
                      postView === id
                        ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            {loading && (
              <div className="p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <LoadingSpinner size="sm" />
                  <span>Loading posts…</span>
                </div>
                {postView === 'card' ? (
                  <div className="grid grid-cols-1 gap-4 @md/main:grid-cols-2 @3xl/main:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-600"
                      >
                        <div className="h-12 border-b border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700/50" />
                        <div className="space-y-2 p-3">
                          <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                          <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                          <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {[...Array(5)].map((_, i) => (
                      <li key={i} className="py-3 sm:py-4">
                        <PostSkeleton />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-4 sm:p-6">
                <ErrorMessage 
                  message={error} 
                  onRetry={fetchPosts}
                />
              </div>
            )}
            
            {!loading && !error && paginatedPosts.length === 0 && (
              <div className="p-4 sm:p-8">
                <EmptyState
                  icon="🔍"
                  title={searchQuery || Object.values(filters).some(f => f !== '' && f !== false) ? 'No posts match your criteria' : 'No posts yet'}
                  description={searchQuery || Object.values(filters).some(f => f !== '' && f !== false) ? 'Try different search terms or clear filters to see all posts.' : 'Be the first to create a bounty or check back later.'}
                  action={
                    (searchQuery || Object.values(filters).some(f => f !== '' && f !== false)) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setFilters({
                            status: '',
                            dateRange: '',
                            sortBy: 'newest',
                            hasBounty: false,
                            selectedTags: []
                          })
                        }}
                        className="btn-secondary"
                      >
                        Clear all filters
                      </button>
                    ) : undefined
                  }
                />
              </div>
            )}
            
            {!loading && !error && paginatedPosts.length > 0 && (
              <>
                {postView === 'card' ? (
                  <PostCardGrid
                    key={`postcards-${filters.sortBy}-${sortTimestamp}`}
                    posts={paginatedPosts}
                    onVoteChange={handleVoteChange}
                  />
                ) : (
                  <PostList
                    key={`postlist-${postView}-${filters.sortBy}-${sortTimestamp}`}
                    posts={paginatedPosts}
                    density={postView === 'compact' ? 'compact' : 'comfortable'}
                    onVoteChange={handleVoteChange}
                  />
                )}

                {/* Pagination */}
                <div className="border-t border-neutral-200 p-4 @sm/main:p-6 dark:border-neutral-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
      </PageContainer>
    </>
  )
} 