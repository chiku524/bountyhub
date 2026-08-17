import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import {
  buildCommunityPostsQuery,
  type CommunityFilterOptions,
} from '../utils/communityPosts'
import type { Post } from '../types'
import { queryKeys } from '../lib/queryClient'

const DEFAULT_FILTERS: CommunityFilterOptions = {
  status: '',
  dateRange: '',
  sortBy: 'newest',
  hasBounty: false,
  unanswered: false,
  selectedTags: [],
}

const EXPORT_LIMIT = 100

export function useCommunityPosts(postsPerPage = 10) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<CommunityFilterOptions>(DEFAULT_FILTERS)

  const listParams = useMemo(
    () => ({
      page: currentPage,
      limit: postsPerPage,
      search: searchQuery,
      filters,
    }),
    [currentPage, postsPerPage, searchQuery, filters]
  )

  const listQuery = useQuery({
    queryKey: queryKeys.communityPosts(listParams),
    queryFn: async () => {
      const query = buildCommunityPostsQuery(
        currentPage,
        postsPerPage,
        searchQuery,
        filters
      )
      return api.getCommunityPosts(query)
    },
    placeholderData: (prev) => prev,
  })

  const exportParams = useMemo(
    () => ({
      search: searchQuery,
      filters,
      limit: EXPORT_LIMIT,
    }),
    [searchQuery, filters]
  )

  const exportQuery = useQuery({
    queryKey: queryKeys.communityExport(exportParams),
    queryFn: async () => {
      const query = buildCommunityPostsQuery(1, EXPORT_LIMIT, searchQuery, filters)
      return api.getCommunityPosts(query)
    },
    enabled: listQuery.isSuccess,
    staleTime: 60_000,
  })

  const posts = listQuery.data?.posts ?? []
  const pagination = listQuery.data?.pagination ?? {
    page: currentPage,
    limit: postsPerPage,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  }

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

  const handleVoteChange = useCallback(
    (postId: string, newVotes: number, newUserVote?: number) => {
      queryClient.setQueryData(queryKeys.communityPosts(listParams), (old: typeof listQuery.data) => {
        if (!old) return old
        return {
          ...old,
          posts: old.posts.map((post: Post) =>
            post.id === postId
              ? {
                  ...post,
                  qualityUpvotes: newVotes,
                  userVote: newUserVote !== undefined ? newUserVote : post.userVote,
                }
              : post
          ),
        }
      })
    },
    [listParams, queryClient, listQuery.data]
  )

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }, [])

  const fetchPosts = useCallback(async () => {
    await listQuery.refetch()
  }, [listQuery])

  const fetchExportPosts = useCallback(async () => {
    const result = await exportQuery.refetch()
    return result.data?.posts ?? posts
  }, [exportQuery, posts])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    filters.status !== '' ||
    filters.dateRange !== '' ||
    filters.hasBounty ||
    filters.unanswered ||
    filters.selectedTags.length > 0

  return {
    posts,
    loading: listQuery.isLoading && !listQuery.data,
    isRefreshing: listQuery.isFetching && !!listQuery.data,
    error: listQuery.error instanceof Error ? listQuery.error.message : listQuery.error ? 'Failed to load posts' : null,
    searchQuery,
    currentPage,
    filters,
    totalPosts: pagination.total,
    totalPages: Math.max(1, pagination.totalPages || 1),
    hasActiveFilters,
    exportPosts: exportQuery.data?.posts ?? [],
    fetchPosts,
    fetchExportPosts,
    handleSearch,
    handlePageChange,
    handleFiltersChange,
    handleVoteChange,
    clearFilters,
  }
}
