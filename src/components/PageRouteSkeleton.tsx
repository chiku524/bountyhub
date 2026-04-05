import { PostSkeleton } from './LoadingSpinner'

/**
 * Layout-aware skeleton for lazy route loading (matches community list feel).
 */
export function PageRouteSkeleton() {
  return (
    <div className="flex min-h-[50vh] flex-col px-3 py-6 @sm/main:px-5 @3xl/main:px-8" role="status" aria-label="Loading page">
      <span className="sr-only">Loading…</span>
      <div className="mb-6 h-8 max-w-xs animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700" />
      <div className="mb-4 h-10 max-w-md animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/50 p-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="py-3 sm:py-4">
            <PostSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
