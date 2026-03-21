import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'
import './desktop-launch.css'

const DESKTOP_INITIAL_PATH_KEY = 'desktop_initial_path'

/**
 * Main window first paint after splash closes — dice.express-style “Opening…” (no extra spinner).
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
      } catch {
        void 0
      }
      return user ? '/community' : '/login'
    }

    navigate(getTarget(), { replace: true })
  }, [loading, user, navigate])

  if (!isDesktopApp()) return null

  return (
    <div className="desktop-launch-screen">
      <div className="desktop-launch-screen__bg" aria-hidden />
      <div className="desktop-launch-screen__content">
        <div className="desktop-launch-screen__logo-wrap">
          <img
            src="/logo.svg"
            alt=""
            className="desktop-launch-screen__logo"
            width={72}
            height={72}
          />
        </div>
        <h1 className="desktop-launch-screen__title">BountyHub</h1>
        <p className="desktop-launch-screen__step">Opening…</p>
      </div>
    </div>
  )
}
