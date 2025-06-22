import { useEffect, useState, useMemo } from 'react'
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
import type { Post } from '../types'

interface FilterOptions {
  status: string
  dateRange: string
  sortBy: string
  hasBounty: boolean
  selectedTags: string[]
}

// Separate component for post list to force re-render on sort changes
const PostList: React.FC<{
  posts: any[]
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}> = ({ posts, onVoteChange }) => {
  return (
    <ul className="divide-y divide-neutral-700">
      {posts.map((post) => (
        <li key={post.id} className="py-4">
          <div className="flex space-x-4">
            {/* Voting */}
            <div className="flex-shrink-0 flex items-center justify-center w-16">
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
            <div className="flex-1">
              <Link to={`/posts/${post.id}`} className="block hover:bg-neutral-700/40 rounded-lg p-2 transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                    <p className="text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>By: <Link to={`/users/${post.author?.username || post.authorId}`} className="text-indigo-400 hover:text-indigo-300" onClick={(e) => e.stopPropagation()}>{post.author?.username || `User ${post.authorId}`}</Link></span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.reward && post.reward > 0 && (
                        <span className="text-yellow-400">💰 {post.reward} bounty</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center space-x-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      post.status === 'open' ? 'bg-green-600 text-white' :
                      post.status === 'claimed' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {post.status}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tagName: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/40"
                          >
                            {tagName}
                          </span>
                        ))}
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
}

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
      const fetchedPosts = await api.getPosts()
      setPosts(fetchedPosts)
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

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    // If sortBy changed, increment sortTimestamp to force re-render
    if (newFilters.sortBy !== filters.sortBy) {
      setSortTimestamp(Date.now())
      setCurrentPage(1)
    }
    setFilters(newFilters)
  }

  const handleVoteChange = (postId: string, newVotes: number, newUserVote?: number) => {
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
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Community</h1>
          <div className="relative w-full flex items-center justify-end space-x-4">
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
            className="max-w-md"
          />
        </div>

        {/* Results Summary */}
        {!loading && !error && (
          <div className="mb-4 text-gray-400">
            Showing {paginatedPosts.length} of {filteredPosts.length} posts
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}

        <div className="card bg-neutral-800 border-neutral-700">
          {loading && (
            <div className="p-8">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-300 text-center">Loading posts...</p>
              <div className="mt-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-6">
              <ErrorMessage 
                message={error} 
                onRetry={fetchPosts}
              />
            </div>
          )}
          
          {!loading && !error && paginatedPosts.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                {searchQuery || Object.values(filters).some(f => f !== '' && f !== false) ? (
                  <>
                    <p className="text-lg mb-2">No posts found matching your criteria</p>
                    <p>Try adjusting your search terms or filters</p>
                  </>
                ) : (
                  <p className="text-lg">No posts found</p>
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
              <div className="p-6 border-t border-neutral-700">
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
  )
} 