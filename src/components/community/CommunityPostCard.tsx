import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'
import type { Post } from '../../types'
import { VoteButton } from '../VoteButton'
import { BookmarkButton } from '../BookmarkButton'
import { ProfilePicture } from '../ProfilePicture'
import { RelativeTime } from '../RelativeTime'
import {
  postCardShellClass,
  postHasBounty,
  PostBountyBadge,
  PostStatusBadge,
  PostTagList,
} from './postCardShared'

export interface CommunityPostCardProps {
  post: Post
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

function firstImageUrl(post: Post): string | null {
  const image = post.media?.find((m) => m.type === 'image')
  if (!image) return null
  return image.thumbnailUrl || image.url || null
}

export const CommunityPostCard = memo(function CommunityPostCard({
  post,
  onVoteChange,
}: CommunityPostCardProps) {
  const bounty = postHasBounty(post)
  const commentCount = post.commentCount ?? 0
  const thumb = firstImageUrl(post)
  const authorHref = `/users/${post.author?.username || post.authorId}`
  const authorLabel = post.author?.username || `User ${post.authorId}`

  return (
    <article className={postCardShellClass(post)}>
      {/* Stretch link: whole card opens the post; interactive controls sit above it. */}
      <Link
        to={`/posts/${post.id}`}
        className="absolute inset-0 z-0"
        aria-label={post.title}
      />

      {thumb && (
        <div className="pointer-events-none relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900/60">
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <PostStatusBadge status={post.status} variant="quiet" />
            {bounty && post.reward != null && (
              <PostBountyBadge reward={post.reward} variant="emphasis" />
            )}
          </div>
          <div className="pointer-events-auto relative z-20 shrink-0">
            <BookmarkButton postId={post.id} size="sm" />
          </div>
        </div>

        <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-neutral-900 group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-100">
          {post.title}
        </h2>

        {post.content?.trim() && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {post.content}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-2">
            <PostTagList tags={post.tags} maxVisible={2} variant="muted" />
          </div>
        )}

        <div className="pointer-events-auto relative z-20 mt-auto flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          <Link
            to={authorHref}
            className="inline-flex min-w-0 items-center gap-1.5 font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfilePicture user={post.author} size="sm" />
            <span className="truncate">{authorLabel}</span>
          </Link>
          <RelativeTime date={post.createdAt} className="shrink-0" />
          <span
            className="inline-flex shrink-0 items-center gap-1 text-neutral-400 dark:text-neutral-500"
            title={`${commentCount} comment${commentCount === 1 ? '' : 's'}`}
          >
            <FiMessageSquare className="h-3.5 w-3.5" aria-hidden />
            <span>{commentCount}</span>
          </span>
          <div className="ml-auto shrink-0">
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
    </article>
  )
})

export interface CommunityPostCardGridProps {
  posts: Post[]
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

export const CommunityPostCardGrid = memo(function CommunityPostCardGrid({
  posts,
  onVoteChange,
}: CommunityPostCardGridProps) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-4 @md/main:grid-cols-2 @3xl/main:grid-cols-3 @sm/main:p-6">
      {posts.map((post) => (
        <li key={post.id} className="flex">
          <CommunityPostCard post={post} onVoteChange={onVoteChange} />
        </li>
      ))}
    </ul>
  )
}, (prevProps, nextProps) =>
  prevProps.posts === nextProps.posts && prevProps.onVoteChange === nextProps.onVoteChange)
