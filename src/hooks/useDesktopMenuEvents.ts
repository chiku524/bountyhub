import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isDesktopApp } from '../utils/desktop'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { useAuth } from '../contexts/AuthProvider'

/**
 * Listens for tray / IPC events (about, preferences, updates, reload, logout, focus).
 */
export function useDesktopMenuEvents() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [aboutOpen, setAboutOpen] = useState(false)
  const updateContext = useDesktopUpdate()
  const unlistensRef = useRef<Array<() => void>>([])

  const handleCheckUpdates = useCallback(() => {
    if (updateContext?.registerRetry) {
      updateContext.setPhase('checking')
      updateContext.retryUpdate()
    }
  }, [updateContext])

  const handleMenuLogout = useCallback(async () => {
    if (user) {
      await logout()
    }
    navigate('/login', { replace: true })
  }, [user, logout, navigate])

  useEffect(() => {
    if (!isDesktopApp()) return
    unlistensRef.current = []
    import('@tauri-apps/api/event')
      .then((event) => {
        event.listen('menu-about', () => setAboutOpen(true)).then((u) => unlistensRef.current.push(u))
        event.listen('menu-preferences', () => navigate('/settings?tab=desktop')).then((u) => unlistensRef.current.push(u))
        event.listen('menu-check-updates', () => handleCheckUpdates()).then((u) => unlistensRef.current.push(u))
        event.listen('menu-reload', () => window.location.reload()).then((u) => unlistensRef.current.push(u))
        event
          .listen('menu-logout', () => {
            void handleMenuLogout()
          })
          .then((u) => unlistensRef.current.push(u))
        event
          .listen('instance-focus', () => {
            import('@tauri-apps/api/core')
              .then(({ invoke }) => invoke('focus_bountyhub'))
              .catch(() => {})
          })
          .then((u) => unlistensRef.current.push(u))
      })
      .catch((e) => import.meta.env.DEV && console.debug('[useDesktopMenuEvents]', e))
    return () => unlistensRef.current.forEach((fn) => fn())
  }, [navigate, handleCheckUpdates, handleMenuLogout])

  return {
    aboutOpen,
    setAboutOpen,
  }
}
