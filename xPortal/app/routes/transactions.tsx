import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { VirtualWalletService } from "~/utils/virtual-wallet.server";
import { requireUserId } from "~/utils/auth.server";
import { Nav } from "~/components/nav";
import bountyBucksInfo from '../../bounty-bucks-info.json';
import { useState } from "react";

const TOKEN_SYMBOL = bountyBucksInfo.config.symbol;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 50; // Show 50 transactions per page
  
  const transactionData = await VirtualWalletService.getAllTransactions(userId, page, limit);
  const pendingTransactions = await VirtualWalletService.getPendingTransactions(userId);
  const transactionStats = await VirtualWalletService.getTransactionStats(userId);

  return json({ transactionData, pendingTransactions, transactionStats });
};

export default function TransactionsPage() {
  const { transactionData, pendingTransactions, transactionStats } = useLoaderData<typeof loader>();
  const { transactions, pagination } = transactionData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [cancellingTransaction, setCancellingTransaction] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '💰';
      case 'WITHDRAW':
        return '💸';
      case 'BOUNTY_CREATED':
        return '🎯';
      case 'BOUNTY_CLAIMED':
        return '🏆';
      case 'BOUNTY_REFUNDED':
        return '↩️';
      default:
        return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'BOUNTY_CLAIMED':
      case 'BOUNTY_REFUNDED':
        return 'text-green-600';
      case 'WITHDRAW':
      case 'BOUNTY_CREATED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionStatus = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { text: 'Completed', color: 'text-green-400' };
      case 'PENDING':
        return { text: 'Pending', color: 'text-yellow-400' };
      case 'FAILED':
        return { text: 'Failed', color: 'text-red-400' };
      default:
        return { text: status, color: 'text-gray-400' };
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to cancel this transaction?")) {
      return;
    }

    setCancellingTransaction(transactionId);
    try {
      const formData = new FormData();
      formData.append('transactionId', transactionId);
      
      const response = await fetch('/api/wallet/cancel-transaction', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reload the page to show updated transactions
        window.location.reload();
      } else {
        alert(result.error || 'Failed to cancel transaction');
      }
    } catch (error) {
      alert('Failed to cancel transaction. Please try again.');
    } finally {
      setCancellingTransaction(null);
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto ml-20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Link
                to="/wallet"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                ← Back to Wallet
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-gray-300">View all your {TOKEN_SYMBOL} transactions</p>
          </div>

          {/* Pending Transactions Warning */}
          {pendingTransactions.length > 0 && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-200 mb-1">
                    ⚠️ Pending Transactions ({pendingTransactions.length})
                  </h3>
                  <p className="text-yellow-300 text-sm">
                    You have {pendingTransactions.length} pending transaction{pendingTransactions.length > 1 ? 's' : ''} that will expire in 24 hours.
                  </p>
                </div>
                <div className="text-yellow-300 text-sm">
                  <p>Complete or cancel them to avoid expiration.</p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Stats */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Total Transactions:</span>
                <span className="text-white font-semibold ml-2">{transactionStats.total}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Completed:</span>
                <span className="text-green-400 font-semibold ml-2">{transactionStats.completed}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Pending:</span>
                <span className="text-yellow-400 font-semibold ml-2">{transactionStats.pending}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Cancelled:</span>
                <span className="text-red-400 font-semibold ml-2">{transactionStats.cancelled}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-400">Page:</span>
                  <span className="text-white font-semibold ml-2">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions found</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-white">{transaction.description}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTransactionStatus(transaction.status).color} bg-neutral-700`}>
                            {getTransactionStatus(transaction.status).text}
                          </span>
                          {transaction.status === 'PENDING' && (
                            <span className="text-xs text-yellow-400 bg-yellow-900 px-2 py-1 rounded">
                              Expires in 24h
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{formatDate(transaction.createdAt)}</p>
                        {transaction.bounty && (
                          <p className="text-sm text-blue-400 mt-1">
                            Bounty: {transaction.bounty.post.title}
                          </p>
                        )}
                        {transaction.type === 'WITHDRAW' && transaction.metadata && (
                          <div className="text-sm text-gray-400 mt-1 space-y-1">
                            {transaction.metadata.platformFee && (
                              <p>Platform Fee: <span className="text-yellow-400">{transaction.metadata.platformFee.toFixed(4)} {TOKEN_SYMBOL}</span></p>
                            )}
                            {transaction.metadata.netAmount && (
                              <p>Net Amount: <span className="text-green-400">{transaction.metadata.netAmount.toFixed(4)} SOL</span></p>
                            )}
                          </div>
                        )}
                        {transaction.solanaSignature && (
                          <a
                            href={`https://explorer.solana.com/tx/${transaction.solanaSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 mt-1 block"
                          >
                            View on Solana Explorer
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`font-semibold text-lg ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'WITHDRAW' || transaction.type === 'BOUNTY_CREATED' ? '-' : '+'}
                          {transaction.amount.toFixed(4)} {TOKEN_SYMBOL}
                        </p>
                        <p className="text-sm text-gray-400">
                          Balance: {transaction.balanceAfter.toFixed(4)} {TOKEN_SYMBOL}
                        </p>
                      </div>
                      {transaction.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelTransaction(transaction.id)}
                          disabled={cancellingTransaction === transaction.id}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {cancellingTransaction === transaction.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-500 text-white'
                          : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 