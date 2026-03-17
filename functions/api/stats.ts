import { Hono } from 'hono'
import { createDb } from '../../src/utils/db'
import { posts, bounties, users, answers, virtualWallets } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { getCached, setCached } from '../utils/kv'

const STATS_CACHE_KEY = 'stats'
const STATS_TTL = 300 // 5 minutes

interface Env {
  DB: D1Database
  CACHE?: KVNamespace
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  if (c.env.CACHE) {
    const cached = await getCached<Record<string, unknown>>(c.env.CACHE, STATS_CACHE_KEY)
    if (cached) {
      return c.json(cached, 200, {
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'HIT',
      })
    }
  }

  const db = createDb(c.env.DB)

  try {
    // Get active bounties (posts with bounties that are ACTIVE)
    const activeBountiesResult = await db.select().from(bounties).where(eq(bounties.status, 'ACTIVE'))
    const activeBounties = activeBountiesResult.length

    // Get total questions answered (posts with accepted answers)
    const answeredQuestionsResult = await db
      .selectDistinct({ id: posts.id })
      .from(posts)
      .innerJoin(answers, eq(posts.id, answers.postId))
      .where(eq(answers.isAccepted, true))
    const questionsAnswered = answeredQuestionsResult.length

    // Get total rewards (sum of all bounty amounts)
    const totalRewardsResult = await db.select().from(bounties)
    const totalRewards = totalRewardsResult.reduce((sum, bounty) => sum + bounty.amount, 0)

    // Get community members (total users)
    const communityMembersResult = await db.select().from(users)
    const communityMembers = communityMembersResult.length

    // Get total posts
    const totalPostsResult = await db.select().from(posts)
    const totalPosts = totalPostsResult.length

    // Get total answers
    const totalAnswersResult = await db.select().from(answers)
    const totalAnswers = totalAnswersResult.length

    // Get total BBUX in circulation (sum of all wallet balances)
    const totalBBUXResult = await db.select().from(virtualWallets)
    const totalBBUX = totalBBUXResult.reduce((sum, wallet) => sum + wallet.balance, 0)

    const stats = {
      activeBounties,
      questionsAnswered,
      totalRewards: totalRewards.toFixed(2),
      communityMembers,
      totalPosts,
      totalAnswers,
      totalBBUX: totalBBUX.toFixed(2),
    }

    if (c.env.CACHE) {
      await setCached(c.env.CACHE, STATS_CACHE_KEY, stats, STATS_TTL)
    }

    return c.json(stats, 200, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Cache': 'MISS',
    })
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return c.json({ 
      activeBounties: 0,
      questionsAnswered: 0,
      totalRewards: '0.00',
      communityMembers: 0,
      totalPosts: 0,
      totalAnswers: 0,
      totalBBUX: '0.00'
    }, 500)
  }
})

export default app 