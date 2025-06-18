import { useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

function WalletConnectButton() {
  const [walletError, setWalletError] = useState(false);
  
  let publicKey: any, connected: boolean = false, disconnect: (() => void) | undefined, setVisible: ((visible: boolean) => void) | undefined;
  
  try {
    const wallet = useWallet();
    const modal = useWalletModal();
    publicKey = wallet.publicKey;
    connected = wallet.connected;
    disconnect = wallet.disconnect;
    setVisible = modal.setVisible;
  } catch (error) {
    console.error('Wallet context error:', error);
    setWalletError(true);
  }

  // If there's a wallet error, show a fallback
  if (walletError) {
    return (
      <div className="w-full">
        <div className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center gap-4 px-4 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">Wallet Error</span>
          </div>
        </div>
      </div>
    );
  }

  const handleWalletClick = () => {
    if (setVisible) {
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    if (disconnect) {
      disconnect();
    }
  };

  if (connected && publicKey) {
    return (
      <div className="w-full">
        <div className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center gap-4 px-4 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">
              {`${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
            </span>
            <button
              onClick={handleDisconnect}
              className="hidden group-hover:block p-1 rounded hover:bg-red-500/20 transition-colors"
              title="Disconnect wallet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 hover:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button 
        onClick={handleWalletClick}
        className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5"
      >
        <div className="relative flex items-center gap-4 px-4 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">
            Connect Wallet
          </span>
        </div>
      </button>
    </div>
  );
}

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center gap-4 px-4 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return <WalletConnectButton />;
} 