import { ReactNode, useMemo, useEffect, useState } from 'react';

// Create config outside of component to prevent recreation
const network = 'devnet';
const endpoint = 'https://api.devnet.solana.com';

function ClientWalletProvider({ children }: { children: ReactNode }) {
  const [walletComponents, setWalletComponents] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import all wallet dependencies
    Promise.all([
      import('@solana/wallet-adapter-base'),
      import('@solana/wallet-adapter-react'),
      import('@solana/wallet-adapter-react-ui'),
      import('@solana/wallet-adapter-phantom'),
      import('@solana/wallet-adapter-solflare'),
      import('@solana/web3.js')
    ]).then(([
      { WalletAdapterNetwork },
      { ConnectionProvider, WalletProvider: SolanaWalletProvider },
      { WalletModalProvider },
      { PhantomWalletAdapter },
      { SolflareWalletAdapter },
      { clusterApiUrl }
    ]) => {
      const wallets = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ];

      setWalletComponents({
        ConnectionProvider,
        SolanaWalletProvider,
        WalletModalProvider,
        wallets,
        endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet)
      });
      setIsLoading(false);
    }).catch(error => {
      console.error('Failed to load wallet components:', error);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !walletComponents) {
    return <>{children}</>;
  }

  const { ConnectionProvider, SolanaWalletProvider, WalletModalProvider, wallets, endpoint } = walletComponents;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, just render the children without the providers
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // On the client, only render the providers after mounting
  if (!mounted) {
    return <>{children}</>;
  }

  return <ClientWalletProvider>{children}</ClientWalletProvider>;
} 