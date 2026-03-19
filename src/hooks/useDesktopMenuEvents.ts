import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isDesktopApp } from '../utils/desktop'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'

/**
 * Listens for native menu events (Help → About, Edit → Preferences, Help → Check for Updates)
 * and exposes state/callbacks for the About dialog and navigation.
 */
export function useDesktopMenuEvents() {
  const navigate = useNavigate()
  const [aboutOpen, setAboutOpen] = useState(false)
  const updateContext = useDesktopUpdate()
  const unlistensRef = useRef<Array<() => void>>([])

  const handleCheckUpdates = useCallback(() => {
    if (updateContext?.registerRetry) {
      updateContext.setPhase('checking')
      updateContext.retryUpdate()
    }
  }, [updateContext])

  useEffect(() => {
    if (!isDesktopApp()) return
    unlistensRef.current = []
    import('@tauri-apps/api/event')
      .then((event) => {
        event.listen('menu-about', () => setAboutOpen(true)).then((u) => unlistensRef.current.push(u))
        event.listen('menu-preferences', () => navigate('/settings')).then((u) => unlistensRef.current.push(u))
        event.listen('menu-check-updates', () => handleCheckUpdates()).then((u) => unlistensRef.current.push(u))
      })
      .catch((e) => import.meta.env.DEV && console.debug('[useDesktopMenuEvents]', e))
    return () => unlistensRef.current.forEach((fn) => fn())
  }, [navigate, handleCheckUpdates])

  return {
    aboutOpen,
    setAboutOpen,
  }
}
