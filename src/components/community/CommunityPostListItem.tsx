import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'
import type { Post } from '../../types'
import { VoteButton } from '../VoteButton'
import { BookmarkButton } from '../BookmarkButton'
import { ProfilePicture } from '../ProfilePicture'
import { RelativeTime } from '../RelativeTime'
import { PostBountyBadge, PostStatusBadge, PostTagList, postHasBounty } from './postCardShared'

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
  const commentCount = post.commentCount ?? 0

  return (
    <li
      className={`${compact ? 'py-2 @sm/main:py-2.5' : 'py-3 @sm/main:py-4'} ${bounty ? 'rounded-lg border border-cyan-200 bg-linear-to-r from-cyan-50 to-blue-50 dark:border-cyan-400/30 dark:from-cyan-500/10 dark:to-blue-500/10' : ''}`}
    >
      <div className={`flex ${compact ? 'gap-2' : 'gap-2 @sm/main:gap-4'}`}>
        <div
          className={`flex shrink-0 items-center justify-center ${compact ? 'w-10 @sm/main:w-12' : 'w-12 @sm/main:w-16'}`}
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

        <div className="min-w-0 flex-1">
          <Link
            to={`/posts/${post.id}`}
            className={`block rounded-lg transition hover:bg-neutral-100 dark:hover:bg-neutral-700/40 ${compact ? 'p-1.5 @sm/main:p-2' : 'p-2'} ${bounty ? 'hover:bg-cyan-100 dark:hover:bg-cyan-500/10' : ''}`}
          >
            <div className="flex flex-col gap-2 @xl/main:flex-row @xl/main:items-start @xl/main:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-col gap-2 @sm/main:flex-row @sm/main:flex-wrap @sm/main:items-center">
                  <h2
                    className={`font-semibold text-neutral-900 dark:text-white ${compact ? 'line-clamp-1 text-sm @sm/main:text-base' : 'line-clamp-2 text-base @xl/main:text-xl'}`}
                  >
                    {post.title}
                  </h2>
                  {bounty && post.reward != null && <PostBountyBadge reward={post.reward} />}
                </div>
                <p
                  className={`text-neutral-500 dark:text-gray-400 ${compact ? 'mt-0.5 line-clamp-1 text-xs @sm/main:text-sm' : 'mt-1 line-clamp-2 text-sm @sm/main:text-base'}`}
                >
                  {post.content}
                </p>
                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-400 dark:text-gray-500 ${compact ? 'mt-1 text-xs' : 'mt-2 text-xs @sm/main:text-sm'}`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ProfilePicture user={post.author} size="sm" />
                    <span className="truncate">
                      <Link
                        to={`/users/${post.author?.username || post.authorId}`}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.author?.username || `User ${post.authorId}`}
                      </Link>
                    </span>
                  </span>
                  <RelativeTime date={post.createdAt} className="shrink-0" />
                  <span
                    className="inline-flex shrink-0 items-center gap-1"
                    title={`${commentCount} comment${commentCount === 1 ? '' : 's'}`}
                  >
                    <FiMessageSquare className="h-3.5 w-3.5" aria-hidden />
                    {commentCount}
                  </span>
                </div>
              </div>
              <div className={`flex flex-wrap items-center gap-2 ${compact ? 'gap-1.5' : ''}`}>
                <PostStatusBadge status={post.status} />
                <PostTagList tags={post.tags} maxVisible={compact ? 1 : 2} />
                <BookmarkButton postId={post.id} size="sm" />
              </div>
            </div>
          </Link>
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
