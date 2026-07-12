import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../contexts/AuthProvider'
import type { WalletInfo, TransactionLog } from '../types'

export function useWalletData(enabled = true) {
  const { user, loading: authLoading } = useAuth()
  const ready = Boolean(user) && !authLoading && enabled

  const wallet = useQuery({
    queryKey: queryKeys.walletInfo(user?.id ?? ''),
    queryFn: () => api.getWalletInfo(),
    enabled: ready,
  })

  const transactions = useQuery({
    queryKey: queryKeys.walletTransactions(user?.id ?? ''),
    queryFn: () => api.getRecentTransactions(),
    enabled: ready,
  })

  const refetch = async () => {
    await Promise.all([wallet.refetch(), transactions.refetch()])
  }

  const loadError =
    wallet.error instanceof Error
      ? wallet.error.message
      : wallet.error
        ? 'Failed to fetch wallet data'
        : transactions.error instanceof Error
          ? transactions.error.message
          : transactions.error
            ? 'Failed to fetch transactions'
            : null

  return {
    walletData: (wallet.data as WalletInfo | undefined) ?? null,
    transactions: (transactions.data as TransactionLog[] | undefined) ?? [],
    loading: authLoading || (ready && wallet.isLoading && !wallet.data),
    error: loadError,
    refetch,
    refetchWallet: () => wallet.refetch(),
  }
}
