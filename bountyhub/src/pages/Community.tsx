import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { SearchBar } from '../components/SearchBar'
import { Pagination } from '../components/Pagination'
import { LoadingSpinner, PostSkeleton } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { AdvancedFilters } from '../components/AdvancedFilters'
import { ExportButton } from '../components/ExportButton'
import { VoteButton } from '../components/VoteButton'
import { BookmarkButton } from '../components/BookmarkButton'
import { ProfilePicture } from '../components/ProfilePicture'
import { PageMetadata } from '../components/PageMetadata'
import type { Post } from '../types'

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
  posts: any[]
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}> = memo(({ posts, onVoteChange }) => {
  return (
    <ul className="divide-y divide-neutral-700">
      {posts.map((post) => (
        <li key={post.id} className={`py-3 sm:py-4 ${post.reward && post.reward > 0 ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-lg' : ''}`}>
          <div className="flex space-x-2 sm:space-x-4">
            {/* Voting */}
            <div className="flex-shrink-0 flex items-center justify-center w-12 sm:w-16">
              <VoteButton
                itemId={post.id}
                itemType="post"
                voteType="quality"
                initialVotes={post.qualityUpvotes || 0}
                userVote={post.userVote || 0}
                onVoteChange={(newVotes, newUserVote) => onVoteChange(post.id, newVotes, newUserVote)}
              />
            </div>
            
            {/* Post Content */}
            <div className="flex-1 min-w-0">
              <Link to={`/posts/${post.id}`} className={`block hover:bg-neutral-700/40 rounded-lg p-2 transition ${post.reward && post.reward > 0 ? 'hover:bg-cyan-500/10' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h2 className="text-base sm:text-xl font-semibold text-neutral-900 dark:text-white line-clamp-2 sm:line-clamp-1">{post.title.length > 60 ? post.title.slice(0, 60) + '...' : post.title}</h2>
                      {post.reward && post.reward > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-full w-fit">
                          <span className="text-cyan-300 text-xs sm:text-sm font-medium">💰</span>
                          <span className="text-cyan-200 text-xs sm:text-sm font-medium">{post.reward} BBUX</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-neutral-500 dark:text-gray-400 mt-1 line-clamp-2">{post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-neutral-400 dark:text-gray-500">
                      <span className="flex items-center space-x-2">
                        <ProfilePicture user={post.author} size="sm" />
                        <span>By: <Link to={`/users/${post.author?.username || post.authorId}`} className="text-indigo-400 hover:text-indigo-300" onClick={(e) => e.stopPropagation()}>{post.author?.username || `User ${post.authorId}`}</Link></span>
                      </span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-0 flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'OPEN' ? 'bg-green-600 text-white' :
                      post.status === 'COMPLETED' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>{post.status}</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tagName: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/40"
                          >
                            {tagName}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-200 dark:bg-gray-500/20 text-neutral-600 dark:text-gray-400 border border-neutral-300 dark:border-gray-500/40">
                            +{post.tags.length - 2}
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
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if posts array or onVoteChange function reference changes
  return prevProps.posts.length === nextProps.posts.length &&
         prevProps.posts.every((post, index) => post.id === nextProps.posts[index]?.id) &&
         prevProps.onVoteChange === nextProps.onVoteChange
})

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      // For now, fetch all posts to maintain current behavior
      // TODO: Update to use paginated API when frontend pagination is fully implemented
      const fetchedPosts = await api.getAllPosts()
      setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(post => new Date(post.createdAt) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(post => new Date(post.createdAt) >= monthAgo)
          break
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(post => new Date(post.createdAt) >= yearAgo)
          break
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

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <>
      <PageMetadata 
        title="Community - bountyhub"
        description="Browse active bounties, ask questions, and find opportunities to earn cryptocurrency rewards in the bountyhub community. Join thousands of users earning BBUX tokens."
        keywords="community, bounties, questions, cryptocurrency, rewards, BBUX, active bounties, earn crypto"
      />
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">Community</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <AdvancedFilters 
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
              <ExportButton 
                data={filteredPosts}
                filename="community-posts"
              />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search posts by title, content, or author..."
              className="w-full max-w-md"
            />
          </div>

          {/* Results Summary */}
          {!loading && !error && (
            <div className="mb-4 text-neutral-500 dark:text-gray-400 text-sm sm:text-base">
              Showing {paginatedPosts.length} of {filteredPosts.length} posts
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}

          <div className="card bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            {loading && (
              <div className="p-4 sm:p-8">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-neutral-600 dark:text-gray-300 text-center">Loading posts...</p>
                <div className="mt-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
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
              <div className="p-4 sm:p-8 text-center">
                <div className="text-neutral-500 dark:text-gray-400 mb-4">
                  {searchQuery || Object.values(filters).some(f => f !== '' && f !== false) ? (
                    <>
                      <p className="text-base sm:text-lg mb-2">No posts found matching your criteria</p>
                      <p className="text-sm sm:text-base">Try adjusting your search terms or filters</p>
                    </>
                  ) : (
                    <p className="text-base sm:text-lg">No posts found</p>
                  )}
                </div>
                {(searchQuery || Object.values(filters).some(f => f !== '' && f !== false)) && (
                  <button
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
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
            
            {!loading && !error && paginatedPosts.length > 0 && (
              <>
                <PostList key={`postlist-${filters.sortBy}-${sortTimestamp}`} posts={paginatedPosts} onVoteChange={handleVoteChange} />
                
                {/* Pagination */}
                <div className="p-4 sm:p-6 border-t border-neutral-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 