import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import portalTokenInfo from '../../portal-token-info';

const TOKEN_SYMBOL = portalTokenInfo.config.symbol;

interface DirectDepositProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DirectDeposit({ onSuccess, onError }: DirectDepositProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'confirming' | 'success' | 'error'>('input');

  const handleDirectDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      onError?.('Please connect your wallet first');
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0 || solAmount > 1000) {
      onError?.('Please enter a valid amount between 0.001 and 1000 SOL');
      return;
    }

    setIsLoading(true);
    setStep('confirming');

    try {
      // Step 1: Create deposit request in the database
      const depositFormData = new FormData();
      depositFormData.append('amount', amount);
      
      const depositResponse = await fetch('/api/wallet/deposit', {
        method: 'POST',
        body: depositFormData,
      });
      
      const depositResult = await depositResponse.json();
      
      if (!depositResult.success) {
        throw new Error(depositResult.error || 'Failed to create deposit request');
      }

      // Step 2: Send SOL from user's wallet to platform
      const platformAddress = new PublicKey(depositResult.platformAddress);
      const lamports = solAmount * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: platformAddress,
          lamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      // Step 3: Confirm deposit with signature
      const confirmFormData = new FormData();
      confirmFormData.append('action', 'confirm');
      confirmFormData.append('transactionId', depositResult.transaction.id);
      confirmFormData.append('solanaSignature', signature);
      
      const confirmResponse = await fetch('/api/wallet/deposit', {
        method: 'POST',
        body: confirmFormData,
      });
      
      const confirmResult = await confirmResponse.json();
      
      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Failed to confirm deposit');
      }

      setStep('success');
      onSuccess?.();
      
      // Reload page after a short delay to show updated balance
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Direct deposit error:', error);
      setStep('error');
      onError?.(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setStep('input');
  };

  if (!connected) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-lg font-medium">Connect Your Wallet</p>
          <p className="text-sm">Please connect your Solana wallet to make a direct deposit</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-green-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Deposit Successful!</p>
          <p className="text-sm">You have received {amount} {TOKEN_SYMBOL} tokens</p>
        </div>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Make Another Deposit
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Deposit Failed</p>
          <p className="text-sm">Please try again or use the manual deposit method</p>
        </div>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-200 mb-2">🚀 Direct Deposit</h4>
        <p className="text-blue-300 text-sm mb-2">
          Send SOL directly from your connected wallet ({publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)})
        </p>
        <div className="text-blue-300 text-xs space-y-1">
          <p>✅ Instant transaction processing</p>
          <p>✅ No manual signature copying</p>
          <p>✅ Automatic confirmation</p>
        </div>
      </div>

      <form onSubmit={handleDirectDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.001"
            min="0.001"
            max="1000"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="0.1"
          />
          <p className="text-sm text-gray-400 mt-1">
            You will receive the same amount in {TOKEN_SYMBOL} tokens (1:1 exchange rate)
          </p>
        </div>

        {step === 'confirming' && (
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-yellow-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-yellow-300">Processing transaction...</span>
            </div>
            <p className="text-yellow-300 text-sm mt-2">
              Please approve the transaction in your wallet
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => onError?.('cancelled')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !amount}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Send ${amount || '0'} SOL`}
          </button>
        </div>
      </form>
    </div>
  );
} 