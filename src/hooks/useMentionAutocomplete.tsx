import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type React from 'react'
import { api } from '../utils/api'
import { applyMention, findMentionQuery } from '../utils/mentions'
import { ProfilePicture } from '../components/ProfilePicture'

export interface MentionCandidate {
  id: string
  username: string
  profilePicture: string | null
}

type Field = HTMLInputElement | HTMLTextAreaElement

const cache = new Map<string, MentionCandidate[]>()

async function searchUsers(query: string, signal: AbortSignal): Promise<MentionCandidate[]> {
  const key = query.toLowerCase()
  const hit = cache.get(key)
  if (hit) return hit
  const res = await api.request<{ users: MentionCandidate[] }>(`/api/users/search?q=${encodeURIComponent(key)}&limit=8`, {
    signal,
    timeoutMs: 8000,
  })
  const users = Array.isArray(res.users) ? res.users : []
  cache.set(key, users)
  return users
}

/**
 * @mention autocomplete for a text input or textarea. Wire `onChange`, `onKeyDown`, `onSelect`
 * and `onBlur` from `fieldProps` (plus the `ref`), and render `list` next to the field inside a
 * `relative` container.
 */
export function useMentionAutocomplete({
  value,
  onChange,
  enabled = true,
  placement = 'below',
}: {
  value: string
  onChange: (value: string) => void
  enabled?: boolean
  /** `above` for inputs pinned to the bottom of the screen, like a chat composer. */
  placement?: 'above' | 'below'
}) {
  const ref = useRef<Field | null>(null)
  const listId = useId()
  const [query, setQuery] = useState<{ start: number; caret: number; text: string } | null>(null)
  const [fetched, setFetched] = useState<{ query: string; users: MentionCandidate[] }>({ query: '', users: [] })
  const [active, setActive] = useState(0)

  const sync = useCallback(
    (el: Field) => {
      if (!enabled) return
      const caret = el.selectionStart ?? el.value.length
      if (el.selectionEnd !== null && el.selectionEnd !== caret) {
        setQuery(null)
        return
      }
      const found = findMentionQuery(el.value, caret)
      setQuery(found ? { start: found.start, caret, text: found.query } : null)
    },
    [enabled]
  )

  // Fetch suggestions (debounced) as the partial username changes. Empty query shows nothing,
  // so a lone "@" does not list every user.
  const queryText = query?.text ?? null
  useEffect(() => {
    if (!queryText) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchUsers(queryText, controller.signal)
        .then((users) => {
          setFetched({ query: queryText, users })
          setActive(0)
        })
        .catch(() => {
          if (!controller.signal.aborted) setFetched({ query: queryText, users: [] })
        })
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [queryText])

  // Only show results for the partial name currently typed (never stale ones from a previous query).
  const results = queryText && fetched.query === queryText ? fetched.users : []
  const open = results.length > 0

  const close = useCallback(() => setQuery(null), [])

  const choose = useCallback(
    (candidate: MentionCandidate) => {
      if (!query) return
      const next = applyMention(value, query.start, query.caret, candidate.username)
      onChange(next.value)
      close()
      requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        el.focus()
        el.setSelectionRange(next.caret, next.caret)
      })
    },
    [query, value, onChange, close]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<Field>) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => (i - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        choose(results[Math.min(active, results.length - 1)])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        close()
      }
    },
    [open, results, active, choose, close]
  )

  const fieldProps = {
    ref: (el: Field | null) => {
      ref.current = el
    },
    onChange: (e: React.ChangeEvent<Field>) => {
      onChange(e.target.value)
      sync(e.target)
    },
    onKeyDown,
    onSelect: (e: React.SyntheticEvent<Field>) => sync(e.currentTarget),
    // Delay so a click on a suggestion lands before the list closes.
    onBlur: () => setTimeout(close, 120),
    role: enabled ? 'combobox' : undefined,
    'aria-autocomplete': enabled ? ('list' as const) : undefined,
    'aria-expanded': enabled ? open : undefined,
    'aria-controls': open ? listId : undefined,
    'aria-activedescendant': open ? `${listId}-${active}` : undefined,
  }

  const list = open ? (
    <ul
      id={listId}
      role="listbox"
      aria-label="Mention a user"
      className={`absolute left-0 z-50 max-h-64 w-64 max-w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-600 dark:bg-neutral-800 ${
        placement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
      }`}
    >
      {results.map((u, i) => (
        <li
          key={u.id}
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === active}
          // mousedown keeps focus in the field (no blur before the choice is applied)
          onMouseDown={(e) => {
            e.preventDefault()
            choose(u)
          }}
          onMouseEnter={() => setActive(i)}
          className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm ${
            i === active
              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-100'
              : 'text-neutral-800 dark:text-neutral-200'
          }`}
        >
          <ProfilePicture username={u.username} profilePicture={u.profilePicture ?? undefined} size="sm" />
          <span className="truncate">@{u.username}</span>
        </li>
      ))}
    </ul>
  ) : null

  return { fieldProps, list, open }
}
