import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../contexts/AuthProvider'

interface PlatformStats {
  activeBounties: number
  questionsAnswered: number
  totalRewards: string
  communityMembers: number
  totalPosts: number
  totalAnswers: number
  totalBBUX: string
}

interface AdminStats {
  totalUsers: number
  userCount: number
  moderatorCount: number
  adminCount: number
}

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platformStats(),
    queryFn: () => api.request<PlatformStats>('/api/stats'),
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
  })
}

export function useAdminStats(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: async () => {
      const res = await api.getAdminStats()
      return res.stats as AdminStats
    },
    enabled,
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
  })
}

export function useAnalyticsData() {
  const { user } = useAuth()
  const platform = usePlatformStats()
  const admin = useAdminStats(user?.role === 'admin')

  return {
    platformStats: platform.data ?? null,
    adminStats: admin.data ?? null,
    loading: platform.isLoading && !platform.data,
    error:
      platform.error instanceof Error
        ? platform.error.message
        : platform.error
          ? 'Failed to load analytics'
          : null,
    refetch: async () => {
      await Promise.all([platform.refetch(), admin.refetch()])
    },
  }
}
