import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // For now, return mock data to test the governance feature
  const mockRefundRequests = [
    {
      id: '1',
      reason: 'No helpful answers received within 48 hours',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      communityVotes: 2,
      requiredVotes: 5,
      bounty: {
        id: 'bounty-1',
        amount: 1.5,
        post: {
          id: 'post-1',
          title: 'Help with React state management',
          answers: [{ id: 'answer-1' }]
        }
      },
      requester: {
        id: 'user-1',
        username: 'john_doe'
      },
      votes: [
        {
          id: 'vote-1',
          vote: true,
          voterId: 'voter-1',
          reason: 'Legitimate request - no helpful answers provided',
          createdAt: new Date().toISOString(),
          rewardAmount: 0.015
        },
        {
          id: 'vote-2',
          vote: false,
          voterId: 'voter-2',
          reason: 'There was one answer that could be helpful',
          createdAt: new Date().toISOString(),
          rewardAmount: 0.015
        }
      ]
    },
    {
      id: '2',
      reason: 'Question was already answered elsewhere',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      communityVotes: 1,
      requiredVotes: 5,
      bounty: {
        id: 'bounty-2',
        amount: 2.0,
        post: {
          id: 'post-2',
          title: 'How to implement authentication in Next.js',
          answers: [{ id: 'answer-2' }, { id: 'answer-3' }]
        }
      },
      requester: {
        id: 'user-2',
        username: 'jane_smith'
      },
      votes: [
        {
          id: 'vote-3',
          vote: true,
          voterId: 'voter-3',
          reason: 'Valid reason - question was indeed answered elsewhere',
          createdAt: new Date().toISOString(),
          rewardAmount: 0.02
        }
      ]
    }
  ]

  return c.json(mockRefundRequests)
})

export default app 