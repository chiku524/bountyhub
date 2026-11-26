import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useWatchStatus } from '../hooks/useFollows'

interface WatchButtonProps {
  postId: string
  className?: string
}

/** Watch a question to get notified about new answers, comments and an accepted answer. */
export function WatchButton({ postId, className = '' }: WatchButtonProps) {
  const { signedIn, watching, isLoading, toggleWatch, isToggling } = useWatchStatus(postId)
  if (!signedIn) return null

  const Icon = watching ? FiEyeOff : FiEye
  return (
    <button
      type="button"
      onClick={toggleWatch}
      disabled={isLoading || isToggling}
      aria-pressed={watching}
      title={
        watching
          ? 'Stop getting notified about this question'
          : 'Get notified about new answers, comments and an accepted answer'
      }
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition disabled:opacity-60 ${
        watching
          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25'
          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700'
      } ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {watching ? 'Watching' : 'Watch'}
    </button>
  )
}
