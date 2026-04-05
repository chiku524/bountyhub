import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import {
  rememberFocusBeforeWalletModalIfUnset,
  restoreFocusAfterWalletModal,
} from '../utils/walletModalFocus'

/**
 * Restores focus after the @solana/wallet-adapter-react-ui modal closes.
 * Call `rememberFocusBeforeWalletModal()` immediately before `setVisible(true)` from app code.
 */
export function WalletModalFocusBridge({ children }: { children: ReactNode }) {
  const { visible } = useWalletModal()
  const wasVisibleRef = useRef(false)

  useLayoutEffect(() => {
    if (!visible) return
    rememberFocusBeforeWalletModalIfUnset()
  }, [visible])

  useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true
      return
    }
    if (wasVisibleRef.current) {
      wasVisibleRef.current = false
      restoreFocusAfterWalletModal()
    }
  }, [visible])

  return <>{children}</>
}
