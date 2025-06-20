import { useState } from 'react';

interface WalletHooks {
  useWallet: () => unknown;
  PublicKey: unknown;
}

interface BountyInfoProps {
  bounty: {
    id: string;
    amount: number;
    status: 'ACTIVE' | 'CLAIMED' | 'REFUNDED' | 'EXPIRED';
    expiresAt: string | null;
    winnerId: string | null;
    signature: string | null;
  };
  onClaim: () => Promise<void>;
}

export function BountyInfo({ bounty, onClaim }: BountyInfoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [walletHooks, setWalletHooks] = useState<WalletHooks | null>(null);

  // Dynamically load wallet hooks
  useState(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@solana/wallet-adapter-react'),
        import('@solana/web3.js')
      ]).then(([
        { useWallet },
        { PublicKey }
      ]) => {
        setWalletHooks({ useWallet, PublicKey });
      }).catch(error => {
        console.error('Failed to load wallet hooks:', error);
      });
    }
  });

  const handleClaim = async () => {
    if (!walletHooks) {
      alert('Wallet not available');
      return;
    }

    setIsLoading(true);
    try {
      await onClaim();
    } catch (error) {
      console.error('Claim error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount} BBUX`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400';
      case 'CLAIMED':
        return 'text-blue-400';
      case 'REFUNDED':
        return 'text-yellow-400';
      case 'EXPIRED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'CLAIMED':
        return 'Claimed';
      case 'REFUNDED':
        return 'Refunded';
      case 'EXPIRED':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Bounty Information</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bounty.status)}`}>
          {getStatusText(bounty.status)}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount:</span>
          <span className="text-white font-semibold">{formatAmount(bounty.amount)}</span>
        </div>
        
        {bounty.expiresAt && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Expires:</span>
            <span className="text-white">
              {new Date(bounty.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {bounty.winnerId && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Winner:</span>
            <span className="text-white">
              {bounty.winnerId.slice(0, 8)}...{bounty.winnerId.slice(-8)}
            </span>
          </div>
        )}
        
        {bounty.signature && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction:</span>
            <span className="text-white text-sm">
              {bounty.signature.slice(0, 8)}...{bounty.signature.slice(-8)}
            </span>
          </div>
        )}
      </div>
      
      {bounty.status === 'ACTIVE' && (
        <button
          onClick={handleClaim}
          disabled={isLoading || !walletHooks}
          className="w-full mt-6 py-2 px-4 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Claiming...' : 'Claim Bounty'}
        </button>
      )}
    </div>
  );
} 