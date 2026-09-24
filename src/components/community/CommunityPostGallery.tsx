import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'
import type { Post } from '../../types'
import { VoteButton } from '../VoteButton'
import { BookmarkButton } from '../BookmarkButton'
import { ProfilePicture } from '../ProfilePicture'
import { RelativeTime } from '../RelativeTime'
import {
  firstImageUrl,
  isNewPost,
  postGalleryShellClass,
  postHasBounty,
} from './postCardShared'

export interface CommunityPostGalleryItemProps {
  post: Post
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

/** Stable gradient seeds so placeholder tiles feel varied but deterministic. */
const PLACEHOLDER_GRADIENTS = [
  'from-indigo-500/90 via-violet-500/80 to-fuchsia-500/70',
  'from-cyan-600/90 via-sky-500/80 to-indigo-500/70',
  'from-amber-500/90 via-orange-500/80 to-rose-500/70',
  'from-emerald-600/90 via-teal-500/80 to-cyan-500/70',
  'from-rose-500/90 via-pink-500/80 to-violet-500/70',
  'from-slate-600/90 via-neutral-600/80 to-zinc-500/70',
]

function placeholderGradient(postId: string): string {
  let hash = 0
  for (let i = 0; i < postId.length; i++) {
    hash = (hash * 31 + postId.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_GRADIENTS[Math.abs(hash) % PLACEHOLDER_GRADIENTS.length]
}

export const CommunityPostGalleryItem = memo(function CommunityPostGalleryItem({
  post,
  onVoteChange,
}: CommunityPostGalleryItemProps) {
  const bounty = postHasBounty(post)
  const fresh = isNewPost(post.createdAt)
  const commentCount = post.commentCount ?? 0
  const thumb = firstImageUrl(post)
  const authorHref = `/users/${post.author?.username || post.authorId}`
  const authorLabel = post.author?.username || `User ${post.authorId}`

  return (
    <article className={postGalleryShellClass(post)}>
      <Link
        to={`/posts/${post.id}`}
        className="absolute inset-0 z-0"
        aria-label={post.title}
      />

      <div className="pointer-events-none relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900/60">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-linear-to-br ${placeholderGradient(post.id)}`}
            aria-hidden
          />
        )}

        {/* Bottom scrim for title readability */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/35 to-transparent"
          aria-hidden
        />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {fresh && (
              <span className="inline-flex items-center rounded-full bg-amber-100/95 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 shadow-sm dark:bg-amber-300/90 dark:text-amber-950">
                New
              </span>
            )}
            {post.status !== 'OPEN' && (
              <span className="rounded-full bg-black/45 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                {post.status === 'COMPLETED' ? 'Completed' : 'Closed'}
              </span>
            )}
          </div>
          <div className="pointer-events-auto relative z-20 shrink-0">
            <BookmarkButton postId={post.id} size="sm" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 space-y-1.5 p-3">
          {bounty && post.reward != null && (
            <div className="pointer-events-none">
              <span className="inline-flex items-baseline gap-1 rounded-md bg-black/45 px-1.5 py-0.5 text-sm font-semibold tabular-nums text-amber-200 backdrop-blur-sm">
                <span>{post.reward}</span>
                <span className="text-[10px] font-medium text-amber-200/90">BBUX</span>
              </span>
            </div>
          )}
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-white drop-shadow-sm">
            {post.title}
          </h2>
        </div>
      </div>

      <div className="pointer-events-auto relative z-20 mt-auto flex items-center gap-2 border-t border-neutral-100 px-2.5 py-2 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        <Link
          to={authorHref}
          className="inline-flex min-w-0 items-center gap-1.5 font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <ProfilePicture user={post.author} size="sm" />
          <span className="truncate">{authorLabel}</span>
        </Link>
        <RelativeTime date={post.createdAt} className="hidden shrink-0 @sm/main:inline" />
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
    </article>
  )
})

export interface CommunityPostGalleryProps {
  posts: Post[]
  onVoteChange: (postId: string, newVotes: number, newUserVote?: number) => void
}

export const CommunityPostGallery = memo(function CommunityPostGallery({
  posts,
  onVoteChange,
}: CommunityPostGalleryProps) {
  return (
    <ul className="grid list-none grid-cols-2 gap-2.5 p-3 @md/main:grid-cols-3 @2xl/main:grid-cols-4 @sm/main:gap-3 @sm/main:p-5">
      {posts.map((post) => (
        <li key={post.id} className="flex min-h-0">
          <CommunityPostGalleryItem post={post} onVoteChange={onVoteChange} />
        </li>
      ))}
    </ul>
  )
}, (prevProps, nextProps) =>
  prevProps.posts === nextProps.posts && prevProps.onVoteChange === nextProps.onVoteChange)