import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAward } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'

const DESKTOP_INITIAL_PATH_KEY = 'desktop_initial_path'

/**
 * Main window entry after frameless splash closes. Redirects to stored path
 * or /community if logged in, /login otherwise (dice.express style).
 */
export function DesktopLaunch() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const doneRef = useRef(false)

  useEffect(() => {
    if (!isDesktopApp()) {
      const target = user ? '/community' : '/login'
      navigate(target, { replace: true })
      return
    }

    if (loading) return
    if (doneRef.current) return
    doneRef.current = true

    const getTarget = () => {
      try {
        const stored = localStorage.getItem(DESKTOP_INITIAL_PATH_KEY)
        if (stored) {
          localStorage.removeItem(DESKTOP_INITIAL_PATH_KEY)
          return stored
        }
      } catch (_) {}
      return user ? '/community' : '/login'
    }

    navigate(getTarget(), { replace: true })
  }, [isDesktopApp(), loading, user, navigate])

  if (!isDesktopApp()) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/80">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
          <FiAward className="h-7 w-7 text-white" aria-hidden />
        </div>
        <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300 bg-clip-text text-xl font-bold tracking-tight text-transparent">
          BountyHub
        </span>
        <p className="text-sm text-neutral-400">Opening…</p>
        <div className="mt-2 h-8 w-8 shrink-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" aria-hidden />
      </div>
    </div>
  )
}
