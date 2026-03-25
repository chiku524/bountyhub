import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { PageMetadata } from '../components/PageMetadata'
import { isDesktopApp } from '../utils/desktop'
import { logoUrl } from '../utils/logoUrl'
import '../components/desktop-splash.css'

const INTRO_DURATION_MS = 2400
const TRANSFORM_DURATION_MS = 650
const WELCOME_BACK_MS = 400
const DESKTOP_INTRO_SEEN_KEY = 'desktop-intro-seen'

function getIntroSeen(): boolean {
  if (typeof window === 'undefined' || !isDesktopApp()) return false
  if (import.meta.env.DEV) return false
  return !!window.localStorage.getItem(DESKTOP_INTRO_SEEN_KEY)
}

/** Actual window size during intro (single small window; large enough for logo + wordmark + tagline + safe area) */
const INTRO_WINDOW_WIDTH = 360
const INTRO_WINDOW_HEIGHT = 400
const FULL_WINDOW_WIDTH = 1200
const FULL_WINDOW_HEIGHT = 800

export default function DesktopHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'intro' | 'transform' | 'portal'>(() => {
    if (typeof window === 'undefined' || !isDesktopApp()) return 'intro'
    if (import.meta.env.DEV) return 'intro'
    return window.localStorage.getItem(DESKTOP_INTRO_SEEN_KEY) ? 'portal' : 'intro'
  })
  const [portalVisible, setPortalVisible] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)

  // Center window as soon as desktop home loads (handles initial position before phase effect)
  useEffect(() => {
    if (!isDesktopApp()) return
    let cancelled = false
    import('@tauri-apps/api/webviewWindow').then(({ getCurrentWebviewWindow }) => {
      if (!cancelled) getCurrentWebviewWindow().center()
    }).catch((e) => { if (import.meta.env.DEV) console.debug('[DesktopHome] initial center', e) })
    return () => { cancelled = true }
  }, [])

  // Resize and center the actual Tauri window: small during intro/transform, full when portal.
  // Portal (login/register) is only shown after the window has expanded so the small window only ever shows intro or update overlay.
  useEffect(() => {
    if (!isDesktopApp()) return

    let cancelled = false
    async function setWindowSizeAndCenter(width: number, height: number) {
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
        const { LogicalSize } = await import('@tauri-apps/api/dpi')
        if (cancelled) return
        const win = getCurrentWebviewWindow()
        await win.setSize(new LogicalSize(width, height))
        if (cancelled) return
        await win.center()
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[DesktopHome] setSize/center', e)
      }
    }

    if (phase === 'intro' || phase === 'transform') {
      void setWindowSizeAndCenter(INTRO_WINDOW_WIDTH, INTRO_WINDOW_HEIGHT)
    }
    return () => { cancelled = true }
  }, [phase])

  useEffect(() => {
    if (phase !== 'intro') return
    const t = setTimeout(() => setPhase('transform'), INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'transform') return
    const t = setTimeout(() => setPhase('portal'), TRANSFORM_DURATION_MS)
    return () => clearTimeout(t)
  }, [phase])


  // When portal phase and user is logged in: brief "Welcome back" then navigate to app home
  useEffect(() => {
    if (phase !== 'portal' || !user) return
    setShowWelcomeBack(true)
    const t = setTimeout(() => {
      navigate('/community', { replace: true })
    }, WELCOME_BACK_MS)
    return () => clearTimeout(t)
  }, [phase, user, navigate])

  // When portal: expand window and reveal sign-in portal. Always show portal even if resize/center fails.
  useEffect(() => {
    if (!isDesktopApp() || phase !== 'portal') return
    let cancelled = false
    async function expand() {
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
        const { LogicalSize } = await import('@tauri-apps/api/dpi')
        const win = getCurrentWebviewWindow()
        await win.setSize(new LogicalSize(FULL_WINDOW_WIDTH, FULL_WINDOW_HEIGHT))
        await win.center()
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[DesktopHome] expand', e)
      }
      if (!cancelled) setPortalVisible(true)
    }
    expand()
    return () => { cancelled = true }
  }, [phase])

  // Mark intro as seen only after portal has been visible so next launch can skip intro
  useEffect(() => {
    if (phase !== 'portal' || !isDesktopApp()) return
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DESKTOP_INTRO_SEEN_KEY, '1')
      } catch {
        // localStorage may be disabled or full; ignore
      }
    }, 800)
    return () => clearTimeout(t)
  }, [phase])

  // Logged-in + intro already seen: skip straight to app home
  if (user && getIntroSeen()) {
    return <Navigate to="/community" replace />
  }

  return (
    <>
      <PageMetadata
        title="BountyHub – Sign in"
        description="Sign in or create an account to use BountyHub on desktop."
      />
      {/* Single full-viewport background; the actual window is small then full (no inner fake window) */}
      <div className="desktop-intro-canvas flex flex-col items-center justify-center">
        {/* Welcome back: brief message when logged-in user transitions to app home */}
        {showWelcomeBack && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0f]/95 animate-fade-in">
            <div className="flex flex-col items-center gap-3 animate-intro-slide-in">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-neutral-800/90 shadow-lg ring-1 ring-white/15">
                <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" width={48} height={48} aria-hidden />
              </div>
              <p className="text-lg font-medium bg-gradient-to-r from-cyan-200 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                Welcome back
              </p>
            </div>
          </div>
        )}
        {/* Intro: logo + wordmark + tagline — vibeminer-style opacity + translateY entrance */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center p-6 transition-all duration-500 ${
            phase === 'intro'
              ? 'opacity-100 scale-100'
              : 'opacity-0 pointer-events-none scale-95 absolute'
          }`}
          aria-hidden={phase !== 'intro'}
        >
          <div
            className={`flex flex-col items-center gap-2 ${phase === 'intro' ? 'animate-intro-slide-in' : ''}`}
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-neutral-800/90 shadow-lg shadow-black/20 ring-1 ring-white/15">
              <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" width={48} height={48} aria-hidden />
            </div>
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              BountyHub
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-tight">
              Ask. Bounty. Earn.
            </p>
          </div>
        </div>

        {/* Portal: sign in / register — vibeminer-style entrance after window expands */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center transition-all duration-500 ${
            portalVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`flex flex-col items-center gap-8 rounded-2xl border border-cyan-500/20 dark:border-violet-500/30 bg-neutral-900/95 px-10 py-12 shadow-2xl backdrop-blur-sm ${
              portalVisible ? 'animate-intro-slide-in-delay' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-neutral-800/90 shadow-lg shadow-black/20 ring-1 ring-white/15">
                <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" width={48} height={48} aria-hidden />
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
