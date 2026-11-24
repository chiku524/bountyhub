import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isDesktopApp } from '../utils/desktop'

/**
 * In-window keyboard shortcuts for the desktop app:
 * - Cmd/Ctrl+Q: Quit
 * - Cmd/Ctrl+,: Open Settings (Desktop app tab)
 * - Cmd/Ctrl+Shift+I (dev only): Toggle developer tools (invokes Rust open_devtools)
 *
 * Cmd/Ctrl+K (command palette) is handled by CommandPalette itself.
 *
 * These are deliberately window-scoped keydown listeners, not OS-level global shortcuts:
 * global shortcuts fire (and swallow the keys) while any other app is focused, so Ctrl+Q in
 * another app would quit BountyHub and Ctrl+K / Ctrl+, would stop working elsewhere.
 */
export function useDesktopShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isDesktopApp()) return

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod || e.altKey) return
      const key = e.key.toLowerCase()

      if (key === 'q' && !e.shiftKey) {
        e.preventDefault()
        void import('@tauri-apps/plugin-process').then(({ exit }) => exit(0)).catch(() => {})
        return
      }
      if (key === ',' && !e.shiftKey) {
        e.preventDefault()
        navigate('/settings?tab=desktop')
        return
      }
      if (import.meta.env.DEV && key === 'i' && e.shiftKey) {
        e.preventDefault()
        void import('@tauri-apps/api/core')
          .then(({ invoke }) => invoke('open_devtools'))
          .catch(() => {})
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
}
