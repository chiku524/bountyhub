import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { isDesktopApp } from '../utils/desktop'
import { logoUrl } from '../utils/logoUrl'
import './desktop-splash.css'

const INTRO_DURATION_MS = 1800
const DESKTOP_INITIAL_PATH_KEY = 'desktop_initial_path'

/**
 * Frameless splash: intro → quiet update check → if update available, wait for
 * Install/Later on the overlay → then main window. No silent auto-install.
 */
export function DesktopHomeGate() {
  const { user, loading } = useAuth()
  const desktopUpdate = useDesktopUpdate()
  const [introDone, setIntroDone] = useState(false)
  const [postUpdate, setPostUpdate] = useState(false)
  const updateCancelledRef = useRef(false)
  const pendingUpdateRef = useRef<{
    version: string
    downloadAndInstall: (onEvent?: (ev: { event: string }) => void) => Promise<void>
  } | null>(null)

  useEffect(() => {
    if (!isDesktopApp()) {
      setIntroDone(true)
      return
    }
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  // After intro: check once; offer install if available, otherwise continue
  useEffect(() => {
    if (!introDone || !isDesktopApp()) return
    updateCancelledRef.current = false

    const setPhase = desktopUpdate?.setPhase
    const setPendingUpdateVersion = desktopUpdate?.setPendingUpdateVersion
    const registerConfirm = desktopUpdate?.registerConfirm
    const registerRetry = desktopUpdate?.registerRetry

    const finishSplash = () => {
      if (updateCancelledRef.current) return
      setPostUpdate(true)
    }

    const installPending = async () => {
      const update = pendingUpdateRef.current
      if (!update) {
        finishSplash()
        return
      }
      try {
        const { relaunch } = await import('@tauri-apps/plugin-process')
        setPhase?.('downloading')
        await update.downloadAndInstall((ev) => {
          if (ev.event === 'Finished') setPhase?.('installing')
        })
        setPhase?.('restarting')
        await relaunch()
      } catch {
        setPhase?.('idle')
        finishSplash()
      }
    }

    registerConfirm?.(installPending)
    registerRetry?.(() => {
      void runCheck()
    })

    async function runCheck() {
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        setPhase?.('checking')
        const update = await check()
        if (updateCancelledRef.current) return

        if (update) {
          pendingUpdateRef.current = update
          setPendingUpdateVersion?.(update.version)
          setPhase?.('available')
          // Stay on splash until user chooses Install or Later (Later → dismiss → we watch phase)
          return
        }
      } catch {
        // Missing updater / network errors do not block the app
      }

      setPhase?.('idle')
      finishSplash()
    }

    void runCheck()
    return () => {
      updateCancelledRef.current = true
    }
  }, [
    introDone,
    desktopUpdate?.setPhase,
    desktopUpdate?.setPendingUpdateVersion,
    desktopUpdate?.registerConfirm,
    desktopUpdate?.registerRetry,
  ])

  // When user dismisses "available" on splash (Later), continue into the app
  useEffect(() => {
    if (!introDone || !isDesktopApp()) return
    if (desktopUpdate?.phase === 'idle' && !postUpdate && pendingUpdateRef.current) {
      // User dismissed an available update
      pendingUpdateRef.current = null
      setPostUpdate(true)
    }
  }, [desktopUpdate?.phase, introDone, postUpdate])

  // Close splash only after auth has settled and updater finished without relaunch
  useEffect(() => {
    if (!postUpdate || !isDesktopApp() || loading) return

    const path = user ? '/community' : '/login'
    try {
      localStorage.setItem(DESKTOP_INITIAL_PATH_KEY, path)
    } catch {
      void 0
    }

    void (async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('close_splash_and_show_main')
      } catch {
        void 0
      }
    })()
  }, [postUpdate, loading, user])

  if (!isDesktopApp()) return null

  return (
    <main className="desktop-splash" aria-busy={!postUpdate}>
      <div className="desktop-splash__content">
        <div className="desktop-splash__symbol" aria-hidden>
          <img src={logoUrl} alt="" width={72} height={72} />
        </div>
        <h1 className="desktop-splash__name">BountyHub</h1>
        <p className="desktop-splash__tagline">
          Build in public · Decentralized bounty platform
        </p>
      </div>
    </main>
  )
}
