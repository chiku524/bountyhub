import { useEffect, useRef } from 'react'
import { isDesktopApp } from '../utils/desktop'
import type { DesktopUpdatePhase } from '../contexts/DesktopUpdateContext'

/** Brief delay before running update check so the "Checking for updates" overlay can render */
const CHECK_ON_LOAD_DELAY_MS = 400
/** Re-check periodically while the app is open */
const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
const RESTART_DELAY_MS = 1800

type UpdaterContext = {
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  registerRetry: (fn: () => void) => void
} | null

/**
 * In the desktop app: on every launch, checks for updates after a short delay (initial load).
 * If a newer version is available, triggers auto-update (download → install → restart).
 * Also re-checks every 30 minutes while the app is open.
 * On failure, sets phase to 'error' so the overlay can show Retry/Continue.
 * Requires GitHub Release to have latest.json (and signed .sig assets) — set TAURI_PRIVATE_KEY in CI.
 *
 * Note: The effect must depend only on stable callbacks (setPhase, registerRetry), not on the
 * updateContext object reference. Otherwise phase changes (e.g. idle) cause re-renders, a new
 * object is passed in, the effect re-runs and schedules another initial check, causing a loop.
 */
export function useDesktopUpdater(updateContext: UpdaterContext) {
  const isRunningRef = useRef(false)
  // Depend on stable callbacks only — not on `updateContext` object identity. App passes a fresh
  // `{ setPhase, registerRetry }` every render; using that in the effect deps re-ran cleanup + a new
  // 400ms timer after every phase change (e.g. idle), causing "checking" to loop forever.
  const setPhase = updateContext?.setPhase
  const registerRetry = updateContext?.registerRetry

  useEffect(() => {
    if (!isDesktopApp() || !setPhase || !registerRetry) return

    async function checkAndInstall() {
      if (isRunningRef.current) return
      isRunningRef.current = true
      try {
        setPhase('checking')
        const { checkUpdate, installUpdate, onUpdaterEvent } = await import('@tauri-apps/api/updater')
        const { relaunch } = await import('@tauri-apps/api/process')
        const update = await checkUpdate()
        if (!update?.shouldUpdate) {
          setPhase('idle')
          return
        }

        setPhase('downloading')
        const unlisten = await onUpdaterEvent(({ status }) => {
          if (status.status === 'DONE') setPhase('restarting')
          else if (status.status === 'PENDING') setPhase('installing')
        })

        await installUpdate()
        unlisten()
        setPhase('restarting')
        await new Promise((r) => setTimeout(r, RESTART_DELAY_MS))
        await relaunch()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        // Don't block the app when there's no release JSON (updater not configured or no release yet)
        const isReleaseJsonError = /release\s*json|valid\s*release|could\s*not\s*fetch/i.test(message)
        if (isReleaseJsonError) {
          console.info('[BountyHub updater] No update endpoint or release:', message)
          setPhase('idle')
          return
        }
        setPhase('error', message)
        console.warn('[BountyHub updater]', message)
      } finally {
        isRunningRef.current = false
      }
    }

    registerRetry(checkAndInstall)

    // Run update check shortly after mount (overlay already showing "Checking for updates"), then periodically
    const onLoadTimer = setTimeout(checkAndInstall, CHECK_ON_LOAD_DELAY_MS)
    const interval = setInterval(checkAndInstall, CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(onLoadTimer)
      clearInterval(interval)
    }
  }, [setPhase, registerRetry])
}
