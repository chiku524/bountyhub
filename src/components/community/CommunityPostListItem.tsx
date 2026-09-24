import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'
import type { Post } from '../../types'
import { VoteButton } from '../VoteButton'
import { BookmarkButton } from '../BookmarkButton'
import { ProfilePicture } from '../ProfilePicture'
import { RelativeTime } from '../RelativeTime'
import {
  PostBountyBadge,
  PostNewBadge,
  PostStatusBadge,
  PostTagList,
  isNewPost,
  postHasBounty,
} from './postCardShared'

export interface CommunityPostListItemProps {
  post: Post
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

export const CommunityPostListItem = memo(function CommunityPostListItem({
  post,
  onVoteChange,
}: CommunityPostListItemProps) {
  const bounty = postHasBounty(post)
  const fresh = isNewPost(post.createdAt)
  const justPosted = isNewPost(post.createdAt, 6)
  const commentCount = post.commentCount ?? 0
  const authorHref = `/users/${post.author?.username || post.authorId}`
  const authorLabel = post.author?.username || `User ${post.authorId}`
  const showBounty = bounty && post.reward != null

  return (
    <li
      className={`relative border-l-[3px] ${
        bounty
          ? 'border-l-amber-500 dark:border-l-amber-400'
          : 'border-l-transparent'
      } ${justPosted ? 'bg-amber-50/60 dark:bg-amber-400/5' : ''}`}
    >
      <div className="flex gap-3 px-3 py-3.5 @md/main:gap-4 @md/main:px-5">
        {/* Desktop (@md/main ≥448px): vertical votes. Phones at ~390px still match @sm (384px), so we use @md + max-sm. */}
        <div className="hidden w-12 shrink-0 items-start justify-center pt-0.5 max-sm:hidden @md/main:flex">
          <VoteButton
            itemId={post.id}
            itemType="post"
            voteType="quality"
            initialVotes={post.qualityUpvotes || 0}
            userVote={post.userVote || 0}
            onVoteChange={(newVotes, newUserVote) => onVoteChange(post.id, newVotes, newUserVote)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 @md/main:gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                {fresh && <PostNewBadge />}
                {/* Mobile: bounty sits with badges so the title can use full width */}
                {showBounty && (
                  <span className="max-sm:inline @md/main:hidden">
                    <PostBountyBadge reward={post.reward!} variant="emphasis" />
                  </span>
                )}
                <PostStatusBadge status={post.status} variant="quiet" />
              </div>
              <Link
                to={`/posts/${post.id}`}
                className="block line-clamp-3 text-[15px] font-semibold leading-snug text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-100 @md/main:line-clamp-2 @xl/main:text-base"
              >
                {post.title}
              </Link>
              {post.content?.trim() && (
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 @md/main:line-clamp-1">
                  {post.content}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-start gap-2 pt-0.5">
              {/* Desktop: bounty beside bookmark (previous layout) */}
              {showBounty && (
                <span className="hidden max-sm:hidden @md/main:inline-flex">
                  <PostBountyBadge reward={post.reward!} variant="emphasis" />
                </span>
              )}
              <BookmarkButton postId={post.id} size="sm" />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400 @md/main:mt-1.5 @md/main:text-[13px]">
            <Link
              to={authorHref}
              className="inline-flex min-w-0 max-w-[40%] items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white @md/main:max-w-none"
            >
              <ProfilePicture user={post.author} size="sm" />
              <span className="truncate">{authorLabel}</span>
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
              ·
            </span>
            <RelativeTime date={post.createdAt} className="shrink-0" />
            <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
              ·
            </span>
            <span
              className="inline-flex shrink-0 items-center gap-1"
              title={`${commentCount} answer${commentCount === 1 ? '' : 's'}`}
            >
              <FiMessageSquare className="h-3.5 w-3.5" aria-hidden />
              {commentCount === 0
                ? 'Unanswered'
                : `${commentCount} answer${commentCount === 1 ? '' : 's'}`}
            </span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="hidden text-neutral-300 dark:text-neutral-600 @md/main:inline" aria-hidden>
                  ·
                </span>
                <span className="hidden @md/main:inline">
                  <PostTagList tags={post.tags} maxVisible={2} variant="muted" />
                </span>
              </>
            )}
            {/* Mobile: compact horizontal votes in the meta row */}
            <div className="ml-auto @md/main:hidden">
              <VoteButton
                itemId={post.id}
                itemType="post"
                voteType="quality"
                orientation="horizontal"
                initialVotes={post.qualityUpvotes || 0}
                userVote={post.userVote || 0}
                onVoteChange={(newVotes, newUserVote) => onVoteChange(post.id, newVotes, newUserVote)}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  )
})

export interface CommunityPostListProps {
  posts: Post[]
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

export const CommunityPostList = memo(function CommunityPostList({
  posts,
  onVoteChange,
}: CommunityPostListProps) {
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 [content-visibility:auto] [contain-intrinsic-size:auto_120px]">
      {posts.map((post) => (
        <CommunityPostListItem
          key={post.id}
          post={post}
          onVoteChange={onVoteChange}
        />
      ))}
    </ul>
  )
}, (prevProps, nextProps) =>
  prevProps.posts === nextProps.posts && prevProps.onVoteChange === nextProps.onVoteChange)
