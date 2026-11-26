import { useEffect, useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { api } from '../../utils/api'
import { useFollowedTags } from '../../hooks/useFollows'

const SUGGESTION_LIMIT = 12

/** Manage followed tags from the Following feed. */
export function FollowedTagsPanel() {
  const { followedTags, isLoading, toggleFollow, isToggling, error } = useFollowedTags()
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    api
      .getTags()
      .then((tags) => {
        if (!cancelled) setAllTags((tags || []).map((t) => t?.name).filter((n): n is string => Boolean(n)))
      })
      .catch(() => {
        if (!cancelled) setAllTags([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const followedNames = new Set(followedTags.map((t) => t.name))
  const suggestions = allTags.filter((name) => !followedNames.has(name)).slice(0, SUGGESTION_LIMIT)

  return (
    <section
      aria-label="Followed tags"
      className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Your feed</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Questions in tags you follow and questions you watch. You get notified when a followed tag gets a new
          bounty.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading followed tags…</p>
      ) : followedTags.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">You don't follow any tags yet. Pick a few below.</p>
      ) : (
        <ul className="flex flex-wrap gap-2" aria-label="Tags you follow">
          {followedTags.map((tag) => (
            <li key={tag.name}>
              <button
                type="button"
                onClick={() => toggleFollow(tag.name)}
                disabled={isToggling}
                className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-violet-700 disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-600 @sm/main:text-sm"
                aria-label={`Unfollow ${tag.name}`}
              >
                {tag.name}
                <FiX className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">Follow more tags</p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => toggleFollow(name)}
                  disabled={isToggling}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300 @sm/main:text-sm"
                  aria-label={`Follow ${name}`}
                >
                  <FiPlus className="h-3.5 w-3.5" aria-hidden />
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
