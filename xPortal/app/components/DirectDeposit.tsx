import { useState } from 'react';

const TOKEN_SYMBOL = 'BBUX';

interface DirectDepositProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DirectDeposit({ onSuccess, onError }: DirectDepositProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletHooks, setWalletHooks] = useState<any>(null);

  // Dynamically load wallet hooks
  useState(() => {
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
  });

  const handleDeposit = async () => {
    if (!walletHooks) {
      onError?.('Wallet not available');
      return;
    }

    const { useWallet, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } = walletHooks;
    const { wallet, sendTransaction } = useWallet();

    if (!wallet || !sendTransaction) {
      onError?.('Please connect your wallet first');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      // Create a simple SOL transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey!,
          toPubkey: new PublicKey('8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M'), // Platform wallet
          lamports: depositAmount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, wallet.adapter);
      console.log('Transaction sent:', signature);
      
      onSuccess?.();
      setAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading || !walletHooks}
          className="w-full py-2 px-4 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : `Deposit ${amount ? amount + ' SOL' : ''}`}
        </button>
      </div>
    </div>
  );
} 