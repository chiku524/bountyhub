import { useEffect } from 'react'
import { isDesktopApp } from '../utils/desktop'
import type { DesktopUpdatePhase } from '../contexts/DesktopUpdateContext'

/** Check for update this long after app opens (let the UI settle first) */
const CHECK_ON_LOAD_DELAY_MS = 1500
/** Then re-check periodically while the app is open */
const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
const RESTART_DELAY_MS = 1800

type UpdaterContext = {
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  registerRetry: (fn: () => void) => void
} | null

/**
 * In the desktop app: on open, checks for updates; if a newer version is available,
 * triggers auto-update (download → install → restart). Also re-checks every 30 minutes.
 * On failure, sets phase to 'error' so the overlay can show Retry/Continue.
 * Requires GitHub Release to have latest.json (and signed .sig assets) — set TAURI_PRIVATE_KEY in CI.
 */
export function useDesktopUpdater(updateContext: UpdaterContext) {
  useEffect(() => {
    if (!isDesktopApp() || !updateContext) return
    const { setPhase, registerRetry } = updateContext

    async function checkAndInstall() {
      try {
        const { checkUpdate, installUpdate, onUpdaterEvent } = await import('@tauri-apps/api/updater')
        const { relaunch } = await import('@tauri-apps/api/process')
        const update = await checkUpdate()
        if (!update?.shouldUpdate) return

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
        setPhase('error', message)
        console.warn('[BountyHub updater]', message)
      }
    }

    registerRetry(checkAndInstall)

    // Check on app open, then periodically
    const onLoadTimer = setTimeout(checkAndInstall, CHECK_ON_LOAD_DELAY_MS)
    const interval = setInterval(checkAndInstall, CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(onLoadTimer)
      clearInterval(interval)
    }
  }, [updateContext])
}
