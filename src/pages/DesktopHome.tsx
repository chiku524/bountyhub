import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FiAward } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { PageMetadata } from '../components/PageMetadata'
import { isDesktopApp } from '../utils/desktop'

const INTRO_DURATION_MS = 2400
const TRANSFORM_DURATION_MS = 650
const PORTAL_APPEAR_MS = 400

/** Actual window size during intro (single small window, not an inner fake window) */
const INTRO_WINDOW_WIDTH = 200
const INTRO_WINDOW_HEIGHT = 220
const FULL_WINDOW_WIDTH = 1200
const FULL_WINDOW_HEIGHT = 800

export default function DesktopHome() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<'intro' | 'transform' | 'portal'>('intro')
  const [portalVisible, setPortalVisible] = useState(false)

  // Resize the actual Tauri window: small during intro/transform, full when portal
  useEffect(() => {
    if (!isDesktopApp()) return

    async function setWindowSize(width: number, height: number) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        await win.setSize({ type: 'Logical', width, height })
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[DesktopHome] setWindowSize', e)
      }
    }

    if (phase === 'intro' || phase === 'transform') {
      setWindowSize(INTRO_WINDOW_WIDTH, INTRO_WINDOW_HEIGHT)
    } else if (phase === 'portal') {
      setWindowSize(FULL_WINDOW_WIDTH, FULL_WINDOW_HEIGHT)
    }
  }, [phase])

  useEffect(() => {
    const t = setTimeout(() => setPhase('transform'), INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'transform') return
    const t = setTimeout(() => setPhase('portal'), TRANSFORM_DURATION_MS)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'portal') return
    const t = setTimeout(() => setPortalVisible(true), 80)
    return () => clearTimeout(t)
  }, [phase])

  if (user) {
    return <Navigate to="/community" replace />
  }

  return (
    <>
      <PageMetadata
        title="BountyHub – Sign in"
        description="Sign in or create an account to use BountyHub on desktop."
      />
      {/* Single full-viewport background; the actual window is small then full (no inner fake window) */}
      <div className="fixed inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/80">
        {/* Intro: logo + wordmark + tagline */}
        <div
          className={`flex flex-col items-center justify-center transition-all duration-500 ${
            phase === 'intro'
              ? 'opacity-100 scale-100'
              : 'opacity-0 pointer-events-none scale-95 absolute'
          }`}
          aria-hidden={phase !== 'intro'}
        >
          <div
            className="flex flex-col items-center gap-2"
            style={{
              animation: phase === 'intro' ? 'desktop-intro 1.4s ease-out both' : 'none',
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
              <FiAward className="h-6 w-6 text-white" aria-hidden />
            </div>
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              BountyHub
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-tight">
              Ask. Bounty. Earn.
            </p>
          </div>
        </div>

        {/* Portal: sign in / register (after window expands) */}
        <div
          className={`flex flex-col items-center justify-center transition-all duration-500 ${
            portalVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`flex flex-col items-center gap-8 rounded-2xl border border-cyan-500/20 dark:border-violet-500/30 bg-neutral-900/95 px-10 py-12 shadow-2xl backdrop-blur-sm ${
              portalVisible ? 'animate-scale-in' : 'opacity-0'
            }`}
            style={{ animationDuration: `${PORTAL_APPEAR_MS}ms` }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
                <FiAward className="h-6 w-6 text-white" aria-hidden />
              </div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-200 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                Welcome to BountyHub
              </h2>
            </div>
            <p className="text-center text-sm text-neutral-400 max-w-xs">
              Sign in or create an account to post bounties, answer questions, and earn rewards.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center rounded-xl border border-cyan-500/40 bg-neutral-800/80 px-6 py-3.5 font-medium text-neutral-200 transition hover:border-cyan-400/60 hover:bg-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
