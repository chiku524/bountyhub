import { isDesktopApp } from './desktop'

/**
 * Thin wrappers around the Tauri plugins the desktop shell uses. Every call is a no-op (or a web
 * fallback) outside the desktop app, and never throws, so callers don't need their own guards.
 */

const CLOSE_TO_TRAY_KEY = 'bountyhub-desktop-close-to-tray'
const TRAY_HINT_SHOWN_KEY = 'bountyhub-desktop-tray-hint-shown'
const LAUNCHED_BEFORE_KEY = 'bountyhub-desktop-launched-before'

function readFlag(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeFlag(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
  }
}

/** True for absolute http(s)/mailto links that should leave the app rather than navigate the webview. */
export function isExternalHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.href)
    if (url.protocol === 'mailto:') return true
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    return url.origin !== window.location.origin
  } catch {
    return false
  }
}

/** Opens a URL in the user's default browser on desktop; a new tab on the web. */
export async function openExternal(url: string): Promise<void> {
  if (!isDesktopApp()) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  try {
    const { open } = await import('@tauri-apps/plugin-shell')
    await open(url)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export async function nativeNotificationPermission(): Promise<NotificationPermission> {
  try {
    const { isPermissionGranted } = await import('@tauri-apps/plugin-notification')
    return (await isPermissionGranted()) ? 'granted' : 'default'
  } catch {
    return 'denied'
  }
}

export async function requestNativeNotificationPermission(): Promise<NotificationPermission> {
  try {
    const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification')
    if (await isPermissionGranted()) return 'granted'
    return await requestPermission()
  } catch {
    return 'denied'
  }
}

/** Shows an OS notification from the desktop app (works while the window is hidden in the tray). */
export async function sendNativeNotification(title: string, body?: string): Promise<void> {
  try {
    const { sendNotification } = await import('@tauri-apps/plugin-notification')
    sendNotification({ title, body })
  } catch {
    /* plugin unavailable */
  }
}

let lastUnreadCount: number | null = null

/**
 * Mirrors the unread notification count onto the tray icon (badge dot, tooltip, macOS menu-bar count)
 * and the dock/taskbar badge. Skips the IPC when the count hasn't changed.
 */
export async function setDesktopUnreadCount(count: number): Promise<void> {
  if (!isDesktopApp()) return
  const next = Math.max(0, Math.floor(count))
  if (next === lastUnreadCount) return
  lastUnreadCount = next
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('set_unread_count', { count: next })
  } catch {
    /* older native shell without the command */
  }
}

export function getCloseToTray(): boolean {
  return readFlag(CLOSE_TO_TRAY_KEY) !== 'off'
}

/** Persists the preference and tells the native side what closing the window should do. */
export async function setCloseToTray(enabled: boolean): Promise<void> {
  writeFlag(CLOSE_TO_TRAY_KEY, enabled ? 'on' : 'off')
  await syncCloseToTray()
}

export async function syncCloseToTray(): Promise<void> {
  if (!isDesktopApp()) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('set_close_to_tray', { enabled: getCloseToTray() })
  } catch {
    /* older native shell without the command: it always hides to tray */
  }
}

/** Returns true the first time only, so the "still running in the tray" hint is shown once. */
export function consumeTrayHint(): boolean {
  if (readFlag(TRAY_HINT_SHOWN_KEY)) return false
  writeFlag(TRAY_HINT_SHOWN_KEY, '1')
  return true
}

/** True on the very first launch; marks later launches so the splash intro can be shorter. */
export function consumeFirstLaunch(): boolean {
  if (readFlag(LAUNCHED_BEFORE_KEY)) return false
  writeFlag(LAUNCHED_BEFORE_KEY, '1')
  return true
}
