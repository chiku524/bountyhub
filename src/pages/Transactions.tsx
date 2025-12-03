import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { TransactionLog } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Pagination } from '../components/Pagination'

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getAllTransactions(pagination.page, pagination.limit)
      setTransactions(response.transactions)
      setPagination(response.pagination)
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-neutral-600 dark:text-gray-400'
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'direct_deposit':
        return 'Direct Deposit'
      case 'manual_deposit':
        return 'Manual Deposit'
      case 'withdrawal':
        return 'Withdrawal'
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Transaction History</h1>
            <p className="text-neutral-600 dark:text-gray-400">
              View all your wallet transactions and their current status
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-8 text-center">
              <p className="text-neutral-600 dark:text-gray-400 text-lg">No transactions found</p>
              <p className="text-neutral-500 dark:text-gray-500 mt-2">Your transaction history will appear here once you make your first transaction.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Transaction Cards */}
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {getTransactionTypeLabel(tx.type)}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-gray-400 mt-1">
                        Transaction ID: {tx.transactionId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(4)} BBUX
                      </p>
                      <p className={`text-sm font-medium ${getStatusColor(tx.status)} mt-1`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500 dark:text-gray-400">Date & Time</p>
                      <p className="text-neutral-900 dark:text-white">{formatDate(tx.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 dark:text-gray-400">Transaction ID</p>
                      <p className="text-neutral-900 dark:text-white font-mono text-xs break-all">{tx.id}</p>
                    </div>
                    {tx.metadata && (
                      <div className="md:col-span-2">
                        <p className="text-neutral-500 dark:text-gray-400">Details</p>
                        <div className="bg-neutral-100 dark:bg-neutral-700 rounded p-3 mt-1">
                          <pre className="text-neutral-800 dark:text-white text-xs whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(tx.metadata), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Summary */}
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <p className="text-neutral-600 dark:text-gray-400 text-sm">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} transactions
                </p>
              </div>
            </div>
          )}
        </div>
    </div>
  )
} 