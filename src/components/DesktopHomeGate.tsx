import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAward } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { isDesktopApp } from '../utils/desktop'

const INTRO_DURATION_MS = 1800
const DESKTOP_INITIAL_PATH_KEY = 'desktop_initial_path'

/**
 * Frameless splash intro: logo + wordmark + tagline, then update check, then
 * close splash and show main window (dice.express / VibeMiner style).
 */
export function DesktopHomeGate() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const desktopUpdate = useDesktopUpdate()
  const [phase, setPhase] = useState<'intro' | 'loading'>('intro')
  const [introDone, setIntroDone] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!isDesktopApp()) {
      setIntroDone(true)
      return
    }
    const t = setTimeout(() => {
      setPhase('loading')
      setIntroDone(true)
    }, INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!introDone || !isDesktopApp()) return

    cancelledRef.current = false

    const getInitialPath = () => {
      if (!loading && user) return '/community'
      return '/login'
    }

    const run = async () => {
      try {
        const { checkUpdate, installUpdate, onUpdaterEvent } = await import('@tauri-apps/api/updater')
        const { relaunch } = await import('@tauri-apps/api/process')
        const { invoke } = await import('@tauri-apps/api/tauri')

        desktopUpdate?.setPhase('checking')
        const update = await checkUpdate()
        if (cancelledRef.current) return

        if (update?.shouldUpdate) {
          desktopUpdate?.setPhase('downloading')
          const unlisten = await onUpdaterEvent(({ status }) => {
            if (status.status === 'DONE') desktopUpdate?.setPhase('restarting')
            else if (status.status === 'PENDING') desktopUpdate?.setPhase('installing')
          })
          await installUpdate()
          unlisten()
          desktopUpdate?.setPhase('restarting')
          await new Promise((r) => setTimeout(r, 1800))
          await relaunch()
          return
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const isReleaseError = /release\s*json|valid\s*release|could\s*not\s*fetch/i.test(msg)
        if (isReleaseError) {
          desktopUpdate?.setPhase('idle')
        } else {
          desktopUpdate?.setPhase('error', msg)
          return
        }
      }

      if (cancelledRef.current) return

      const path = getInitialPath()
      try {
        localStorage.setItem(DESKTOP_INITIAL_PATH_KEY, path)
      } catch (_) {}
      await invoke('close_splash_and_show_main').catch(() => {})
    }

    run()
    return () => { cancelledRef.current = true }
  }, [introDone, loading, user, desktopUpdate?.setPhase])

  if (!isDesktopApp()) {
    if (phase === 'loading' && !loading) {
      if (!user) navigate('/login', { replace: true })
      else navigate('/community', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/80">
      {/* Intro: logo + wordmark + tagline (VibeMiner-style minimal shell → smooth transition) */}
      <div
        className={`flex flex-col items-center justify-center p-6 transition-all duration-500 ${
          phase === 'intro'
            ? 'opacity-100 scale-100'
            : 'opacity-0 pointer-events-none scale-95 absolute'
        }`}
        aria-hidden={phase !== 'intro'}
      >
        <div
          className={`flex flex-col items-center gap-2 ${phase === 'intro' ? 'animate-intro-slide-in' : ''}`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
            <FiAward className="h-7 w-7 text-white" aria-hidden />
          </div>
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            BountyHub
          </span>
          <p className="text-sm text-neutral-400 text-center leading-tight">
            Ask. Bounty. Earn.
          </p>
        </div>
      </div>

      {/* Loading: spinner after intro (smooth fade-in, then redirect) */}
      <div
        className={`flex flex-col items-center justify-center pt-6 transition-opacity duration-500 ${
          phase === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
        }`}
        aria-busy={phase === 'loading'}
        aria-live="polite"
      >
        <div
          className="h-10 w-10 shrink-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="mt-4 text-sm text-neutral-400">Loading…</p>
      </div>
    </main>
  )
}
