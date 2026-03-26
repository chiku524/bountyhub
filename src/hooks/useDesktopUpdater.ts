import { useEffect, useRef } from 'react'
import { isDesktopApp } from '../utils/desktop'
import type { DesktopUpdatePhase } from '../contexts/DesktopUpdateContext'

/** Re-check periodically while the app is open */
const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

type UpdaterContext = {
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  setPendingUpdateVersion: (v: string | null) => void
  registerRetry: (fn: () => void) => void
} | null

/**
 * In the desktop app: checks for updates when the hook mounts (main window) and every 30 minutes.
 * If a newer version is available, triggers auto-update (download → install → restart).
 * Also re-checks every 30 minutes while the app is open.
 * On failure, sets phase to 'error' so the overlay can show Retry/Continue.
 * Requires GitHub Release to have latest.json (and signed .sig assets) — set TAURI_PRIVATE_KEY in CI.
 *
 * Note: The effect must depend only on stable callbacks from context, not on the updateContext
 * object reference, or phase changes can re-run the effect and loop.
 */
export function useDesktopUpdater(updateContext: UpdaterContext) {
  const isRunningRef = useRef(false)
  const setPhase = updateContext?.setPhase
  const setPendingUpdateVersion = updateContext?.setPendingUpdateVersion
  const registerRetry = updateContext?.registerRetry
  useEffect(() => {
    if (!isDesktopApp() || !setPhase || !setPendingUpdateVersion || !registerRetry) return
    const setPhaseFn = setPhase
    const setPendingFn = setPendingUpdateVersion
    const registerRetryFn = registerRetry

    async function checkAndInstall() {
      if (isRunningRef.current) return
      isRunningRef.current = true
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const { relaunch } = await import('@tauri-apps/plugin-process')
        const update = await check()
        if (!update) {
          setPhaseFn('idle')
          return
        }

        setPendingFn(update.version)
        setPhaseFn('downloading')
        await update.downloadAndInstall((ev) => {
          if (ev.event === 'Finished') setPhaseFn('installing')
        })
        setPhaseFn('restarting')
        await relaunch()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const isReleaseJsonError = /release\s*json|valid\s*release|could\s*not\s*fetch/i.test(message)
        const isAclDenied =
          /not allowed by ACL|plugin:updater\|check/i.test(message)
        if (isReleaseJsonError || isAclDenied) {
          if (import.meta.env.DEV) {
            console.debug('[BountyHub updater] Skipping update UI:', message)
          }
          setPhaseFn('idle')
          return
        }
        setPhaseFn('error', message)
        console.warn('[BountyHub updater]', message)
      } finally {
        isRunningRef.current = false
      }
    }

    registerRetryFn(checkAndInstall)

    void checkAndInstall()
    const interval = setInterval(checkAndInstall, CHECK_INTERVAL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [setPhase, setPendingUpdateVersion, registerRetry])
}
