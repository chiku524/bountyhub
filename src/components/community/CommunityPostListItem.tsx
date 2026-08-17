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
  density?: 'comfortable' | 'compact'
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

export const CommunityPostListItem = memo(function CommunityPostListItem({
  post,
  density = 'comfortable',
  onVoteChange,
}: CommunityPostListItemProps) {
  const compact = density === 'compact'
  const bounty = postHasBounty(post)
  const fresh = isNewPost(post.createdAt)
  const justPosted = isNewPost(post.createdAt, 6)
  const commentCount = post.commentCount ?? 0
  const authorHref = `/users/${post.author?.username || post.authorId}`
  const authorLabel = post.author?.username || `User ${post.authorId}`

  return (
    <li
      className={`relative border-l-[3px] ${
        bounty
          ? 'border-l-amber-500 dark:border-l-amber-400'
          : 'border-l-transparent'
      } ${justPosted ? 'bg-amber-50/60 dark:bg-amber-400/5' : ''}`}
    >
      <div className={`flex ${compact ? 'gap-2 px-3 py-2.5 @sm/main:px-4' : 'gap-3 px-3 py-3.5 @sm/main:gap-4 @sm/main:px-5'}`}>
        <div className={`flex shrink-0 items-start justify-center pt-0.5 ${compact ? 'w-10' : 'w-11 @sm/main:w-12'}`}>
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
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  to={`/posts/${post.id}`}
                  className={`font-semibold text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-100 ${
                    compact ? 'line-clamp-1 text-sm @sm/main:text-[15px]' : 'line-clamp-2 text-[15px] leading-snug @xl/main:text-base'
                  }`}
                >
                  {post.title}
                </Link>
                {fresh && <PostNewBadge />}
                <PostStatusBadge status={post.status} variant="quiet" />
              </div>
              {!compact && post.content?.trim() && (
                <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {post.content}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {bounty && post.reward != null && (
                <PostBountyBadge reward={post.reward} variant="emphasis" />
              )}
              <BookmarkButton postId={post.id} size="sm" />
            </div>
          </div>

          <div
            className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-neutral-500 dark:text-neutral-400 ${
              compact ? 'mt-1 text-xs' : 'mt-1.5 text-xs @sm/main:text-[13px]'
            }`}
          >
            <Link
              to={authorHref}
              className="inline-flex min-w-0 items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
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
              title={`${commentCount} comment${commentCount === 1 ? '' : 's'}`}
            >
              <FiMessageSquare className="h-3.5 w-3.5" aria-hidden />
              {commentCount === 0 ? 'No replies' : commentCount}
            </span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
                  ·
                </span>
                <PostTagList tags={post.tags} maxVisible={compact ? 1 : 2} variant="muted" />
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  )
})

export interface CommunityPostListProps {
  posts: Post[]
  density?: 'comfortable' | 'compact'
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

export const CommunityPostList = memo(function CommunityPostList({
  posts,
  density = 'comfortable',
  onVoteChange,
}: CommunityPostListProps) {
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {posts.map((post) => (
        <CommunityPostListItem
          key={post.id}
          post={post}
          density={density}
          onVoteChange={onVoteChange}
        />
      ))}
    </ul>
  )
})
