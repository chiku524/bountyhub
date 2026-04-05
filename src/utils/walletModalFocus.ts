/** Remembers the focused element before opening the Solana wallet adapter modal; restored when it closes. */

let elementToRestore: HTMLElement | null = null

export function rememberFocusBeforeWalletModal(): void {
  const el = document.activeElement
  elementToRestore = el instanceof HTMLElement ? el : null
}

/** If nothing was stored yet, remember the current focus (safety net for `setVisible(true)` without an explicit remember call). */
export function rememberFocusBeforeWalletModalIfUnset(): void {
  if (elementToRestore !== null) return
  rememberFocusBeforeWalletModal()
}

export function restoreFocusAfterWalletModal(): void {
  const el = elementToRestore
  elementToRestore = null
  if (!el || !document.documentElement.contains(el) || typeof el.focus !== 'function') return
  try {
    el.focus({ preventScroll: true })
  } catch {
    try {
      el.focus()
    } catch {
      /* noop */
    }
  }
}
