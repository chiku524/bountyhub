import { useEffect } from 'react'
import { isDesktopApp } from '../utils/desktop'
import {
  consumeTrayHint,
  isExternalHref,
  openExternal,
  sendNativeNotification,
  syncCloseToTray,
} from '../utils/desktopNative'

/**
 * Desktop-only glue between the webview and the OS:
 * - External links (GitHub, docs, release notes, user websites) open in the default browser.
 *   The webview otherwise ignores target="_blank" or navigates away from the app.
 * - Tells the native shell whether closing the window hides to the tray or quits.
 * - The first time the window hides to the tray, explains that BountyHub is still running.
 */
export function useDesktopIntegration() {
  useEffect(() => {
    if (!isDesktopApp()) return

    void syncCloseToTray()

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (!isExternalHref(href)) return
      e.preventDefault()
      void openExternal(anchor.href)
    }
    document.addEventListener('click', onClick)

    let unlisten: (() => void) | undefined
    let cancelled = false
    void import('@tauri-apps/api/event')
      .then(({ listen }) =>
        listen('window-hidden-to-tray', () => {
          if (!consumeTrayHint()) return
          void sendNativeNotification(
            'BountyHub is still running',
            'It keeps checking for answers and bounties in the tray. Change this in Settings → Desktop app.'
          )
        })
      )
      .then((u) => {
        if (cancelled) u()
        else unlisten = u
      })
      .catch(() => {})

    return () => {
      cancelled = true
      document.removeEventListener('click', onClick)
      unlisten?.()
    }
  }, [])
}
