import { useCallback, useState } from 'react'
import { SearchBar } from '../components/SearchBar'
import { Pagination } from '../components/Pagination'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner, PostSkeleton } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { AdvancedFilters } from '../components/AdvancedFilters'
import { EmptyState } from '../components/EmptyState'
import { ExportButton } from '../components/ExportButton'
import { PageMetadata } from '../components/PageMetadata'
import { CommunityPostCardGrid } from '../components/community/CommunityPostCard'
import { CommunityPostCardSkeletonGrid } from '../components/community/CommunityPostCardSkeleton'
import { CommunityPostList } from '../components/community/CommunityPostListItem'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
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

export default function Community() {
  const {
    loading,
    isRefreshing,
    error,
    filters,
    filteredPosts,
    paginatedPosts,
    totalPages,
    currentPage,
    hasActiveFilters,
    fetchPosts,
    handleSearch,
    handlePageChange,
    handleFiltersChange,
    handleVoteChange,
    clearFilters,
  } = useCommunityPosts(10)

  const [postView, setPostView] = useState<CommunityPostView>(() => readStoredPostView())

  const handlePostViewChange = useCallback((view: CommunityPostView) => {
    setPostView(view)
    persistPostView(view)
    handlePageChange(1)
  }, [handlePageChange])

  if (error && !loading) {
    return (
      <PageContainer>
        <ErrorMessage message={error} onRetry={fetchPosts} />
      </PageContainer>
    )
  }

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
                <AdvancedFilters filters={filters} onFiltersChange={handleFiltersChange} />
                <ExportButton data={filteredPosts} filename="community-posts" />
              </>
            ) : undefined
          }
        />

        {isRefreshing && filteredPosts.length > 0 && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-3 py-2 text-sm text-indigo-900 dark:border-indigo-500/35 dark:bg-indigo-950/40 dark:text-indigo-100"
            role="status"
          >
            <LoadingSpinner size="sm" label={false} />
            <span>Updating posts…</span>
          </div>
        )}

        <div className="mb-4 @sm/main:mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search posts by title, content, or author..."
            className="w-full @md/main:max-w-md"
            debounceMs={300}
          />
        </div>

        {!loading && (
          <div className="mb-4 flex flex-col gap-3 @sm/main:flex-row @sm/main:items-center @sm/main:justify-between">
            <p className="text-sm text-neutral-500 @sm/main:text-base dark:text-gray-400">
              Showing {paginatedPosts.length} of {filteredPosts.length} posts
            </p>
            <div
              className="inline-flex w-full shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 @sm/main:w-auto dark:border-neutral-600 dark:bg-neutral-900/60"
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
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition @sm/main:flex-none @sm/main:px-3 @sm/main:text-sm ${
                    postView === id
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  <span className="hidden @sm/main:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={
            postView === 'card'
              ? ''
              : 'card border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
          }
        >
          {loading && (
            <div className={postView === 'card' ? '' : 'p-4 @sm/main:p-6'}>
              <div
                className={`mb-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 ${postView === 'card' ? 'px-4 pt-4 @sm/main:px-6' : ''}`}
              >
                <LoadingSpinner size="sm" />
                <span>Loading posts…</span>
              </div>
              {postView === 'card' ? (
                <CommunityPostCardSkeletonGrid />
              ) : (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {[...Array(5)].map((_, i) => (
                    <li key={i} className="py-3 @sm/main:py-4">
                      <PostSkeleton />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!loading && paginatedPosts.length === 0 && (
            <div className="p-4 @sm/main:p-8">
              <EmptyState
                icon="🔍"
                title={hasActiveFilters ? 'No posts match your criteria' : 'No posts yet'}
                description={
                  hasActiveFilters
                    ? 'Try different search terms or clear filters to see all posts.'
                    : 'Be the first to create a bounty or check back later.'
                }
                action={
                  hasActiveFilters ? (
                    <button type="button" onClick={clearFilters} className="btn-secondary">
                      Clear all filters
                    </button>
                  ) : undefined
                }
              />
            </div>
          )}

          {!loading && paginatedPosts.length > 0 && (
            <>
              {postView === 'card' ? (
                <CommunityPostCardGrid posts={paginatedPosts} onVoteChange={handleVoteChange} />
              ) : (
                <CommunityPostList
                  posts={paginatedPosts}
                  density={postView === 'compact' ? 'compact' : 'comfortable'}
                  onVoteChange={handleVoteChange}
                />
              )}

              <div
                className={`border-t border-neutral-200 p-4 @sm/main:p-6 dark:border-neutral-700 ${
                  postView === 'card'
                    ? 'mx-4 mb-4 rounded-xl border bg-white @sm/main:mx-6 dark:bg-neutral-800'
                    : ''
                }`}
              >
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
