/**
 * Detect if the app is running inside the Tauri desktop shell.
 * Used to show desktop-specific UI (intro, portal home) instead of the website landing.
 *
 * Tauri v2 only exposes `window.__TAURI__` when `app.withGlobalTauri` is true in tauri.conf.json.
 * We also fall back on the custom-protocol origin so routing works even if globals are missing.
 */
export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false
  if ('__TAURI__' in window) return true
  const { protocol, hostname } = window.location
  if (protocol === 'tauri:') return true
  if (hostname === 'tauri.localhost') return true
  return false
}
