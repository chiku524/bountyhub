import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'

/**
 * Desktop app on "/": loading then redirect to /login or /community (VibeMiner-style).
 * No intro animation; same structure as VibeMiner DesktopHomeGate.
 */
export function DesktopHomeGate() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!isDesktopApp()) return
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    navigate('/community', { replace: true })
  }, [loading, user, navigate])

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center pt-6">
      <div
        className="h-10 w-10 shrink-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="mt-4 text-sm text-neutral-400">Loading…</p>
    </main>
  )
}
