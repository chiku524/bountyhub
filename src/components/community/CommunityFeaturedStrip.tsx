import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FiZap } from 'react-icons/fi'
import type { Post } from '../../types'
import { ProfilePicture } from '../ProfilePicture'
import { postHasBounty } from './postCardShared'

export interface CommunityFeaturedStripProps {
  posts: Post[]
  title?: string
}

/**
 * Compact horizontal strip highlighting high-value / trending bounty questions.
 * Computed from a separate server fetch (open + hasBounty + highestBounty).
 */
export const CommunityFeaturedStrip = memo(function CommunityFeaturedStrip({
  posts,
  title = 'Trending now',
}: CommunityFeaturedStripProps) {
  const featured = (posts || [])
    .filter((p) => p && postHasBounty(p) && typeof p.title === 'string')
    .slice(0, 6)

  if (featured.length === 0) return null

  return (
    <section
      className="mb-5 rounded-xl border border-amber-200/80 bg-linear-to-br from-amber-50/90 via-white to-white p-3 dark:border-amber-500/25 dark:from-amber-950/30 dark:via-neutral-900 dark:to-neutral-900 @sm/main:mb-6 @sm/main:p-4"
      aria-labelledby="community-featured-heading"
    >
      <div className="mb-2.5 flex items-center gap-2">
        <FiZap className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
        <h2
          id="community-featured-heading"
          className="text-sm font-semibold text-neutral-900 dark:text-white"
        >
          {title}
        </h2>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Top open bounties</span>
      </div>

      <ul className="flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {featured.map((post) => {
          const authorLabel = post.author?.username || `User ${post.authorId}`
          const reward = post.reward ?? 0
          return (
            <li key={post.id} className="w-[min(220px,80vw)] shrink-0 snap-start @sm/main:w-[240px]">
              <Link
                to={`/posts/${post.id}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/80 dark:hover:border-amber-500/40"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                    {reward}{' '}
                    <span className="text-[10px] font-medium text-amber-600/90 dark:text-amber-400/90">
                      BBUX
                    </span>
                  </span>
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-700 dark:bg-green-600/30 dark:text-green-300">
                    Open
                  </span>
                </div>
                <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-neutral-900 dark:text-white">
                  {post.title}
                </p>
                <div className="mt-auto flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <ProfilePicture user={post.author} size="sm" />
                  <span className="truncate">{authorLabel}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
})
