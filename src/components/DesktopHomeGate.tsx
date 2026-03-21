import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAward } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'

/** Intro duration before transitioning to loading (VibeMiner-style: brief branded moment then load). */
const INTRO_DURATION_MS = 2400

/**
 * Desktop app on "/": intro animation (logo + wordmark + tagline) then smooth transition
 * to loading spinner, then redirect to /login or /community. Mimics VibeMiner flow
 * (MinimalShell → DesktopHomeGate) with a clear intro moment.
 */
export function DesktopHomeGate() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [phase, setPhase] = useState<'intro' | 'loading'>('intro')

  // After intro duration, transition to loading phase
  useEffect(() => {
    const t = setTimeout(() => setPhase('loading'), INTRO_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  // When in loading phase and auth is ready, redirect
  useEffect(() => {
    if (!isDesktopApp() || phase !== 'loading') return
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    navigate('/community', { replace: true })
  }, [phase, loading, user, navigate])

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
