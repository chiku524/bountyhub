import { useState, useEffect } from 'react';

const TOKEN_SYMBOL = 'BBUX';

interface DirectDepositProps {
  onError?: (error: string) => void;
}

interface WalletHooks {
  useWallet: () => unknown;
  SystemProgram: unknown;
  Transaction: unknown;
  LAMPORTS_PER_SOL: number;
  PublicKey: unknown;
}

export function DirectDeposit({ onError }: DirectDepositProps) {
  const [amount, setAmount] = useState('');
  const [walletHooks, setWalletHooks] = useState<WalletHooks | null>(null);

  // Dynamically load wallet hooks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@solana/wallet-adapter-react'),
        import('@solana/web3.js')
      ]).then(([
        { useWallet },
        { SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey }
      ]) => {
        setWalletHooks({ useWallet, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey });
      }).catch(error => {
        console.error('Failed to load wallet hooks:', error);
      });
    }
  }, []);

  const handleDeposit = async () => {
    if (!walletHooks) {
      onError?.('Wallet not available');
      return;
    }

    // We can't use useWallet here as it's not a React component
    // This would need to be refactored to use a different approach
    onError?.('Wallet integration needs to be refactored');
    return;
  };

  return (
    <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
      <h3 className="text-xl font-bold text-white mb-4">Direct {TOKEN_SYMBOL} Deposit</h3>
      <p className="text-gray-400 mb-4">
        Send SOL directly to your virtual wallet. The equivalent amount in {TOKEN_SYMBOL} will be credited to your account.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-neutral-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={handleDeposit}
          disabled={!walletHooks}
          className="w-full py-2 px-4 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Deposit {amount ? amount + ' SOL' : ''}
        </button>
      </div>
    </div>
  );
} 