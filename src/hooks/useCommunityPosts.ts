import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import {
  buildCommunityPostsQuery,
  type CommunityFilterOptions,
  type CommunityPostsPagination,
} from '../utils/communityPosts'
import type { Post } from '../types'

const DEFAULT_FILTERS: CommunityFilterOptions = {
  status: '',
  dateRange: '',
  sortBy: 'newest',
  hasBounty: false,
  selectedTags: [],
}

const EXPORT_LIMIT = 100

export function useCommunityPosts(postsPerPage = 10) {
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<CommunityPostsPagination>({
    page: 1,
    limit: postsPerPage,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<CommunityFilterOptions>(DEFAULT_FILTERS)
  const [exportPosts, setExportPosts] = useState<Post[]>([])
  const everLoadedPostsRef = useRef(false)
  const fetchRequestIdRef = useRef(0)

  const loadPosts = useCallback(
    async (page: number, search: string, activeFilters: CommunityFilterOptions, mode: 'list' | 'export' = 'list') => {
      const requestId = ++fetchRequestIdRef.current
      const query = buildCommunityPostsQuery(
        page,
        mode === 'export' ? EXPORT_LIMIT : postsPerPage,
        search,
        activeFilters
      )

      const response = await api.getCommunityPosts(query)
      if (requestId !== fetchRequestIdRef.current) return null
      return response
    },
    [postsPerPage]
  )

  const fetchPosts = useCallback(async () => {
    const initial = !everLoadedPostsRef.current
    if (initial) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const response = await loadPosts(currentPage, searchQuery, filters)
      if (!response) return

      setPosts(response.posts)
      setPagination(response.pagination)
      everLoadedPostsRef.current = true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [currentPage, searchQuery, filters, loadPosts])

  const fetchExportPosts = useCallback(async () => {
    try {
      const response = await loadPosts(1, searchQuery, filters, 'export')
      if (!response) return []
      setExportPosts(response.posts)
      return response.posts
    } catch {
      return posts
    }
  }, [filters, loadPosts, posts, searchQuery])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    if (!everLoadedPostsRef.current) return
    fetchExportPosts()
  }, [fetchExportPosts])

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

  const totalPages = Math.max(1, pagination.totalPages || 1)

  return {
    posts,
    loading,
    isRefreshing,
    error,
    searchQuery,
    currentPage,
    filters,
    totalPosts: pagination.total,
    totalPages,
    hasActiveFilters,
    exportPosts,
    fetchPosts,
    fetchExportPosts,
    handleSearch,
    handlePageChange,
    handleFiltersChange,
    handleVoteChange,
    clearFilters,
  }
}
