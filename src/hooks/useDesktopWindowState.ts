import { useEffect, useRef } from 'react'
import { isDesktopApp } from '../utils/desktop'
import {
  DESKTOP_WINDOW_STATE_KEY,
  parseSavedWindowState,
  saveWindowStateToStorage,
  type DesktopWindowState,
} from '../utils/desktopWindowState'

const SAVE_INTERVAL_MS = 3000
const FULL_WIDTH = 1200
const FULL_HEIGHT = 800
const MIN_WIDTH = 800
const MIN_HEIGHT = 600

/**
 * Restores window size/position from localStorage when entering main app;
 * if none saved, sets default full size and centers. Also sets min size and
 * periodically saves current size/position for the next launch.
 */
export function useDesktopWindowState(isMainApp: boolean) {
  const hasInitialized = useRef(false)

  // Restore saved state or set default size + min size, once when entering main app
  useEffect(() => {
    if (!isDesktopApp() || !isMainApp) return
    if (hasInitialized.current) return
    hasInitialized.current = true

    let cancelled = false
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(DESKTOP_WINDOW_STATE_KEY) : null
    const saved = parseSavedWindowState(raw)

    async function init() {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const { invoke } = await import('@tauri-apps/api/tauri')
        const win = getCurrentWindow()
        const w = win as unknown as { setMinSize?: (size: { type: string; width: number; height: number }) => Promise<void> }

        if (saved) {
          await invoke('set_window_state', {
            width: saved.width,
            height: saved.height,
            x: saved.x,
            y: saved.y,
          })
        } else {
          await win.setSize({ type: 'Logical', width: FULL_WIDTH, height: FULL_HEIGHT })
          await win.center()
        }
        if (!cancelled && typeof w?.setMinSize === 'function') {
          await w.setMinSize({ type: 'Logical', width: MIN_WIDTH, height: MIN_HEIGHT })
        }
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[useDesktopWindowState] init', e)
      }
    }
    init()
    return () => { cancelled = true }
  }, [isMainApp])

  // Save current size/position periodically while in main app
  useEffect(() => {
    if (!isDesktopApp() || !isMainApp) return

    const interval = setInterval(() => {
      import('@tauri-apps/api/tauri')
        .then(({ invoke }) => invoke<DesktopWindowState>('get_window_state'))
        .then((state) => saveWindowStateToStorage(state))
        .catch((e) => {
          if (import.meta.env.DEV) console.debug('[useDesktopWindowState] save', e)
        })
    }, SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isMainApp])
}
