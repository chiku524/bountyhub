import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { getAuthUser } from '../../../utils/auth'
import { githubRepositories, users, profiles } from '../../../../drizzle/schema'
import { eq, sql, desc } from 'drizzle-orm'

interface Env {
  DB: any
  NODE_ENV?: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// GET all repositories for authenticated user
app.get(async (c) => {
  const db = createDb(c.env.DB)

  try {
    const authUser = await getAuthUser(c)
    if (!authUser) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    const userId = authUser.id

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
  let userId: string | null = null

  try {
    const authUser = await getAuthUser(c)
    if (!authUser) {
      return c.json({ error: 'Not authenticated', phase: 'auth' }, 401)
    }
    userId = authUser.id

    // Get user's GitHub access token and full user row
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      console.error('User not found:', userId)
      return c.json({ error: 'User not found', phase: 'auth' }, 404)
    }

    if (!user.githubAccessToken) {
      console.error('No GitHub access token for user:', userId, {
        hasGithubId: !!user.githubId,
        hasGithubUsername: !!user.githubUsername
      })
      return c.json({
        error: 'GitHub account not connected. Please reconnect your GitHub account from Settings.',
        phase: 'auth',
        requiresReconnect: true
      }, 400)
    }

    console.log('Fetching repositories for user:', userId, {
      hasToken: !!user.githubAccessToken,
      tokenLength: user.githubAccessToken.length,
      githubUsername: user.githubUsername
    })

    // Fetch repositories from GitHub API
    const githubResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${user.githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BountyHub-OAuth'
      }
    })

    if (!githubResponse.ok) {
      let errorText = ''
      let errorJson: any = null

      try {
        errorText = await githubResponse.text()
        try {
          errorJson = JSON.parse(errorText)
        } catch {
          // Not JSON, use text as is
        }
      } catch (e) {
        errorText = 'Failed to read error response'
      }

      console.error('GitHub API error:', {
        status: githubResponse.status,
        statusText: githubResponse.statusText,
        error: errorText,
        errorJson,
        hasToken: !!user.githubAccessToken,
        tokenLength: user.githubAccessToken?.length || 0,
        tokenPrefix: user.githubAccessToken?.substring(0, 10) || 'none'
      })
      
      // Provide more specific error messages
      if (githubResponse.status === 401) {
        return c.json({ 
          error: 'GitHub access token is invalid or expired. Please reconnect your GitHub account.',
          details: errorJson?.message || errorText,
          requiresReconnect: true
        }, 401)
      } else if (githubResponse.status === 403) {
        // Check if it's a permissions issue (likely missing repo scope)
        const isPermissionsError = errorText.includes('permission') || 
                                   errorText.includes('scope') || 
                                   errorText.includes('insufficient') ||
                                   (errorJson?.message && (
                                     errorJson.message.includes('permission') ||
                                     errorJson.message.includes('scope') ||
                                     errorJson.message.includes('insufficient')
                                   ))
        
        if (isPermissionsError) {
          return c.json({ 
            error: 'GitHub token does not have repository access permissions. Please disconnect and reconnect your GitHub account to grant repository access.',
            details: errorJson?.message || errorText,
            requiresReconnect: true
          }, 403)
        }
        
        return c.json({ 
          error: 'GitHub API rate limit exceeded or insufficient permissions.',
          details: errorJson?.message || errorText
        }, 403)
      }
      
      return c.json({
        error: `Failed to fetch repositories from GitHub: ${githubResponse.statusText}`,
        details: errorJson?.message || errorText,
        githubStatus: githubResponse.status,
        requiresReconnect: githubResponse.status === 401 || githubResponse.status === 403
      }, 500)
    }

    let githubRepos: any[] = []
    try {
      githubRepos = await githubResponse.json() as any[]
    } catch (parseError: any) {
      console.error('Error parsing GitHub response:', parseError)
      return c.json({ 
        error: 'Failed to parse GitHub API response',
        details: parseError?.message || 'Invalid JSON response from GitHub'
      }, 500)
    }
    const now = new Date()

    console.log(`Syncing ${githubRepos.length} repositories for user ${userId}`)

    // Sync repositories
    const syncedRepos = []
    for (const repo of githubRepos) {
      try {
        // Check if repository already exists for this user
        const existing = await db
          .select()
          .from(githubRepositories)
          .where(
            eq(githubRepositories.githubRepoId, repo.id)
          )
          .limit(1)

        const repoData: any = {
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
          isPrivate: repo.private || false,
          isFork: repo.fork || false,
          defaultBranch: repo.default_branch || 'main',
          topics: repo.topics ? JSON.stringify(repo.topics) : null,
          lastSyncedAt: now,
          updatedAt: now,
        }

        if (existing[0]) {
          // Update existing repository - only if it belongs to this user
          if (existing[0].ownerId !== userId) {
            console.log(`Skipping repo ${repo.full_name} - belongs to different user`)
            continue
          }
          
          const repoId = existing[0].id
          await db
            .update(githubRepositories)
            .set(repoData)
            .where(eq(githubRepositories.id, repoId))
          
          syncedRepos.push({ ...repoData, id: repoId, createdAt: existing[0].createdAt })
        } else {
          // Insert new repository
          const repoId = crypto.randomUUID()
          repoData.id = repoId
          repoData.createdAt = now
          
          await db.insert(githubRepositories).values(repoData)
          syncedRepos.push(repoData)
        }
      } catch (repoError: any) {
        console.error(`Error syncing repo ${repo.full_name}:`, {
          message: repoError?.message,
          stack: repoError?.stack,
          repo: repo.full_name
        })
        // Continue with other repos even if one fails
        continue
      }
    }

    return c.json({
      message: 'Repositories synced successfully',
      count: syncedRepos.length,
      repositories: syncedRepos,
    })
  } catch (error: any) {
    console.error('Error syncing repositories:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      error: error,
      userId: userId || 'unknown'
    })

    const errorMessage = error?.message || 'Unknown error'
    const isProduction = c.env.NODE_ENV === 'production'

    return c.json({
      error: 'Failed to sync repositories',
      details: errorMessage,
      phase: 'sync',
      requiresReconnect: false,
      ...(isProduction ? {} : { stack: error?.stack?.substring(0, 500) })
    }, 500)
  }
})

export default app

