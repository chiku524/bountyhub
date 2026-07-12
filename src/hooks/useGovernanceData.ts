import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../contexts/AuthProvider'

export interface GovernanceStats {
  totalStaked: number
  totalTreasury: number
  totalCollected: number
  totalDistributed: number
  activeStakers: number
  totalProposals: number
  activeProposals: number
}

export interface UserGovernanceStats {
  stakedAmount: number
  totalRewardsEarned: number
  votingPower: number
  governanceParticipation: number
  lastRewardAt: string | null
}

export interface RewardRate {
  baseRate: number
  activityBonus: number
  treasuryBonus: number
  participationPenalty: number
  totalRate: number
  maxRate: number
}

export interface UserRewardRate extends RewardRate {
  governanceBonus: number
}

export interface PlatformMetrics {
  monthlyVolume: number
  activeStakers: number
  treasuryHealth: 'LOW' | 'MEDIUM' | 'HIGH'
  participationLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface TransparencyLog {
  id: string
  logType: string
  amount: number
  feeAmount: number
  description: string
  userId?: string
  referenceId?: string
  referenceType?: string
  balanceBefore?: number
  balanceAfter?: number
  treasuryBalanceBefore?: number
  treasuryBalanceAfter?: number
  createdAt: string
}

export interface GovernanceActivity {
  id: string
  activityType: string
  amount: number
  description: string
  userId?: string
  referenceId?: string
  referenceType?: string
  metadata?: string
  createdAt: string
}

async function fetchGovernanceField<T>(
  action: string,
  key: string,
  extraParams = ''
): Promise<T> {
  const data = await api.request<Record<string, unknown>>(
    `/api/governance?action=${encodeURIComponent(action)}${extraParams}`
  )
  if (data.error) {
    const msg = String(data.error)
    if (msg === 'Invalid action') {
      throw new Error('Governance data is not available right now. (Invalid action)')
    }
    throw new Error(msg || 'Failed to load governance data')
  }
  return data[key] as T
}

export function useGovernanceData() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id ?? ''
  const enabled = Boolean(user)

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.governance(userId, 'stats'),
        queryFn: () => fetchGovernanceField<GovernanceStats>('stats', 'stats'),
        enabled,
      },
      {
        queryKey: queryKeys.governance(userId, 'user-stats'),
        queryFn: () => fetchGovernanceField<UserGovernanceStats>('user-stats', 'userStats'),
        enabled,
      },
      {
        queryKey: queryKeys.governance(userId, 'reward-rate'),
        queryFn: () => fetchGovernanceField<RewardRate>('reward-rate', 'rewardRate'),
        enabled,
      },
      {
        queryKey: queryKeys.governance(userId, 'user-reward-rate'),
        queryFn: () =>
          fetchGovernanceField<UserRewardRate>('user-reward-rate', 'userRewardRate'),
        enabled,
      },
      {
        queryKey: queryKeys.governance(userId, 'platform-metrics'),
        queryFn: () =>
          fetchGovernanceField<PlatformMetrics>('platform-metrics', 'platformMetrics'),
        enabled,
      },
      {
        queryKey: queryKeys.governance(userId, 'transparency-logs'),
        queryFn: () =>
          fetchGovernanceField<TransparencyLog[]>(
            'transparency-logs',
            'logs',
            '&limit=20'
          ),
        enabled,
      },
      {
        queryKey: queryKeys.governance(userId, 'governance-activity'),
        queryFn: () =>
          fetchGovernanceField<GovernanceActivity[]>(
            'governance-activity',
            'activity',
            '&limit=20'
          ),
        enabled,
      },
    ],
  })

  const [
    statsQ,
    userStatsQ,
    rewardRateQ,
    userRewardRateQ,
    platformMetricsQ,
    logsQ,
    activityQ,
  ] = results

  const refetchAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['governance', userId] })
  }

  const stake = useMutation({
    mutationFn: async (amount: number) => {
      const result = await api.request<{ success?: boolean; error?: string }>(
        '/api/governance',
        {
          method: 'POST',
          body: JSON.stringify({ action: 'stake', amount }),
        }
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to stake')
      }
      return result
    },
    onSuccess: () => refetchAll(),
  })

  const unstake = useMutation({
    mutationFn: async (amount: number) => {
      const result = await api.request<{ success?: boolean; error?: string }>(
        '/api/governance',
        {
          method: 'POST',
          body: JSON.stringify({ action: 'unstake', amount }),
        }
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to unstake')
      }
      return result
    },
    onSuccess: () => refetchAll(),
  })

  const firstError = results.find((q) => q.error)?.error
  const loadError =
    firstError instanceof Error
      ? firstError.message
      : firstError
        ? 'Failed to load governance data'
        : null

  return {
    stats: statsQ.data ?? null,
    userStats: userStatsQ.data ?? null,
    rewardRate: rewardRateQ.data ?? null,
    userRewardRate: userRewardRateQ.data ?? null,
    platformMetrics: platformMetricsQ.data ?? null,
    transparencyLogs: logsQ.data ?? [],
    governanceActivity: activityQ.data ?? [],
    loading: enabled && results.some((q) => q.isLoading) && !statsQ.data,
    error: loadError,
    refetch: refetchAll,
    stake: (amount: number) => stake.mutateAsync(amount),
    unstake: (amount: number) => unstake.mutateAsync(amount),
    stakingLoading: stake.isPending || unstake.isPending,
  }
}
