import { useEffect } from 'react'
import { isDesktopApp } from '../utils/desktop'

const FULL_WIDTH = 1200
const FULL_HEIGHT = 800
const MIN_WIDTH = 800
const MIN_HEIGHT = 600

/**
 * When the app is in "main app" mode (not desktop intro, not update overlay),
 * ensure the Tauri window is full size and has a sensible minimum.
 * Intro and update overlay control their own small frameless size.
 */
export function useDesktopWindowSize(
  isMainApp: boolean
) {
  useEffect(() => {
    if (!isDesktopApp() || !isMainApp) return

    let cancelled = false
    async function expandToFull() {
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
        const { LogicalSize } = await import('@tauri-apps/api/dpi')
        const win = getCurrentWebviewWindow()
        if (cancelled) return
        await win.setSize(new LogicalSize(FULL_WIDTH, FULL_HEIGHT))
        await win.setMinSize(new LogicalSize(MIN_WIDTH, MIN_HEIGHT))
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[useDesktopWindowSize]', e)
      }
    }
    expandToFull()
    return () => { cancelled = true }
  }, [isMainApp])
}
