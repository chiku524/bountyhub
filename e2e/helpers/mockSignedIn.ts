import type { Page } from '@playwright/test'

const mockUser = {
  id: 'e2e-user-1',
  email: 'e2e@bountyhub.test',
  username: 'e2e_user',
  reputationPoints: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString()

const mockPosts = [
  {
    id: 'post-1',
    title: 'E2E Sample Bounty Question',
    content: 'How do I test the community feed while signed in?',
    authorId: 'author-1',
    author: {
      id: 'author-1',
      email: 'author@bountyhub.test',
      username: 'author_one',
      reputationPoints: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    status: 'OPEN',
    qualityUpvotes: 12,
    qualityDownvotes: 0,
    commentCount: 1,
    hasBounty: true,
    reward: 50,
    media: [],
    tags: ['testing', 'solana'],
    userVote: 0,
  },
  {
    id: 'post-2',
    title: 'Another E2E Community Post',
    content: 'Second post for layout toggle coverage.',
    authorId: 'author-2',
    author: {
      id: 'author-2',
      email: 'author2@bountyhub.test',
      username: 'author_two',
      reputationPoints: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    status: 'OPEN',
    qualityUpvotes: 1,
    qualityDownvotes: 0,
    commentCount: 0,
    hasBounty: false,
    media: [],
    tags: ['react'],
    userVote: 0,
  },
  {
    id: 'post-3',
    title: 'High Bounty Wallet Integration',
    content: 'Need help wiring Solana wallet adapters.',
    authorId: 'author-1',
    author: {
      id: 'author-1',
      email: 'author@bountyhub.test',
      username: 'author_one',
      reputationPoints: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(20),
    status: 'OPEN',
    qualityUpvotes: 8,
    qualityDownvotes: 0,
    commentCount: 3,
    hasBounty: true,
    reward: 120,
    media: [],
    tags: ['solana', 'wallet'],
    userVote: 0,
  },
  {
    id: 'post-4',
    title: 'Unanswered Rust FFI Question',
    content: 'No answers yet on this FFI edge case.',
    authorId: 'author-2',
    author: {
      id: 'author-2',
      email: 'author2@bountyhub.test',
      username: 'author_two',
      reputationPoints: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(30),
    status: 'OPEN',
    qualityUpvotes: 2,
    qualityDownvotes: 0,
    commentCount: 0,
    hasBounty: false,
    media: [],
    tags: ['rust'],
    userVote: 0,
  },
]

const mockTags = [
  { id: 'tag-1', name: 'solana', description: null, color: '#9945FF' },
  { id: 'tag-2', name: 'react', description: null, color: '#61DAFB' },
  { id: 'tag-3', name: 'testing', description: null, color: '#22C55E' },
  { id: 'tag-4', name: 'rust', description: null, color: '#DEA584' },
  { id: 'tag-5', name: 'wallet', description: null, color: '#F59E0B' },
]

function filterMockPosts(url: string) {
  const u = new URL(url, 'http://localhost')
  let posts = [...mockPosts]
  if (u.searchParams.get('hasBounty') === 'true') {
    posts = posts.filter((p) => p.hasBounty)
  }
  if (u.searchParams.get('unanswered') === 'true') {
    posts = posts.filter((p) => (p.commentCount || 0) === 0)
  }
  if (u.searchParams.get('status')) {
    const status = u.searchParams.get('status')!.toUpperCase()
    posts = posts.filter((p) => p.status === status)
  }
  const sortBy = u.searchParams.get('sortBy') || 'newest'
  posts.sort((a, b) => {
    if (sortBy === 'highestBounty') return (b.reward || 0) - (a.reward || 0)
    if (sortBy === 'trending' || sortBy === 'mostVoted') {
      const score = (p: (typeof mockPosts)[0]) => (p.qualityUpvotes || 0) * 2 + (p.commentCount || 0)
      return score(b) - score(a)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  const limit = Number(u.searchParams.get('limit') || 12)
  return posts.slice(0, limit)
}

/**
 * Mock signed-in session + community APIs via Playwright route interception.
 * Follows the repo's preview e2e approach (no real auth cookie/server required).
 */
export async function mockSignedInCommunity(page: Page): Promise<void> {
  // Prevent Guide welcome dialog from intercepting clicks during e2e.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('bountyhub-guide-welcomed', '1')
      localStorage.setItem('bountyhub-tour-completed', '1')
    } catch {
      /* ignore */
    }
  })

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    })
  })

  await page.route('**/api/tags**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockTags }),
    })
  })

  await page.route('**/api/posts**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }
    const posts = filterMockPosts(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        posts,
        pagination: {
          page: 1,
          limit: 12,
          total: posts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }),
    })
  })

  await page.route('**/api/bookmarks/status**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: {
          'post-1': false,
          'post-2': true,
          'post-3': false,
          'post-4': false,
        },
      }),
    })
  })

  await page.route('**/api/notifications**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route('**/api/wallet**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        address: '',
        bbuxBalance: 0,
        solBalance: 0,
        platformAddress: '',
        virtualBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      }),
    })
  })
}
