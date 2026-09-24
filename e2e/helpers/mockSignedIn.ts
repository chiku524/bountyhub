import type { Page } from '@playwright/test'

const mockUser = {
  id: 'e2e-user-1',
  email: 'e2e@bountyhub.test',
  username: 'e2e_user',
  reputationPoints: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

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
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-01T12:00:00.000Z',
    status: 'OPEN',
    qualityUpvotes: 3,
    qualityDownvotes: 0,
    commentCount: 1,
    hasBounty: true,
    reward: 25,
    media: [],
    tags: ['testing'],
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
    createdAt: '2026-09-02T12:00:00.000Z',
    updatedAt: '2026-09-02T12:00:00.000Z',
    status: 'OPEN',
    qualityUpvotes: 1,
    qualityDownvotes: 0,
    commentCount: 0,
    hasBounty: false,
    media: [],
    tags: [],
    userVote: 0,
  },
]

/**
 * Mock signed-in session + community APIs via Playwright route interception.
 * Follows the repo's preview e2e approach (no real auth cookie/server required).
 */
export async function mockSignedInCommunity(page: Page): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    })
  })

  await page.route('**/api/posts**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        posts: mockPosts,
        pagination: {
          page: 1,
          limit: 12,
          total: mockPosts.length,
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
      body: JSON.stringify({ status: { 'post-1': false, 'post-2': true } }),
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
