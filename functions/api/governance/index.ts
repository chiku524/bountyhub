import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { GovernanceService } from '../../../src/utils/governance'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const action = c.req.query('action')

    switch (action) {
      case 'stats': {
        const stats = await GovernanceService.getGovernanceStats(db)
        return c.json({ success: true, stats })
      }
      case 'user-stats': {
        const userStats = await GovernanceService.getUserGovernanceStats(db, userId)
        return c.json({ success: true, userStats })
      }
      case 'reward-rate': {
        const rewardRate = await GovernanceService.calculateDailyRewardRate(db)
        return c.json({ success: true, rewardRate })
      }
      case 'user-reward-rate': {
        const userRewardRate = await GovernanceService.getUserStakingRewardRate(db, userId)
        return c.json({ success: true, userRewardRate })
      }
      case 'platform-metrics': {
        const platformMetrics = await GovernanceService.getPlatformActivityMetrics(db)
        return c.json({ success: true, platformMetrics })
      }
      case 'transparency-logs': {
        const limit = parseInt(c.req.query('limit') || '50')
        const logs = await GovernanceService.getTransparencyLogs(db, limit)
        return c.json({ success: true, logs })
      }
      case 'governance-activity': {
        const activityLimit = parseInt(c.req.query('limit') || '50')
        const activity = await GovernanceService.getGovernanceActivity(db, activityLimit)
        return c.json({ success: true, activity })
      }
      default:
        return c.json({ error: 'Invalid action' }, 400)
    }
  } catch (error) {
    console.error('Governance API error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { action, amount } = await c.req.json()

    switch (action) {
      case 'stake': {
        if (!amount || amount <= 0) {
          return c.json({ error: 'Invalid amount' }, 400)
        }
        const stakeResult = await GovernanceService.stakeForGovernance(db, userId, amount)
        return c.json(stakeResult)
      }
      case 'unstake': {
        if (!amount || amount <= 0) {
          return c.json({ error: 'Invalid amount' }, 400)
        }
        const unstakeResult = await GovernanceService.unstakeFromGovernance(db, userId, amount)
        return c.json(unstakeResult)
      }
      case 'distribute-rewards': {
        const distributeResult = await GovernanceService.distributeStakingRewards(db)
        return c.json(distributeResult)
      }
      default:
        return c.json({ error: 'Invalid action' }, 400)
    }
  } catch (error) {
    console.error('Governance API error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app 