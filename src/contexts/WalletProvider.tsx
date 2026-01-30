import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import { ReactNode, useMemo } from 'react'

import '@solana/wallet-adapter-react-ui/styles.css'

// Phantom is registered as a Standard Wallet by the browser; no need to add PhantomWalletAdapter

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.bountyhub.tech/api/wallet/solana-proxy'

  const wallets = useMemo(
    () => [new SolflareWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
} 