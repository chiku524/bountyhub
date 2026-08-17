import type { Post } from '../../types'

export function postHasBounty(post: Post): boolean {
  return Boolean(post.reward && post.reward > 0)
}

const NEW_POST_HOURS = 36

export function isNewPost(createdAt: string | Date, hours = NEW_POST_HOURS): boolean {
  const timestamp = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt.getTime()
  return Number.isFinite(timestamp) && Date.now() - timestamp < hours * 60 * 60 * 1000
}

export function PostNewBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
      New
    </span>
  )
}

/** Card-grid shell: title-first tile with a quiet bounty accent (not a full cyan wash). */
export function postCardShellClass(post: Post, extra = ''): string {
  const bounty = postHasBounty(post)
  return [
    'group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white',
    'shadow-sm transition-[border-color,box-shadow] duration-200',
    'hover:border-neutral-400 hover:shadow-md dark:bg-neutral-800/90 dark:hover:border-neutral-500',
    bounty
      ? 'border-neutral-200 border-l-[3px] border-l-amber-500 dark:border-neutral-600 dark:border-l-amber-400'
      : 'border-neutral-200 dark:border-neutral-600',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

const STATUS_LABEL: Record<Post['status'], string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
}

export function PostStatusBadge({
  status,
  variant = 'default',
}: {
  status: Post['status']
  /** Quiet: humanized label, muted chip. Hide “Open” (default state) in card feeds. */
  variant?: 'default' | 'quiet'
}) {
  if (variant === 'quiet') {
    if (status === 'OPEN') return null
    return (
      <span className="text-xs font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
        {STATUS_LABEL[status]}
      </span>
    )
  }

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

export function PostBountyBadge({
  reward,
  variant = 'default',
}: {
  reward: number
  /** Emphasis: amount-first, no emoji — for card grid. */
  variant?: 'default' | 'emphasis'
}) {
  if (variant === 'emphasis') {
    return (
      <span className="inline-flex items-baseline gap-1 text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-300">
        <span>{reward}</span>
        <span className="text-xs font-medium text-amber-600/90 dark:text-amber-400/90">BBUX</span>
      </span>
    )
  }

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
  variant = 'default',
}: {
  tags?: string[]
  maxVisible?: number
  variant?: 'default' | 'muted'
}) {
  if (!tags || tags.length === 0) return null

  const visible = tags.slice(0, maxVisible)
  const overflow = tags.length - maxVisible

  if (variant === 'muted') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {visible.map((tagName, index) => (
          <span
            key={`${tagName}-${index}`}
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            {tagName}
            {index < visible.length - 1 || overflow > 0 ? (
              <span className="text-neutral-300 dark:text-neutral-600"> ·</span>
            ) : null}
          </span>
        ))}
        {overflow > 0 && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">+{overflow}</span>
        )}
      </div>
    )
  }

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
