import { useEffect } from 'react'
import { isDesktopApp } from '../utils/desktop'
import type { DesktopUpdatePhase } from '../contexts/DesktopUpdateContext'

const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
const RESTART_DELAY_MS = 1800

/**
 * In the desktop app, checks for updates periodically. When an update is available,
 * shows the update overlay (downloading → installing → restarting), then relaunches.
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

    const initial = setTimeout(checkAndInstall, 3000)
    const interval = setInterval(checkAndInstall, CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [setUpdatePhase])
}
