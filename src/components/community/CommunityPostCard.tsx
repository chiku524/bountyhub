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

export const CommunityPostCard = memo(function CommunityPostCard({
  post,
  onVoteChange,
}: CommunityPostCardProps) {
  const bounty = postHasBounty(post)
  const commentCount = post.commentCount ?? 0

  return (
    <article className={postCardShellClass(post)}>
      <div className="flex min-h-0 flex-1">
        <div
          className={`flex w-12 shrink-0 flex-col items-center justify-start border-r px-1 py-3 @sm/main:w-14 ${
            bounty
              ? 'border-cyan-100 bg-cyan-50/50 dark:border-cyan-500/20 dark:bg-cyan-500/5'
              : 'border-neutral-100 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-900/30'
          }`}
        >
          <VoteButton
            itemId={post.id}
            itemType="post"
            voteType="quality"
            initialVotes={post.qualityUpvotes || 0}
            userVote={post.userVote || 0}
            onVoteChange={(newVotes, newUserVote) => onVoteChange(post.id, newVotes, newUserVote)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2 px-3 pb-2 pt-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <PostStatusBadge status={post.status} />
              {bounty && post.reward != null && <PostBountyBadge reward={post.reward} />}
            </div>
            <BookmarkButton postId={post.id} size="sm" />
          </div>

          <Link
            to={`/posts/${post.id}`}
            className={`flex min-h-0 flex-1 flex-col px-3 pb-3 transition ${
              bounty ? 'hover:bg-cyan-50/60 dark:hover:bg-cyan-500/5' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/30'
            }`}
          >
            <h2 className="mb-2 line-clamp-2 text-base font-semibold text-neutral-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
              {post.title}
            </h2>

            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-500 dark:text-gray-400">
              {post.content}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-3">
                <PostTagList tags={post.tags} maxVisible={2} />
              </div>
            )}

            <div className="mt-auto flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-gray-400">
              <ProfilePicture user={post.author} size="sm" />
              <span className="min-w-0 truncate">
                <Link
                  to={`/users/${post.author?.username || post.authorId}`}
                  className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author?.username || `User ${post.authorId}`}
                </Link>
              </span>
              <RelativeTime date={post.createdAt} className="shrink-0" />
              <span
                className="ml-auto inline-flex shrink-0 items-center gap-1 text-neutral-400 dark:text-gray-500"
                title={`${commentCount} comment${commentCount === 1 ? '' : 's'}`}
              >
                <FiMessageSquare className="h-3.5 w-3.5" aria-hidden />
                <span>{commentCount}</span>
              </span>
            </div>
          </Link>
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
        <li key={post.id} className="flex min-h-[15rem]">
          <CommunityPostCard post={post} onVoteChange={onVoteChange} />
        </li>
      ))}
    </ul>
  )
}, (prevProps, nextProps) =>
  prevProps.posts === nextProps.posts && prevProps.onVoteChange === nextProps.onVoteChange)
