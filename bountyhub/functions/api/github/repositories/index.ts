import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../src/utils/auth'
import { githubRepositories, users, profiles } from '../../../../drizzle/schema'
import { eq, sql, desc } from 'drizzle-orm'

interface Env {
  DB: any
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// GET all repositories for authenticated user
app.get(async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
    const offset = (page - 1) * limit

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(githubRepositories)
      .where(eq(githubRepositories.ownerId, userId))
    
    const total = Number(totalResult[0]?.count || 0)

    // Get repositories
    const repositories = await db
      .select({
        repository: githubRepositories,
        owner: {
          id: users.id,
          username: users.username,
          avatarUrl: profiles.profilePicture,
        }
      })
      .from(githubRepositories)
      .leftJoin(users, eq(githubRepositories.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(githubRepositories.ownerId, userId))
      .orderBy(desc(githubRepositories.createdAt))
      .limit(limit)
      .offset(offset)

    return c.json({
      repositories: repositories.map(item => ({
        ...item.repository,
        owner: item.owner,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return c.json({ error: 'Failed to fetch repositories' }, 500)
  }
})

// POST sync repositories from GitHub
app.post('/sync', async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    // Get user's GitHub access token
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user[0]?.githubAccessToken) {
      return c.json({ error: 'GitHub account not connected' }, 400)
    }

    // Fetch repositories from GitHub API
    const githubResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `token ${user[0].githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    })

    if (!githubResponse.ok) {
      return c.json({ error: 'Failed to fetch repositories from GitHub' }, 500)
    }

    const githubRepos = await githubResponse.json() as any[]
    const now = new Date()

    // Sync repositories
    const syncedRepos = []
    for (const repo of githubRepos) {
      // Check if repository already exists
      const existing = await db
        .select()
        .from(githubRepositories)
        .where(eq(githubRepositories.githubRepoId, repo.id))
        .limit(1)

      const repoData = {
        id: existing[0]?.id || crypto.randomUUID(),
        ownerId: userId,
        githubRepoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || null,
        url: repo.url,
        htmlUrl: repo.html_url,
        language: repo.language || null,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        isPrivate: repo.private ? 1 : 0,
        isFork: repo.fork ? 1 : 0,
        defaultBranch: repo.default_branch || 'main',
        topics: repo.topics ? JSON.stringify(repo.topics) : null,
        lastSyncedAt: now,
        createdAt: existing[0]?.createdAt || now,
        updatedAt: now,
      }

      if (existing[0]) {
        await db
          .update(githubRepositories)
          .set(repoData)
          .where(eq(githubRepositories.id, existing[0].id))
        syncedRepos.push({ ...repoData, id: existing[0].id })
      } else {
        const [inserted] = await db.insert(githubRepositories).values(repoData).returning()
        syncedRepos.push(inserted)
      }
    }

    return c.json({
      message: 'Repositories synced successfully',
      count: syncedRepos.length,
      repositories: syncedRepos,
    })
  } catch (error) {
    console.error('Error syncing repositories:', error)
    return c.json({ error: 'Failed to sync repositories' }, 500)
  }
})

export default app

