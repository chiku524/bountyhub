import type { ReactNode } from 'react'
import { useRestoreFocusOnUnmount } from '../hooks/useRestoreFocus'

/** Wrap ephemeral overlays (modals); on unmount, focus returns to the previously focused element. */
export function FocusRestoreBoundary({ children }: { children: ReactNode }) {
  useRestoreFocusOnUnmount()
  return <>{children}</>
}
