/**
 * Keys and types for persisting desktop window state (size/position) in localStorage.
 * Used only when running inside the Tauri desktop app.
 */

export const DESKTOP_WINDOW_STATE_KEY = 'desktop-window-state'

export interface DesktopWindowState {
  width: number
  height: number
  x: number
  y: number
}

const MIN_WIDTH = 800
const MIN_HEIGHT = 600
const MAX_WIDTH = 4096
const MAX_HEIGHT = 4096
/** Keep at least this many pixels of the window on-screen after restore. */
const MIN_VISIBLE = 100

export function parseSavedWindowState(raw: string | null): DesktopWindowState | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as DesktopWindowState).width === 'number' &&
      typeof (parsed as DesktopWindowState).height === 'number' &&
      typeof (parsed as DesktopWindowState).x === 'number' &&
      typeof (parsed as DesktopWindowState).y === 'number'
    ) {
      const s = parsed as DesktopWindowState
      if (
        s.width >= MIN_WIDTH &&
        s.width <= MAX_WIDTH &&
        s.height >= MIN_HEIGHT &&
        s.height <= MAX_HEIGHT
      ) {
        return s
      }
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * Clamp window geometry so at least MIN_VISIBLE pixels remain on the given screen.
 * Pass screen size explicitly for testability; falls back to window.screen when omitted.
 */
export function clampWindowStateToScreen(
  state: DesktopWindowState,
  screenWidth?: number,
  screenHeight?: number
): DesktopWindowState {
  const screenW =
    screenWidth ??
    (typeof window !== 'undefined' ? window.screen?.availWidth : undefined) ??
    1920
  const screenH =
    screenHeight ??
    (typeof window !== 'undefined' ? window.screen?.availHeight : undefined) ??
    1080

  const x = Math.min(Math.max(state.x, MIN_VISIBLE - state.width), screenW - MIN_VISIBLE)
  const y = Math.min(Math.max(state.y, 0), screenH - MIN_VISIBLE)

  return { ...state, x, y }
}

export function saveWindowStateToStorage(state: DesktopWindowState): void {
  try {
    window.localStorage.setItem(DESKTOP_WINDOW_STATE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}
