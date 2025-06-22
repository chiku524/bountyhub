import { FC, ReactNode, useMemo, useContext, createContext } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

const endpoint = 'https://api.devnet.solana.com'; // Use devnet for testing

interface SolanaWalletContextType {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  publicKey: string | null;
  signTransaction: (transaction: any) => Promise<any>;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | null>(null);

export const useSolanaWallet = () => {
  const context = useContext(SolanaWalletContext);
  if (!context) {
    throw new Error('useSolanaWallet must be used within a SolanaWalletProvider');
  }
  return context;
};

const SolanaWalletInner: FC<{ children: ReactNode }> = ({ children }) => {
  const { connected, disconnect, publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const connect = () => {
    setVisible(true);
  };

  const value = {
    connected,
    connect,
    disconnect,
    publicKey: publicKey?.toString() || null,
    signTransaction: signTransaction || (() => Promise.reject(new Error('Wallet not connected'))),
  };

  return (
    <SolanaWalletContext.Provider value={value}>
      {children}
    </SolanaWalletContext.Provider>
  );
};

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaWalletInner>{children}</SolanaWalletInner>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 