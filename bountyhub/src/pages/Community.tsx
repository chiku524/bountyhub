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
import type { Post } from '../types'

interface FilterOptions {
  status: string
  dateRange: string
  sortBy: string
  hasBounty: boolean
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    dateRange: '',
    sortBy: 'newest',
    hasBounty: false
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
        post.authorId.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(post => post.status === filters.status)
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

    return filtered
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
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Community</h1>
          <div className="flex items-center space-x-4">
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
                      hasBounty: false
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
              <ul className="divide-y divide-neutral-700">
                {paginatedPosts.map((post) => (
                  <li key={post.id} className="py-4">
                    <div className="flex space-x-4">
                      {/* Voting */}
                      <div className="flex-shrink-0">
                        <VoteButton
                          itemId={post.id}
                          itemType="post"
                          voteType="quality"
                          initialVotes={post.qualityUpvotes || 0}
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
                                <span>By: <Link to={`/${post.authorId}`} className="text-indigo-400 hover:text-indigo-300" onClick={(e) => e.stopPropagation()}>User {post.authorId}</Link></span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.reward && post.reward > 0 && (
                                  <span className="text-yellow-400">💰 {post.reward} bounty</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                post.status === 'open' ? 'bg-green-600 text-white' :
                                post.status === 'claimed' ? 'bg-yellow-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {post.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
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