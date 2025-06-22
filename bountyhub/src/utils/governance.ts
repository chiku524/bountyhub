import { eq, desc, and, gte } from 'drizzle-orm'
import { 
  virtualWallets, 
  governanceStakes, 
  governanceRewards, 
  governanceVotes,
  governanceTreasury,
  governanceActivity,
  transparencyLogs,
  governanceProposals
} from '../../drizzle/schema'
import type { Db } from './db'

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

export class GovernanceService {
  private static readonly GOVERNANCE_FEE_PERCENTAGE = 0.05 // 5%
  private static readonly ACTIVITY_REWARD_RATE = 0.01 // 1% for activities

  /**
   * Collect governance fee from bounty placement
   */
  static async collectGovernanceFee(
    db: Db,
    userId: string,
    bountyAmount: number,
    bountyId: string
  ): Promise<{ success: boolean; feeAmount: number; error?: string }> {
    try {
      const feeAmount = bountyAmount * this.GOVERNANCE_FEE_PERCENTAGE
      
      // Get user's virtual wallet
      const userWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (userWallet.length === 0) {
        return { success: false, feeAmount: 0, error: 'User wallet not found' }
      }
      
      const wallet = userWallet[0]
      if (wallet.balance < bountyAmount) {
        return { success: false, feeAmount: 0, error: 'Insufficient balance' }
      }

      // Get or create treasury
      let treasury = await db.select().from(governanceTreasury).limit(1)
      if (treasury.length === 0) {
        const treasuryId = crypto.randomUUID()
        await db.insert(governanceTreasury).values({
          id: treasuryId,
          balance: 0,
          totalCollected: 0,
          totalDistributed: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        treasury = await db.select().from(governanceTreasury).limit(1)
      }

      const currentTreasury = treasury[0]
      const treasuryBalanceBefore = currentTreasury.balance
      const treasuryBalanceAfter = currentTreasury.balance + feeAmount

      // Update user's virtual wallet
      await db.update(virtualWallets)
        .set({
          balance: wallet.balance - bountyAmount,
          totalSpent: wallet.totalSpent + bountyAmount,
          updatedAt: new Date()
        })
        .where(eq(virtualWallets.userId, userId))

      // Update treasury
      await db.update(governanceTreasury)
        .set({
          balance: treasuryBalanceAfter,
          totalCollected: currentTreasury.totalCollected + feeAmount,
          updatedAt: new Date()
        })
        .where(eq(governanceTreasury.id, currentTreasury.id))

      // Log transparency
      await this.logTransparency(db, {
        logType: 'BOUNTY_PLACED',
        amount: bountyAmount,
        feeAmount: feeAmount,
        description: `Bounty placed for ${bountyAmount} BBUX (${feeAmount} BBUX governance fee)`,
        userId: userId,
        referenceId: bountyId,
        referenceType: 'bounty',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - bountyAmount,
        treasuryBalanceBefore: treasuryBalanceBefore,
        treasuryBalanceAfter: treasuryBalanceAfter
      })

      // Log governance activity
      await this.logGovernanceActivity(db, {
        activityType: 'FEE_COLLECTED',
        amount: feeAmount,
        description: `Governance fee collected from bounty placement`,
        userId: userId,
        referenceId: bountyId,
        referenceType: 'bounty'
      })

      return { success: true, feeAmount }
    } catch (error) {
      console.error('Error collecting governance fee:', error)
      return { success: false, feeAmount: 0, error: 'Failed to collect governance fee' }
    }
  }

  /**
   * Distribute bounty to winner
   */
  static async distributeBounty(
    db: Db,
    winnerId: string,
    bountyAmount: number,
    bountyId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get winner's virtual wallet
      const winnerWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, winnerId)).limit(1)
      if (winnerWallet.length === 0) {
        return { success: false, error: 'Winner wallet not found' }
      }

      const wallet = winnerWallet[0]
      const balanceBefore = wallet.balance
      const balanceAfter = wallet.balance + bountyAmount

      // Update winner's virtual wallet
      await db.update(virtualWallets)
        .set({
          balance: balanceAfter,
          totalEarned: wallet.totalEarned + bountyAmount,
          updatedAt: new Date()
        })
        .where(eq(virtualWallets.userId, winnerId))

      // Log transparency
      await this.logTransparency(db, {
        logType: 'BOUNTY_CLAIMED',
        amount: bountyAmount,
        feeAmount: 0,
        description: `Bounty claimed for ${bountyAmount} BBUX`,
        userId: winnerId,
        referenceId: bountyId,
        referenceType: 'bounty',
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter
      })

      // Give activity reward for claiming bounty
      await this.giveActivityReward(db, winnerId, bountyAmount * this.ACTIVITY_REWARD_RATE, 'BOUNTY_CLAIM', bountyId)

      return { success: true }
    } catch (error) {
      console.error('Error distributing bounty:', error)
      return { success: false, error: 'Failed to distribute bounty' }
    }
  }

  /**
   * Stake BBUX for governance
   */
  static async stakeForGovernance(
    db: Db,
    userId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check user's balance
      const userWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (userWallet.length === 0) {
        return { success: false, error: 'User wallet not found' }
      }

      const wallet = userWallet[0]
      if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' }
      }

      // Check if user already has a stake
      const existingStake = await db.select().from(governanceStakes).where(eq(governanceStakes.userId, userId)).limit(1)
      
      if (existingStake.length > 0) {
        // Update existing stake
        const stake = existingStake[0]
        await db.update(governanceStakes)
          .set({
            amount: stake.amount + amount,
            updatedAt: new Date()
          })
          .where(eq(governanceStakes.userId, userId))
      } else {
        // Create new stake
        const stakeId = crypto.randomUUID()
        await db.insert(governanceStakes).values({
          id: stakeId,
          userId: userId,
          amount: amount,
          stakedAt: new Date(),
          totalRewardsEarned: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      // Update user's virtual wallet
      await db.update(virtualWallets)
        .set({
          balance: wallet.balance - amount,
          updatedAt: new Date()
        })
        .where(eq(virtualWallets.userId, userId))

      // Log transparency
      await this.logTransparency(db, {
        logType: 'STAKE_ADDED',
        amount: amount,
        feeAmount: 0,
        description: `Staked ${amount} BBUX for governance`,
        userId: userId,
        referenceId: userId,
        referenceType: 'stake',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount
      })

      // Log governance activity
      await this.logGovernanceActivity(db, {
        activityType: 'STAKE_ADDED',
        amount: amount,
        description: `User staked BBUX for governance`,
        userId: userId,
        referenceId: userId,
        referenceType: 'stake'
      })

      return { success: true }
    } catch (error) {
      console.error('Error staking for governance:', error)
      return { success: false, error: 'Failed to stake for governance' }
    }
  }

  /**
   * Unstake BBUX from governance
   */
  static async unstakeFromGovernance(
    db: Db,
    userId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check user's stake
      const userStake = await db.select().from(governanceStakes).where(eq(governanceStakes.userId, userId)).limit(1)
      if (userStake.length === 0) {
        return { success: false, error: 'No stake found' }
      }

      const stake = userStake[0]
      if (stake.amount < amount) {
        return { success: false, error: 'Insufficient staked amount' }
      }

      // Update stake
      await db.update(governanceStakes)
        .set({
          amount: stake.amount - amount,
          updatedAt: new Date()
        })
        .where(eq(governanceStakes.userId, userId))

      // Update user's virtual wallet
      const userWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (userWallet.length > 0) {
        const wallet = userWallet[0]
        await db.update(virtualWallets)
          .set({
            balance: wallet.balance + amount,
            updatedAt: new Date()
          })
          .where(eq(virtualWallets.userId, userId))
      }

      // Log transparency
      await this.logTransparency(db, {
        logType: 'STAKE_REMOVED',
        amount: amount,
        feeAmount: 0,
        description: `Unstaked ${amount} BBUX from governance`,
        userId: userId,
        referenceId: userId,
        referenceType: 'stake'
      })

      // Log governance activity
      await this.logGovernanceActivity(db, {
        activityType: 'STAKE_REMOVED',
        amount: amount,
        description: `User unstaked BBUX from governance`,
        userId: userId,
        referenceId: userId,
        referenceType: 'stake'
      })

      return { success: true }
    } catch (error) {
      console.error('Error unstaking from governance:', error)
      return { success: false, error: 'Failed to unstake from governance' }
    }
  }

  /**
   * Give activity reward to user
   */
  static async giveActivityReward(
    db: Db,
    userId: string,
    amount: number,
    rewardType: 'STAKING' | 'ACTIVITY' | 'BOUNTY_PLACEMENT' | 'BOUNTY_CLAIM' | 'DAILY_LOGIN' | 'GOVERNANCE_PARTICIPATION',
    referenceId?: string,
    referenceType?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user's virtual wallet
      const userWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (userWallet.length === 0) {
        return { success: false, error: 'User wallet not found' }
      }

      const wallet = userWallet[0]
      const balanceBefore = wallet.balance
      const balanceAfter = wallet.balance + amount

      // Update user's virtual wallet
      await db.update(virtualWallets)
        .set({
          balance: balanceAfter,
          totalEarned: wallet.totalEarned + amount,
          updatedAt: new Date()
        })
        .where(eq(virtualWallets.userId, userId))

      // Create reward record
      const rewardId = crypto.randomUUID()
      await db.insert(governanceRewards).values({
        id: rewardId,
        userId: userId,
        amount: amount,
        rewardType: rewardType,
        description: `${rewardType} reward: ${amount} BBUX`,
        referenceId: referenceId,
        referenceType: referenceType,
        createdAt: new Date()
      })

      // Log transparency
      await this.logTransparency(db, {
        logType: 'REWARD_DISTRIBUTED',
        amount: amount,
        feeAmount: 0,
        description: `${rewardType} reward distributed: ${amount} BBUX`,
        userId: userId,
        referenceId: rewardId,
        referenceType: 'reward',
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter
      })

      // Log governance activity
      await this.logGovernanceActivity(db, {
        activityType: 'REWARD_DISTRIBUTED',
        amount: amount,
        description: `${rewardType} reward distributed`,
        userId: userId,
        referenceId: rewardId,
        referenceType: 'reward'
      })

      return { success: true }
    } catch (error) {
      console.error('Error giving activity reward:', error)
      return { success: false, error: 'Failed to give activity reward' }
    }
  }

  /**
   * Distribute staking rewards to all active stakers
   */
  static async distributeStakingRewards(db: Db): Promise<{ success: boolean; totalDistributed: number; error?: string }> {
    try {
      const activeStakes = await db.select().from(governanceStakes).where(eq(governanceStakes.isActive, true))
      let totalDistributed = 0

      for (const stake of activeStakes) {
        const daysSinceLastReward = stake.lastRewardAt 
          ? Math.floor((Date.now() - new Date(stake.lastRewardAt).getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - new Date(stake.stakedAt).getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceLastReward >= 1) {
          // Get user's personalized reward rate
          const userRateInfo = await this.getUserStakingRewardRate(db, stake.userId)
          const dailyRate = userRateInfo.totalRate
          
          const rewardAmount = stake.amount * dailyRate * daysSinceLastReward
          
          if (rewardAmount > 0) {
            await this.giveActivityReward(db, stake.userId, rewardAmount, 'STAKING', stake.id, 'stake')
            totalDistributed += rewardAmount

            // Update stake's last reward time
            await db.update(governanceStakes)
              .set({
                lastRewardAt: new Date(),
                totalRewardsEarned: stake.totalRewardsEarned + rewardAmount,
                updatedAt: new Date()
              })
              .where(eq(governanceStakes.id, stake.id))
          }
        }
      }

      return { success: true, totalDistributed }
    } catch (error) {
      console.error('Error distributing staking rewards:', error)
      return { success: false, totalDistributed: 0, error: 'Failed to distribute staking rewards' }
    }
  }

  /**
   * Get governance statistics
   */
  static async getGovernanceStats(db: Db): Promise<GovernanceStats> {
    try {
      const treasury = await db.select().from(governanceTreasury).limit(1)
      const totalStaked = await db.select().from(governanceStakes).where(eq(governanceStakes.isActive, true))
      const proposals = await db.select().from(governanceProposals)
      const activeProposals = await db.select().from(governanceProposals).where(eq(governanceProposals.status, 'ACTIVE'))

      return {
        totalStaked: totalStaked.reduce((sum, stake) => sum + stake.amount, 0),
        totalTreasury: treasury.length > 0 ? treasury[0].balance : 0,
        totalCollected: treasury.length > 0 ? treasury[0].totalCollected : 0,
        totalDistributed: treasury.length > 0 ? treasury[0].totalDistributed : 0,
        activeStakers: totalStaked.length,
        totalProposals: proposals.length,
        activeProposals: activeProposals.length
      }
    } catch (error) {
      console.error('Error getting governance stats:', error)
      return {
        totalStaked: 0,
        totalTreasury: 0,
        totalCollected: 0,
        totalDistributed: 0,
        activeStakers: 0,
        totalProposals: 0,
        activeProposals: 0
      }
    }
  }

  /**
   * Get user governance statistics
   */
  static async getUserGovernanceStats(db: Db, userId: string): Promise<UserGovernanceStats | null> {
    try {
      const userStake = await db.select().from(governanceStakes).where(eq(governanceStakes.userId, userId)).limit(1)
      const userRewards = await db.select().from(governanceRewards).where(eq(governanceRewards.userId, userId))
      const userVotes = await db.select().from(governanceVotes).where(eq(governanceVotes.voterId, userId))

      if (userStake.length === 0) {
        return {
          stakedAmount: 0,
          totalRewardsEarned: 0,
          votingPower: 0,
          governanceParticipation: 0,
          lastRewardAt: null
        }
      }

      const stake = userStake[0]
      const totalRewardsEarned = userRewards.reduce((sum, reward) => sum + reward.amount, 0)
      const votingPower = stake.amount
      const governanceParticipation = userVotes.length

      return {
        stakedAmount: stake.amount,
        totalRewardsEarned,
        votingPower,
        governanceParticipation,
        lastRewardAt: stake.lastRewardAt ? new Date(stake.lastRewardAt).toISOString() : null
      }
    } catch (error) {
      console.error('Error getting user governance stats:', error)
      return null
    }
  }

  /**
   * Get transparency logs
   */
  static async getTransparencyLogs(db: Db, limit: number = 50): Promise<any[]> {
    try {
      return await db.select().from(transparencyLogs).orderBy(desc(transparencyLogs.createdAt)).limit(limit)
    } catch (error) {
      console.error('Error getting transparency logs:', error)
      return []
    }
  }

  /**
   * Get governance activity
   */
  static async getGovernanceActivity(db: Db, limit: number = 50): Promise<any[]> {
    try {
      return await db.select().from(governanceActivity).orderBy(desc(governanceActivity.createdAt)).limit(limit)
    } catch (error) {
      console.error('Error getting governance activity:', error)
      return []
    }
  }

  /**
   * Log transparency event
   */
  private static async logTransparency(db: Db, data: {
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
  }): Promise<void> {
    try {
      const logId = crypto.randomUUID()
      await db.insert(transparencyLogs).values({
        id: logId,
        logType: data.logType as any,
        amount: data.amount,
        feeAmount: data.feeAmount,
        description: data.description,
        userId: data.userId,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        treasuryBalanceBefore: data.treasuryBalanceBefore,
        treasuryBalanceAfter: data.treasuryBalanceAfter,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error logging transparency:', error)
    }
  }

  /**
   * Log governance activity
   */
  private static async logGovernanceActivity(db: Db, data: {
    activityType: string
    amount: number
    description: string
    userId?: string
    referenceId?: string
    referenceType?: string
    metadata?: string
  }): Promise<void> {
    try {
      const activityId = crypto.randomUUID()
      await db.insert(governanceActivity).values({
        id: activityId,
        activityType: data.activityType as any,
        amount: data.amount,
        description: data.description,
        userId: data.userId,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        metadata: data.metadata,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error logging governance activity:', error)
    }
  }

  /**
   * Calculate dynamic daily staking reward rate
   */
  static async calculateDailyRewardRate(db: Db): Promise<{
    baseRate: number
    activityBonus: number
    treasuryBonus: number
    participationPenalty: number
    totalRate: number
    maxRate: number
  }> {
    try {
      // Get platform stats
      const stats = await this.getGovernanceStats(db)
      const treasuryBalance = stats.totalTreasury
      const totalStaked = stats.totalStaked

      // Calculate platform volume (monthly bounty placements)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentActivity = await db.select()
        .from(transparencyLogs)
        .where(
          and(
            eq(transparencyLogs.logType, 'BOUNTY_PLACED'),
            gte(transparencyLogs.createdAt, thirtyDaysAgo)
          )
        )
      
      const monthlyVolume = recentActivity.reduce((sum, log) => sum + log.amount, 0)

      // Base rate: 0.05% daily (18.25% APY)
      const baseRate = 0.0005

      // Activity bonus: +0.02% for high platform volume
      const activityBonus = Math.min(monthlyVolume / 50000, 0.0002)

      // Treasury bonus: +0.01% when treasury is healthy (>100k BBUX)
      const treasuryBonus = treasuryBalance > 100000 ? 0.0001 : 0

      // Participation penalty: higher staking = lower rewards (to prevent concentration)
      let participationPenalty = 0
      if (totalStaked > 100000) {
        participationPenalty = Math.min((totalStaked - 100000) / 1000000, 0.0003)
      }

      // Calculate total rate
      const totalRate = baseRate + activityBonus + treasuryBonus - participationPenalty
      const maxRate = 0.0012 // Cap at 0.12% daily (43.8% APY)

      return {
        baseRate,
        activityBonus,
        treasuryBonus,
        participationPenalty,
        totalRate: Math.min(totalRate, maxRate),
        maxRate
      }
    } catch (error) {
      console.error('Error calculating daily reward rate:', error)
      // Return safe defaults
      return {
        baseRate: 0.0005,
        activityBonus: 0,
        treasuryBonus: 0,
        participationPenalty: 0,
        totalRate: 0.0005,
        maxRate: 0.0012
      }
    }
  }

  /**
   * Get user's personalized staking reward rate
   */
  static async getUserStakingRewardRate(db: Db, userId: string): Promise<{
    baseRate: number
    activityBonus: number
    treasuryBonus: number
    participationPenalty: number
    governanceBonus: number
    totalRate: number
    maxRate: number
  }> {
    try {
      // Get base dynamic rate
      const baseRateInfo = await this.calculateDailyRewardRate(db)
      
      // Check user's governance participation
      const userStats = await this.getUserGovernanceStats(db, userId)
      const governanceParticipation = userStats?.governanceParticipation || 0
      
      // Governance participation bonus: +0.02% for active governance participation
      const governanceBonus = governanceParticipation >= 10 ? 0.0002 : 0

      const totalRate = baseRateInfo.totalRate + governanceBonus

      return {
        baseRate: baseRateInfo.baseRate,
        activityBonus: baseRateInfo.activityBonus,
        treasuryBonus: baseRateInfo.treasuryBonus,
        participationPenalty: baseRateInfo.participationPenalty,
        governanceBonus,
        totalRate: Math.min(totalRate, baseRateInfo.maxRate),
        maxRate: baseRateInfo.maxRate
      }
    } catch (error) {
      console.error('Error calculating user staking reward rate:', error)
      return {
        baseRate: 0.0005,
        activityBonus: 0,
        treasuryBonus: 0,
        participationPenalty: 0,
        governanceBonus: 0,
        totalRate: 0.0005,
        maxRate: 0.0012
      }
    }
  }

  /**
   * Get platform activity metrics for reward calculation
   */
  static async getPlatformActivityMetrics(db: Db): Promise<{
    monthlyVolume: number
    activeStakers: number
    treasuryHealth: 'LOW' | 'MEDIUM' | 'HIGH'
    participationLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  }> {
    try {
      const stats = await this.getGovernanceStats(db)
      
      // Calculate monthly volume
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentActivity = await db.select()
        .from(transparencyLogs)
        .where(
          and(
            eq(transparencyLogs.logType, 'BOUNTY_PLACED'),
            gte(transparencyLogs.createdAt, thirtyDaysAgo)
          )
        )
      
      const monthlyVolume = recentActivity.reduce((sum, log) => sum + log.amount, 0)

      // Determine treasury health
      let treasuryHealth: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      if (stats.totalTreasury > 100000) treasuryHealth = 'HIGH'
      else if (stats.totalTreasury > 50000) treasuryHealth = 'MEDIUM'

      // Determine participation level
      let participationLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      if (stats.activeStakers > 100) participationLevel = 'HIGH'
      else if (stats.activeStakers > 50) participationLevel = 'MEDIUM'

      return {
        monthlyVolume,
        activeStakers: stats.activeStakers,
        treasuryHealth,
        participationLevel
      }
    } catch (error) {
      console.error('Error getting platform activity metrics:', error)
      return {
        monthlyVolume: 0,
        activeStakers: 0,
        treasuryHealth: 'LOW',
        participationLevel: 'LOW'
      }
    }
  }
} 