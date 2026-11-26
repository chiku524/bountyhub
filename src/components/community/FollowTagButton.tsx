import { FiCheck, FiPlus } from 'react-icons/fi'
import { useFollowedTags } from '../../hooks/useFollows'

interface FollowTagButtonProps {
  tagName: string
  className?: string
}

/** Follow a tag to see it in the Following feed and get alerts for new bounties in it. */
export function FollowTagButton({ tagName, className = '' }: FollowTagButtonProps) {
  const { signedIn, isFollowing, toggleFollow, isToggling } = useFollowedTags()
  if (!signedIn) return null

  const following = isFollowing(tagName)
  return (
    <button
      type="button"
      onClick={() => toggleFollow(tagName)}
      disabled={isToggling}
      aria-pressed={following}
      title={
        following
          ? `Unfollow ${tagName}`
          : `Follow ${tagName}: see it in your Following feed and get notified about new bounties`
      }
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60 @sm/main:text-sm ${
        following
          ? 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30'
          : 'border border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-500/40 dark:text-violet-300 dark:hover:bg-violet-500/10'
      } ${className}`}
    >
      {following ? <FiCheck className="h-3.5 w-3.5" aria-hidden /> : <FiPlus className="h-3.5 w-3.5" aria-hidden />}
      {following ? `Following ${tagName}` : `Follow ${tagName}`}
    </button>
  )
}
