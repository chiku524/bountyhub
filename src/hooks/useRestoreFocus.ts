import { useEffect } from 'react'

function tryFocus(el: HTMLElement) {
  try {
    el.focus({ preventScroll: true })
  } catch {
    try {
      el.focus()
    } catch {
      /* noop */
    }
  }
}

/**
 * Restores focus to the element that was focused when this subtree mounted (typically when a modal/overlay closes).
 */
export function useRestoreFocusOnUnmount() {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    return () => {
      if (
        previous &&
        previous !== document.body &&
        document.documentElement.contains(previous) &&
        typeof previous.focus === 'function'
      ) {
        tryFocus(previous)
      }
    }
  }, [])
}

/**
 * When `open` becomes false, restores focus to the element that was focused when `open` became true.
 */
export function useRestoreFocusWhenOpen(open: boolean) {
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    return () => {
      if (
        previous &&
        previous !== document.body &&
        document.documentElement.contains(previous) &&
        typeof previous.focus === 'function'
      ) {
        tryFocus(previous)
      }
    }
  }, [open])
}
