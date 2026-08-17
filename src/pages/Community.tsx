import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEdit3 } from 'react-icons/fi'
import { Pagination } from '../components/Pagination'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner, PostSkeleton } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { EmptyState } from '../components/EmptyState'
import { PageMetadata } from '../components/PageMetadata'
import { CommunityPostCardGrid } from '../components/community/CommunityPostCard'
import { CommunityPostCardSkeletonGrid } from '../components/community/CommunityPostCardSkeleton'
import { CommunityPostList } from '../components/community/CommunityPostListItem'
import {
  CommunityDiscoveryBar,
  type CommunityPostView,
} from '../components/community/CommunityDiscoveryBar'
import { useCommunityPosts } from '../hooks/useCommunityPosts'

const COMMUNITY_POST_VIEW_KEY = 'bountyhub:community-post-view'

function readStoredPostView(): CommunityPostView {
  try {
    const raw = localStorage.getItem(COMMUNITY_POST_VIEW_KEY)
    if (raw === 'card') return 'card'
    if (raw === 'list' || raw === 'compact') return 'list'
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

function sortLabel(sortBy: string): string {
  switch (sortBy) {
    case 'oldest':
      return 'oldest first'
    case 'mostVoted':
      return 'most voted'
    case 'mostCommented':
      return 'most discussed'
    default:
      return 'newest first'
  }
}

export default function Community() {
  const {
    loading,
    isRefreshing,
    error,
    filters,
    posts,
    totalPosts,
    totalPages,
    currentPage,
    hasActiveFilters,
    exportPosts,
    fetchPosts,
    handleSearch,
    handlePageChange,
    handleFiltersChange,
    handleVoteChange,
    clearFilters,
  } = useCommunityPosts(12)

  const [postView, setPostView] = useState<CommunityPostView>(() => readStoredPostView())

  const handlePostViewChange = useCallback((view: CommunityPostView) => {
    setPostView(view)
    persistPostView(view)
  }, [])

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
          description="Discover new questions and open bounties worth answering"
          actions={
            <Link
              to="/posts/create"
              className="btn-primary inline-flex min-h-11 items-center gap-2 px-4"
            >
              <FiEdit3 className="h-4 w-4" aria-hidden />
              Ask a question
            </Link>
          }
        />

        <CommunityDiscoveryBar
          filters={filters}
          postView={postView}
          exportPosts={exportPosts.length > 0 ? exportPosts : posts}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          onPostViewChange={handlePostViewChange}
        />

        {isRefreshing && posts.length > 0 && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-3 py-2 text-sm text-indigo-900 dark:border-indigo-500/35 dark:bg-indigo-950/40 dark:text-indigo-100"
            role="status"
          >
            <LoadingSpinner size="sm" label={false} />
            <span>Updating questions…</span>
          </div>
        )}

        {!loading && (
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {totalPosts === 0
                ? 'No questions'
                : `${totalPosts} question${totalPosts === 1 ? '' : 's'}`}
              {totalPosts > 0 && (
                <span className="text-neutral-400 dark:text-neutral-500">
                  {' '}
                  · {sortLabel(filters.sortBy)}
                </span>
              )}
            </p>
          </div>
        )}

        <div
          className={
            postView === 'card'
              ? ''
              : 'overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
          }
        >
          {loading && (
            <div className={postView === 'card' ? '' : 'p-4 @sm/main:p-5'}>
              <div
                className={`mb-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 ${postView === 'card' ? 'px-4 pt-4 @sm/main:px-6' : ''}`}
              >
                <LoadingSpinner size="sm" />
                <span>Loading questions…</span>
              </div>
              {postView === 'card' ? (
                <CommunityPostCardSkeletonGrid />
              ) : (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {[...Array(6)].map((_, i) => (
                    <li key={i} className="py-3">
                      <PostSkeleton />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="p-4 @sm/main:p-8">
              <EmptyState
                icon="🔍"
                title={hasActiveFilters ? 'No questions match this view' : 'No questions yet'}
                description={
                  hasActiveFilters
                    ? 'Try another chip, a different search, or clear filters to see everything.'
                    : 'Be the first to ask the community a question.'
                }
                action={
                  hasActiveFilters ? (
                    <button type="button" onClick={clearFilters} className="btn-secondary">
                      Clear filters
                    </button>
                  ) : (
                    <Link to="/posts/create" className="btn-primary inline-flex items-center gap-2">
                      <FiEdit3 className="h-4 w-4" aria-hidden />
                      Ask a question
                    </Link>
                  )
                }
              />
            </div>
          )}

          {!loading && posts.length > 0 && (
            <>
              {postView === 'card' ? (
                <CommunityPostCardGrid posts={posts} onVoteChange={handleVoteChange} />
              ) : (
                <CommunityPostList posts={posts} onVoteChange={handleVoteChange} />
              )}

              {totalPages > 1 && (
                <div
                  className={`border-t border-neutral-200 p-4 @sm/main:p-5 dark:border-neutral-700 ${
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
              )}
            </>
          )}
        </div>
      </PageContainer>
    </>
  )
}
