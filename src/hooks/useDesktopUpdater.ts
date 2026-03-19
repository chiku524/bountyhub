import { useEffect } from 'react'
import { isDesktopApp } from '../utils/desktop'
import type { DesktopUpdatePhase } from '../contexts/DesktopUpdateContext'

/** Check for update this long after app opens (let the UI settle first) */
const CHECK_ON_LOAD_DELAY_MS = 1500
/** Then re-check periodically while the app is open */
const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
const RESTART_DELAY_MS = 1800

/**
 * In the desktop app: on open, checks for updates; if a newer version is available,
 * triggers auto-update (download → install → restart). Also re-checks every 30 minutes.
 */
export function useDesktopUpdater(setUpdatePhase: ((p: DesktopUpdatePhase) => void) | undefined) {
  useEffect(() => {
    if (!isDesktopApp()) return

    async function checkAndInstall() {
      try {
        const { checkUpdate, installUpdate, onUpdaterEvent } = await import('@tauri-apps/api/updater')
        const { relaunch } = await import('@tauri-apps/api/process')
        const update = await checkUpdate()
        if (!update?.shouldUpdate) return

        setUpdatePhase?.('downloading')
        const unlisten = await onUpdaterEvent(({ status }) => {
          if (status.status === 'DONE') setUpdatePhase?.('restarting')
          else if (status.status === 'PENDING') setUpdatePhase?.('installing')
        })

        await installUpdate()
        unlisten()
        setUpdatePhase?.('restarting')
        await new Promise((r) => setTimeout(r, RESTART_DELAY_MS))
        await relaunch()
      } catch (err) {
        setUpdatePhase?.('idle')
        if (import.meta.env.DEV) {
          console.debug('[updater]', err)
        }
      }
    }

    // Check on app open, then periodically
    const onLoadTimer = setTimeout(checkAndInstall, CHECK_ON_LOAD_DELAY_MS)
    const interval = setInterval(checkAndInstall, CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(onLoadTimer)
      clearInterval(interval)
    }
  }, [setUpdatePhase])
}
