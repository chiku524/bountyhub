export function CommunityPostCardSkeleton() {
  return (
    <div className="flex h-full min-h-[15rem] animate-pulse overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-600">
      <div className="w-12 shrink-0 border-r border-neutral-100 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700/50 @sm/main:w-14" />
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-3 flex gap-2">
          <div className="h-5 w-14 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-5 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="mb-2 h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="mb-2 h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="mb-2 h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="mt-auto flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700">
          <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  )
}

export function CommunityPostCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 @md/main:grid-cols-2 @3xl/main:grid-cols-3 @sm/main:p-6">
      {[...Array(count)].map((_, i) => (
        <CommunityPostCardSkeleton key={i} />
      ))}
    </div>
  )
}
