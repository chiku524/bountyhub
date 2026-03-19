/**
 * Detect if the app is running inside the Tauri desktop shell.
 * Used to show desktop-specific UI (intro, portal home) instead of the website landing.
 */
export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}
