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
        s.width >= MIN_WIDTH && s.width <= MAX_WIDTH &&
        s.height >= MIN_HEIGHT && s.height <= MAX_HEIGHT
      ) {
        return s
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function saveWindowStateToStorage(state: DesktopWindowState): void {
  try {
    window.localStorage.setItem(DESKTOP_WINDOW_STATE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}
