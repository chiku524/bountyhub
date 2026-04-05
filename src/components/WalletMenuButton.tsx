import { useCallback, useEffect, useRef, useState } from 'react'
import { FiCopy, FiCreditCard, FiExternalLink, FiLogOut } from 'react-icons/fi'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useToast } from '../contexts/ToastContext'
import { rememberFocusBeforeWalletModal } from '../utils/walletModalFocus'

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

function explorerUrlForAddress(address: string): string {
  const cluster = import.meta.env.VITE_SOLANA_CLUSTER
  if (cluster === 'devnet') {
    return `https://solscan.io/account/${address}?cluster=devnet`
  }
  return `https://solscan.io/account/${address}`
}

export function WalletMenuButton() {
  const { connected, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuWasOpenRef = useRef(false)

  const address = publicKey?.toBase58() ?? ''

  useEffect(() => {
    if (open) {
      menuWasOpenRef.current = true
      return
    }
    if (menuWasOpenRef.current) {
      menuWasOpenRef.current = false
      triggerRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current
      if (!el?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const handleConnectToggle = () => {
    if (connected) {
      setOpen((o) => !o)
    } else {
      rememberFocusBeforeWalletModal()
      setVisible(true)
    }
  }

  const copyAddress = useCallback(() => {
    if (!address) return
    void navigator.clipboard.writeText(address).then(
      () => toast.success('Address copied'),
      () => toast.error('Could not copy'),
    )
    setOpen(false)
  }, [address, toast])

  const openExplorer = useCallback(() => {
    if (!address) return
    window.open(explorerUrlForAddress(address), '_blank', 'noopener,noreferrer')
    setOpen(false)
  }, [address])

  const doDisconnect = useCallback(() => {
    disconnect()
    setOpen(false)
    toast.info('Wallet disconnected')
  }, [disconnect, toast])

  if (connected) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleConnectToggle}
          aria-expanded={open}
          aria-haspopup="true"
          className="flex min-h-11 min-w-11 items-center gap-2 rounded-lg border border-green-500/30 bg-green-600/20 px-3 py-2 text-xs font-medium text-green-400 transition-all duration-300 hover:border-green-500/50 hover:bg-green-600/30"
        >
          <FiCreditCard className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{address ? shortenAddress(address) : 'Connected'}</span>
        </button>
        {open && (
          <div
            className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={copyAddress}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
            >
              <FiCopy className="h-4 w-4 shrink-0 text-neutral-500" />
              Copy address
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={openExplorer}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
            >
              <FiExternalLink className="h-4 w-4 shrink-0 text-neutral-500" />
              View on explorer
            </button>
            <div className="my-1 border-t border-neutral-200 dark:border-neutral-600" />
            <button
              type="button"
              role="menuitem"
              onClick={doDisconnect}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <FiLogOut className="h-4 w-4 shrink-0" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        rememberFocusBeforeWalletModal()
        setVisible(true)
      }}
      className="flex min-h-11 min-w-11 items-center gap-2 rounded-lg border border-amber-500/35 bg-amber-600/20 px-3 py-2 text-xs font-medium text-amber-700 transition-all duration-300 hover:border-amber-500/50 hover:bg-amber-600/30 dark:text-amber-400"
    >
      <FiCreditCard className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  )
}
