import type { Post } from '../../types'

export function postHasBounty(post: Post): boolean {
  return Boolean(post.reward && post.reward > 0)
}

export function postCardShellClass(post: Post, extra = ''): string {
  const bounty = postHasBounty(post)
  return [
    'group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200',
    'hover:border-indigo-400/70 hover:shadow-md dark:hover:border-indigo-400/50',
    bounty
      ? 'border-cyan-200 bg-linear-to-b from-cyan-50/90 to-white dark:border-cyan-400/30 dark:from-cyan-500/10 dark:to-neutral-800/90'
      : 'border-neutral-200 dark:border-neutral-600 dark:bg-neutral-800/80',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

export function PostStatusBadge({ status }: { status: Post['status'] }) {
  const styles =
    status === 'OPEN'
      ? 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white'
      : status === 'COMPLETED'
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white'
        : 'bg-neutral-100 text-neutral-700 dark:bg-gray-600 dark:text-white'

  return (
    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium @sm/main:py-1 ${styles}`}>
      {status}
    </span>
  )
}

export function PostBountyBadge({ reward }: { reward: number }) {
  return (
    <div className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-cyan-300 bg-linear-to-r from-cyan-100 to-blue-100 px-2 py-0.5 dark:border-cyan-400/40 dark:from-cyan-500/20 dark:to-blue-500/20 @sm/main:py-1">
      <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300" aria-hidden>
        💰
      </span>
      <span className="text-xs font-medium text-cyan-700 dark:text-cyan-200">{reward} BBUX</span>
    </div>
  )
}

export function PostTagList({
  tags,
  maxVisible = 2,
}: {
  tags?: string[]
  maxVisible?: number
}) {
  if (!tags || tags.length === 0) return null

  const visible = tags.slice(0, maxVisible)
  const overflow = tags.length - maxVisible

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tagName, index) => (
        <span
          key={`${tagName}-${index}`}
          className="inline-flex items-center rounded-full border border-violet-300 bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/20 dark:text-violet-400 @sm/main:py-1"
        >
          {tagName}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:border-gray-500/40 dark:bg-gray-500/20 dark:text-gray-400 @sm/main:py-1">
          +{overflow}
        </span>
      )}
    </div>
  )
}
