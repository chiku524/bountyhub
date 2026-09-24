import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import {
  buildCommunityPostsQuery,
  type CommunityFilterOptions,
} from '../utils/communityPosts'
import type { Post } from '../types'
import { queryKeys } from '../lib/queryClient'
import {
  DEFAULT_DISCOVERY_TAB,
  filtersForDiscoveryTab,
  parseDiscoveryTab,
  type CommunityDiscoveryTab,
} from '../utils/communityDiscovery'

const DEFAULT_FILTERS: CommunityFilterOptions = {
  status: '',
  dateRange: '',
  sortBy: 'newest',
  hasBounty: false,
  unanswered: false,
  selectedTags: [],
}

const EXPORT_LIMIT = 100
const FEATURED_LIMIT = 6

function filtersFromTab(tab: CommunityDiscoveryTab): CommunityFilterOptions {
  return filtersForDiscoveryTab(tab, DEFAULT_FILTERS)
}

export function useCommunityPosts(
  postsPerPage = 10,
  options?: {
    initialTab?: CommunityDiscoveryTab
    onTabChange?: (tab: CommunityDiscoveryTab) => void
  }
) {
  const queryClient = useQueryClient()
  const initialTab = options?.initialTab ?? DEFAULT_DISCOVERY_TAB
  const onTabChangeRef = useRef(options?.onTabChange)
  useEffect(() => {
    onTabChangeRef.current = options?.onTabChange
  }, [options?.onTabChange])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<CommunityDiscoveryTab>(() => parseDiscoveryTab(initialTab))
  const [filters, setFilters] = useState<CommunityFilterOptions>(() =>
    filtersFromTab(parseDiscoveryTab(initialTab)),
  )
  // Adjust local state when the URL tab prop changes (back/forward). Prefer
  // render-time sync over an effect to avoid react-hooks/set-state-in-effect.
  const [syncedInitialTab, setSyncedInitialTab] = useState(initialTab)
  if (initialTab !== syncedInitialTab) {
    setSyncedInitialTab(initialTab)
    const tab = parseDiscoveryTab(initialTab)
    setActiveTab(tab)
    setFilters((prev) => filtersForDiscoveryTab(tab, { ...prev, selectedTags: prev.selectedTags }))
    setCurrentPage(1)
  }

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

  const featuredFilters = useMemo<CommunityFilterOptions>(
    () => ({
      ...DEFAULT_FILTERS,
      status: 'open',
      hasBounty: true,
      sortBy: 'highestBounty',
    }),
    []
  )

  const featuredQuery = useQuery({
    queryKey: queryKeys.communityPosts({
      page: 1,
      limit: FEATURED_LIMIT,
      search: '',
      filters: featuredFilters,
      purpose: 'featured',
    }),
    queryFn: async () => {
      const query = buildCommunityPostsQuery(1, FEATURED_LIMIT, '', featuredFilters)
      return api.getCommunityPosts(query)
    },
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

  const handleTabChange = useCallback((tab: CommunityDiscoveryTab) => {
    setActiveTab(tab)
    setFilters((prev) =>
      filtersForDiscoveryTab(tab, {
        ...DEFAULT_FILTERS,
        selectedTags: prev.selectedTags,
      })
    )
    setCurrentPage(1)
    onTabChangeRef.current?.(tab)
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
    [listParams, queryClient]
  )

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setActiveTab(DEFAULT_DISCOVERY_TAB)
    setFilters(filtersFromTab(DEFAULT_DISCOVERY_TAB))
    setCurrentPage(1)
    onTabChangeRef.current?.(DEFAULT_DISCOVERY_TAB)
  }, [])

  const fetchPosts = useCallback(async () => {
    await listQuery.refetch()
  }, [listQuery])

  const fetchExportPosts = useCallback(async () => {
    const result = await exportQuery.refetch()
    return result.data?.posts ?? posts
  }, [exportQuery, posts])

  const tabBaseline = filtersFromTab(activeTab)
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    filters.selectedTags.length > 0 ||
    filters.status !== tabBaseline.status ||
    filters.dateRange !== tabBaseline.dateRange ||
    filters.hasBounty !== tabBaseline.hasBounty ||
    filters.unanswered !== tabBaseline.unanswered ||
    filters.sortBy !== tabBaseline.sortBy

  return {
    posts,
    featuredPosts: featuredQuery.data?.posts ?? [],
    loading: listQuery.isLoading && !listQuery.data,
    isRefreshing: listQuery.isFetching && !!listQuery.data,
    error: listQuery.error instanceof Error ? listQuery.error.message : listQuery.error ? 'Failed to load posts' : null,
    searchQuery,
    currentPage,
    filters,
    activeTab,
    totalPosts: pagination.total,
    totalPages: Math.max(1, pagination.totalPages || 1),
    hasActiveFilters,
    exportPosts: exportQuery.data?.posts ?? [],
    fetchPosts,
    fetchExportPosts,
    handleSearch,
    handlePageChange,
    handleFiltersChange,
    handleTabChange,
    handleVoteChange,
    clearFilters,
  }
}
