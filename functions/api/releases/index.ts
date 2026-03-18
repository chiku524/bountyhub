import { Hono } from 'hono'

interface Env {
  /** GitHub PAT with repo scope (for private repos). Set via: wrangler secret put GITHUB_PAT */
  GITHUB_PAT?: string
  /** Repo owner/name for releases, e.g. chiku524/bountyhub */
  GITHUB_RELEASES_REPO?: string
}

const DEFAULT_REPO = 'chiku524/bountyhub'

const app = new Hono<{ Bindings: Env }>()

/**
 * GET /api/releases/latest
 * Proxies GitHub releases/latest using GITHUB_PAT so private repos work.
 * Returns { assets: [{ name, browser_download_url }] } for the download page.
 */
app.get('/latest', async (c) => {
  const repo = c.env.GITHUB_RELEASES_REPO || DEFAULT_REPO
  const pat = c.env.GITHUB_PAT

  if (!pat) {
    return c.json(
      { error: 'Releases not configured', message: 'GITHUB_PAT is not set' },
      503
    )
  }

  const url = `https://api.github.com/repos/${repo}/releases/latest`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'BountyHub-Download-Page',
    Authorization: `Bearer ${pat}`,
  }

  try {
    const r = await fetch(url, { headers })
    const data = await r.json().catch(() => ({}))

    if (!r.ok) {
      return c.json(
        {
          error: 'Failed to fetch release',
          status: r.status,
          message: (data as { message?: string }).message || r.statusText,
        },
        r.status === 404 ? 404 : 502
      )
    }

    const assets = (data as { assets?: unknown[] }).assets
    if (!Array.isArray(assets)) {
      return c.json(
        { error: 'Invalid release response', message: 'No assets array' },
        502
      )
    }

    return c.json({ assets })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ error: 'Failed to fetch release', message }, 502)
  }
})

export default app
