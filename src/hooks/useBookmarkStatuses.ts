import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { api } from '../utils/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../contexts/AuthProvider'

export type BookmarkStatusMap = Record<string, boolean>

export function normalizePostIds(postIds: readonly string[]): string[] {
  return [...new Set(postIds.filter((id): id is string => typeof id === 'string' && id.length > 0))].sort()
}

export async function fetchBookmarkStatuses(postIds: string[]): Promise<BookmarkStatusMap> {
  if (postIds.length === 0) return {}
  const postIdsParam = encodeURIComponent(JSON.stringify(postIds))
  const data = await api.request<{ status?: BookmarkStatusMap }>(
    `/api/bookmarks/status?postIds=${postIdsParam}`
  )
  return data?.status && typeof data.status === 'object' ? data.status : {}
}

/**
 * Batch-fetch bookmark status for a page of posts (one request).
 * Prefer this over N parallel per-post status checks on feed views.
 */
export function useBookmarkStatuses(postIds: readonly string[], enabled = true) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const idsKey = useMemo(() => normalizePostIds(postIds).join(','), [postIds])
  const normalizedIds = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey])
  const userId = user?.id ?? ''
  const queryKey = queryKeys.bookmarkStatuses(userId, idsKey)

  const query = useQuery({
    queryKey,
    queryFn: () => fetchBookmarkStatuses(normalizedIds),
    enabled: Boolean(user) && enabled && normalizedIds.length > 0,
    staleTime: 60_000,
  })

  const statusMap: BookmarkStatusMap = query.data ?? {}

  const setBookmarked = useCallback(
    (postId: string, bookmarked: boolean) => {
      queryClient.setQueryData<BookmarkStatusMap>(queryKey, (prev) => ({
        ...(prev ?? {}),
        [postId]: bookmarked,
      }))
      queryClient.setQueriesData<BookmarkStatusMap>(
        { queryKey: ['bookmark-statuses', userId] },
        (prev) =>
          prev && Object.prototype.hasOwnProperty.call(prev, postId)
            ? { ...prev, [postId]: bookmarked }
            : prev
      )
    },
    [queryClient, queryKey, userId]
  )

  const isBookmarked = useCallback((postId: string) => Boolean(statusMap[postId]), [statusMap])

  const hasStatus = useCallback(
    (postId: string) =>
      normalizedIds.length === 0 ||
      Object.prototype.hasOwnProperty.call(statusMap, postId) ||
      query.isSuccess,
    [normalizedIds.length, statusMap, query.isSuccess]
  )

  return {
    statusMap,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isBookmarked,
    setBookmarked,
    hasStatus,
  }
}
