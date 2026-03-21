import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { isDesktopApp } from '../utils/desktop'

const QUIT_SHORTCUT = 'CommandOrControl+Q'
const PREFS_SHORTCUT = 'CommandOrControl+,'
const DEVTOOLS_SHORTCUT = 'CommandOrControl+Shift+I'

/**
 * Registers global keyboard shortcuts for the desktop app:
 * - Cmd/Ctrl+Q: Quit
 * - Cmd/Ctrl+,: Open Settings (Desktop app tab)
 * - Cmd/Ctrl+Shift+I (dev only): Toggle developer tools (invokes Rust open_devtools)
 */
export function useDesktopShortcuts() {
  const navigate = useNavigate()
  const unregRef = useRef<((id: string) => Promise<void>) | null>(null)

  useEffect(() => {
    if (!isDesktopApp()) return

    import('@tauri-apps/api/globalShortcut')
      .then(({ register, unregister }) => {
        unregRef.current = unregister
        register(QUIT_SHORTCUT, () => {
          import('@tauri-apps/api/process').then(({ exit }) => exit(0))
        }).catch(() => {})
        register(PREFS_SHORTCUT, () => navigate('/settings?tab=desktop')).catch(() => {})
        if (import.meta.env.DEV) {
          register(DEVTOOLS_SHORTCUT, () => {
            import('@tauri-apps/api/tauri').then(({ invoke }) => invoke('open_devtools').catch(() => {}))
          }).catch(() => {})
        }
      })
      .catch((e) => import.meta.env.DEV && console.debug('[useDesktopShortcuts]', e))

    return () => {
      const unreg = unregRef.current
      if (unreg) {
        unreg(QUIT_SHORTCUT).catch(() => {})
        unreg(PREFS_SHORTCUT).catch(() => {})
        if (import.meta.env.DEV) {
          unreg(DEVTOOLS_SHORTCUT).catch(() => {})
        }
      }
    }
  }, [navigate])
}
