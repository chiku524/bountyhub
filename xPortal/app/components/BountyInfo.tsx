import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

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
  const { publicKey } = useWallet();
  const isExpired = bounty.expiresAt && new Date(bounty.expiresAt) < new Date();
  const canClaim = bounty.status === 'ACTIVE' && !isExpired && publicKey;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600';
      case 'CLAIMED':
        return 'text-blue-600';
      case 'REFUNDED':
        return 'text-yellow-600';
      case 'EXPIRED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Bounty Details</h3>
        <span className={`text-sm font-medium ${getStatusColor(bounty.status)}`}>
          {bounty.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-sm font-medium">{bounty.amount} SOL</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Expires</span>
          <span className="text-sm font-medium">{formatDate(bounty.expiresAt)}</span>
        </div>

        {bounty.signature && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Transaction</span>
            <a
              href={`https://explorer.solana.com/tx/${bounty.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View on Explorer
            </a>
          </div>
        )}
      </div>

      {canClaim && (
        <button
          onClick={onClaim}
          className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Claim Bounty
        </button>
      )}

      {isExpired && bounty.status === 'ACTIVE' && (
        <div className="text-sm text-red-600">
          This bounty has expired
        </div>
      )}
    </div>
  );
} 