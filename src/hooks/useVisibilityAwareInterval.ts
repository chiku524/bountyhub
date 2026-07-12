import { useEffect, useRef } from 'react'

/**
 * Runs `callback` on an interval only while the document is visible.
 * Pauses when the tab is hidden and resumes (with an immediate tick) when visible again.
 */
export function useVisibilityAwareInterval(
  callback: () => void,
  delayMs: number | null,
  enabled = true
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled || delayMs == null || delayMs <= 0) return

    let intervalId: ReturnType<typeof setInterval> | null = null

    const tick = () => {
      callbackRef.current()
    }

    const start = () => {
      if (intervalId != null) return
      tick()
      intervalId = setInterval(tick, delayMs)
    }

    const stop = () => {
      if (intervalId == null) return
      clearInterval(intervalId)
      intervalId = null
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') start()
      else stop()
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [delayMs, enabled])
}
