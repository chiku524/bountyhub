import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { isDesktopApp } from '../utils/desktop'
import './desktop-splash.css'

const INTRO_DURATION_MS = 1800
const DESKTOP_INITIAL_PATH_KEY = 'desktop_initial_path'

/**
 * Frameless splash: dice.express-style intro (staggered logo / title / tagline) →
 * quiet update check (no overlay while checking) → optional download/install overlay → main window.
 */
export function DesktopHomeGate() {
  const { user, loading } = useAuth()
  const desktopUpdate = useDesktopUpdate()
  const [introDone, setIntroDone] = useState(false)
  const [postUpdate, setPostUpdate] = useState(false)
  const updateCancelledRef = useRef(false)

  useEffect(() => {
    if (!isDesktopApp()) {
      setIntroDone(true)
      return
    }
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  // After intro: run updater once; on any failure or no update, allow auth gate to close splash
  useEffect(() => {
    if (!introDone || !isDesktopApp()) return
    updateCancelledRef.current = false

    const setPhase = desktopUpdate?.setPhase
    const setPendingUpdateVersion = desktopUpdate?.setPendingUpdateVersion

    const run = async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const { relaunch } = await import('@tauri-apps/plugin-process')

        const update = await check()
        if (updateCancelledRef.current) return

        if (update) {
          setPendingUpdateVersion?.(update.version)
          setPhase?.('downloading')
          await update.downloadAndInstall((ev) => {
            if (ev.event === 'Finished') setPhase?.('installing')
          })
          setPhase?.('restarting')
          await relaunch()
          return
        }
      } catch {
        // dice.express: missing updater / network errors do not block the app
      }

      if (updateCancelledRef.current) return
      setPostUpdate(true)
    }

    void run()
    return () => {
      updateCancelledRef.current = true
    }
  }, [introDone, desktopUpdate?.setPhase, desktopUpdate?.setPendingUpdateVersion])

  // Close splash only after auth has settled (web app) or updater finished without relaunch
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
      <div className="desktop-splash__animated-bg" aria-hidden />
      <div className="desktop-splash__content">
        <div className="desktop-splash__symbol" aria-hidden>
          <img src="/logo.svg" alt="" width={72} height={72} />
        </div>
        <h1 className="desktop-splash__name">BountyHub</h1>
        <p className="desktop-splash__tagline">Ask. Bounty. Earn.</p>
      </div>
    </main>
  )
}
