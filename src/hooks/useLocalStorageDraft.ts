import { useCallback, useEffect, useRef } from 'react'

/** Debounced JSON snapshot to localStorage. Use readDraft() once on mount to offer restore; clearDraft() after successful submit. */
export function useLocalStorageDraft<T extends object>(
  storageKey: string,
  value: T,
  enabled: boolean,
  debounceMs = 800,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value))
      } catch {
        /* quota or private mode */
      }
    }, debounceMs)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [storageKey, value, enabled, debounceMs])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const readDraft = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }, [storageKey])

  return { clearDraft, readDraft }
}
