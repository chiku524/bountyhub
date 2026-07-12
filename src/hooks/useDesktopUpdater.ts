import { useEffect, useRef } from 'react'
import { isDesktopApp } from '../utils/desktop'
import type { DesktopUpdatePhase } from '../contexts/DesktopUpdateContext'

/** Re-check periodically while the app is open */
const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

type UpdaterContext = {
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  setPendingUpdateVersion: (v: string | null) => void
  registerRetry: (fn: () => void) => void
  registerConfirm: (fn: () => void) => void
} | null

type UpdateHandle = {
  version: string
  downloadAndInstall: (
    onEvent?: (ev: { event: string }) => void
  ) => Promise<void>
}

/**
 * Checks for updates on mount and every 30 minutes.
 * When an update is found, sets phase to 'available' and waits for user confirmation
 * before download/install/relaunch.
 */
export function useDesktopUpdater(updateContext: UpdaterContext) {
  const isRunningRef = useRef(false)
  const pendingUpdateRef = useRef<UpdateHandle | null>(null)
  const setPhase = updateContext?.setPhase
  const setPendingUpdateVersion = updateContext?.setPendingUpdateVersion
  const registerRetry = updateContext?.registerRetry
  const registerConfirm = updateContext?.registerConfirm

  useEffect(() => {
    if (!isDesktopApp() || !setPhase || !setPendingUpdateVersion || !registerRetry || !registerConfirm) {
      return
    }
    const setPhaseFn = setPhase
    const setPendingFn = setPendingUpdateVersion

    async function installPending() {
      const update = pendingUpdateRef.current
      if (!update) {
        await checkForUpdate()
        return
      }
      if (isRunningRef.current) return
      isRunningRef.current = true
      try {
        const { relaunch } = await import('@tauri-apps/plugin-process')
        setPhaseFn('downloading')
        await update.downloadAndInstall((ev) => {
          if (ev.event === 'Finished') setPhaseFn('installing')
        })
        setPhaseFn('restarting')
        await relaunch()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setPhaseFn('error', message)
        console.warn('[BountyHub updater] install failed', message)
      } finally {
        isRunningRef.current = false
      }
    }

    async function checkForUpdate() {
      if (isRunningRef.current) return
      isRunningRef.current = true
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        setPhaseFn('checking')
        const update = await check()
        if (!update) {
          pendingUpdateRef.current = null
          setPhaseFn('idle')
          return
        }

        pendingUpdateRef.current = update
        setPendingFn(update.version)
        setPhaseFn('available')
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const isReleaseJsonError = /release\s*json|valid\s*release|could\s*not\s*fetch/i.test(message)
        const isAclDenied = /not allowed by ACL|plugin:updater\|check/i.test(message)
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

    registerRetry(checkForUpdate)
    registerConfirm(installPending)

    void checkForUpdate()
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [setPhase, setPendingUpdateVersion, registerRetry, registerConfirm])
}
