import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../utils/api'
import { filterCommunityPosts, type CommunityFilterOptions } from '../utils/communityPosts'
import type { Post } from '../types'

const DEFAULT_FILTERS: CommunityFilterOptions = {
  status: '',
  dateRange: '',
  sortBy: 'newest',
  hasBounty: false,
  selectedTags: [],
}

export function useCommunityPosts(postsPerPage = 10) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<CommunityFilterOptions>(DEFAULT_FILTERS)
  const everLoadedPostsRef = useRef(false)

  const fetchPosts = useCallback(async () => {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = useMemo(
    () => filterCommunityPosts(posts, searchQuery, filters),
    [posts, searchQuery, filters]
  )

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage
    return filteredPosts.slice(startIndex, startIndex + postsPerPage)
  }, [filteredPosts, currentPage, postsPerPage])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPosts.length / postsPerPage)),
    [filteredPosts.length, postsPerPage]
  )

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFiltersChange = useCallback((newFilters: CommunityFilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const handleVoteChange = useCallback((postId: string, newVotes: number, newUserVote?: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              qualityUpvotes: newVotes,
              userVote: newUserVote !== undefined ? newUserVote : post.userVote,
            }
          : post
      )
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }, [])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    filters.status !== '' ||
    filters.dateRange !== '' ||
    filters.hasBounty ||
    filters.selectedTags.length > 0

  return {
    posts,
    loading,
    isRefreshing,
    error,
    searchQuery,
    currentPage,
    filters,
    filteredPosts,
    paginatedPosts,
    totalPages,
    hasActiveFilters,
    fetchPosts,
    handleSearch,
    handlePageChange,
    handleFiltersChange,
    handleVoteChange,
    clearFilters,
  }
}
