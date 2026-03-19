import { useEffect } from 'react'

/**
 * Calls onClose when the user presses Escape.
 * Only active when isActive is true (e.g. when modal is open).
 */
export function useEscapeKey(isActive: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isActive) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onClose])
}
