import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

export const queryKeys = {
  communityPosts: (params: Record<string, unknown>) =>
    ['community-posts', params] as const,
  communityExport: (params: Record<string, unknown>) =>
    ['community-posts-export', params] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  platformStats: () => ['platform-stats'] as const,
  adminStats: () => ['admin-stats'] as const,
  walletInfo: (userId: string) => ['wallet-info', userId] as const,
  walletTransactions: (userId: string) => ['wallet-transactions', userId] as const,
  governance: (userId: string, slice: string) => ['governance', userId, slice] as const,
}
