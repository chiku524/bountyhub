import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import {
  useBookmarkStatuses,
  type BookmarkStatusMap,
} from '../hooks/useBookmarkStatuses'

interface BookmarkStatusContextValue {
  statusMap: BookmarkStatusMap
  isLoading: boolean
  isBookmarked: (postId: string) => boolean
  setBookmarked: (postId: string, bookmarked: boolean) => void
  hasStatus: (postId: string) => boolean
  /** True when this tree is covered by a batch status fetch. */
  isBatched: true
}

const BookmarkStatusContext = createContext<BookmarkStatusContextValue | null>(null)

interface BookmarkStatusProviderProps {
  postIds: readonly string[]
  children: ReactNode
}

/**
 * Provides one batched bookmark-status map for all visible posts.
 * BookmarkButton consumes this when present and skips per-post status fetches.
 */
export function BookmarkStatusProvider({ postIds, children }: BookmarkStatusProviderProps) {
  const idsKey = postIds.join('|')
  const stableIds = useMemo(() => [...postIds], [idsKey])
  const batch = useBookmarkStatuses(stableIds)

  const value = useMemo<BookmarkStatusContextValue>(
    () => ({
      statusMap: batch.statusMap,
      isLoading: batch.isLoading,
      isBookmarked: batch.isBookmarked,
      setBookmarked: batch.setBookmarked,
      hasStatus: batch.hasStatus,
      isBatched: true,
    }),
    [batch.statusMap, batch.isLoading, batch.isBookmarked, batch.setBookmarked, batch.hasStatus]
  )

  return (
    <BookmarkStatusContext.Provider value={value}>
      {children}
    </BookmarkStatusContext.Provider>
  )
}

/** Returns batch bookmark context when inside BookmarkStatusProvider; otherwise null. */
export function useBookmarkStatusContext(): BookmarkStatusContextValue | null {
  return useContext(BookmarkStatusContext)
}
