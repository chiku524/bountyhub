import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { PageMetadata } from '../components/PageMetadata'

const INTRO_DURATION_MS = 2600
const TRANSFORM_DURATION_MS = 600
const PORTAL_APPEAR_MS = 400

export default function DesktopHome() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<'intro' | 'transform' | 'portal'>('intro')
  const [portalVisible, setPortalVisible] = useState(false)

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

  // Logged-in desktop users go straight to community
  if (user) {
    return <Navigate to="/community" replace />
  }

  const isMini = phase === 'intro' || phase === 'transform'
  const isExpanding = phase === 'transform'

  return (
    <>
      <PageMetadata
        title="BountyHub – Sign in"
        description="Sign in or create an account to use BountyHub on desktop."
      />
      <div className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden bg-neutral-950">
        {/* Mini-app window that expands into full app */}
        <div
          className={`flex flex-col overflow-hidden bg-neutral-900 shadow-2xl border border-neutral-700/80 ${
            isMini ? 'h-[300px] w-[420px] rounded-2xl' : 'h-full w-full rounded-none border-0'
          }`}
          style={{
            transition: `width ${TRANSFORM_DURATION_MS}ms ease-out, height ${TRANSFORM_DURATION_MS}ms ease-out, border-radius ${TRANSFORM_DURATION_MS}ms ease-out`,
          }}
        >
          {/* Title bar - visible in mini mode, fades in expanded */}
          <div
            className={`flex items-center gap-2 border-b border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5 shrink-0 ${
              isMini ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden border-0 py-0'
            }`}
            style={{
              transition: `opacity ${TRANSFORM_DURATION_MS * 0.5}ms ease-out`,
            }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
            <span className="ml-2 text-xs font-medium text-neutral-400">BountyHub</span>
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8">
            {/* Intro: logo + wordmark inside mini window */}
            <div
              className={`flex flex-col items-center justify-center transition-all duration-500 ${
                phase === 'intro'
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 pointer-events-none scale-95 absolute'
              }`}
              aria-hidden={phase !== 'intro'}
            >
              <div
                className="flex flex-col items-center gap-3"
                style={{
                  animation: phase === 'intro' ? 'desktop-intro 1.6s ease-out both' : 'none',
                }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/90 to-violet-500/90 shadow-lg shadow-cyan-500/20">
                  <span className="text-3xl font-bold text-white">B</span>
                </div>
                <h1 className="bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  BountyHub
                </h1>
                <p className="text-xs text-neutral-500">Decentralized bounty platform</p>
              </div>
            </div>

            {/* Portal: sign in / register (after expand) */}
            <div
              className={`flex flex-col items-center justify-center transition-all duration-500 ${
                portalVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className={`flex flex-col items-center gap-8 rounded-2xl border border-neutral-700/80 bg-neutral-900/90 px-10 py-12 shadow-2xl backdrop-blur-sm ${
                  portalVisible ? 'animate-scale-in' : 'opacity-0'
                }`}
                style={{ animationDuration: `${PORTAL_APPEAR_MS}ms` }}
              >
                <h2 className="text-2xl font-semibold text-white">
                  Welcome to BountyHub
                </h2>
                <p className="text-center text-sm text-neutral-400 max-w-xs">
                  Sign in or create an account to start earning bounties and rewards.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-[260px]">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center rounded-xl border border-neutral-600 bg-neutral-800/80 px-6 py-3.5 font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
