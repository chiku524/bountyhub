import fs from 'node:fs'
import path from 'node:path'
import { Hono } from 'hono'
import { Miniflare } from 'miniflare'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import bugBountyRoutes from './index'

// End-to-end checks of campaign budget escrow against a real (local) D1 database.

let mf: Miniflare
let d1: any
const app = new Hono<{ Bindings: { DB: any }; Variables: { sessionId: string } }>()
app.use('*', async (c, next) => {
  c.set('sessionId', c.req.header('x-session') || '')
  await next()
})
app.route('/api/bug-bounty', bugBountyRoutes as any)

async function applyMigrations() {
  const dir = path.resolve(__dirname, '../../../drizzle/migrations')
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    const statements = fs
      .readFileSync(path.join(dir, file), 'utf8')
      .split(/--> statement-breakpoint|;\s*\n/)
      .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
      .filter(Boolean)
    for (const statement of statements) {
      // Older migrations repeat some objects; those errors don't matter for these tables.
      await d1.prepare(statement).run().catch(() => {})
    }
  }
}

async function addUser(id: string, balance: number, role = 'user') {
  await d1.prepare(`INSERT INTO users (id, email, username, password, role, created_at, updated_at) VALUES (?, ?, ?, 'x', ?, 0, 0)`)
    .bind(id, `${id}@example.test`, id, role).run()
  await d1.prepare(`INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, 0)`)
    .bind(`s-${id}`, id, Math.floor(Date.now() / 1000) + 3600).run()
  await d1.prepare(`INSERT INTO virtual_wallets (id, user_id, balance, total_deposited, total_withdrawn, total_earned, total_spent, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0)`)
    .bind(`w-${id}`, id, balance, balance).run()
}

async function balance(userId: string) {
  const row = await d1.prepare('SELECT balance FROM virtual_wallets WHERE user_id = ?').bind(userId).first()
  return row?.balance as number
}

function call(method: string, url: string, user: string, body?: unknown) {
  return app.request(url, {
    method,
    headers: { 'content-type': 'application/json', 'x-session': `s-${user}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, { DB: d1 })
}

async function createCampaign(user: string, totalBudget: number, minReward = 10, maxReward = 100) {
  return call('POST', '/api/bug-bounty/campaigns', user, { title: 'T', description: 'D', totalBudget, minReward, maxReward })
}

async function submit(campaignId: string, user: string) {
  const res = await call('POST', `/api/bug-bounty/campaigns/${campaignId}/submissions`, user, { title: 'Bug', description: 'D', severity: 'HIGH' })
  return (await res.json() as any).id as string
}

const award = (id: string, user: string, rewardAmount: number) =>
  call('PUT', `/api/bug-bounty/submissions/${id}`, user, { status: 'AWARDED', rewardAmount })

beforeAll(async () => {
  mf = new Miniflare({ modules: true, script: 'export default { fetch() { return new Response("") } }', d1Databases: ['DB'] })
  d1 = await mf.getD1Database('DB')
  await applyMigrations()
}, 30000)

afterAll(async () => {
  await mf?.dispose()
})

let n = 0
let owner: string
let hunter: string
beforeEach(async () => {
  n += 1
  owner = `owner${n}`
  hunter = `hunter${n}`
  await addUser(owner, 500)
  await addUser(hunter, 0)
})

describe('bug bounty budget escrow', () => {
  it('holds the budget at creation and rejects a budget the owner cannot cover', async () => {
    const res = await createCampaign(owner, 300)
    expect(res.status).toBe(201)
    expect(await balance(owner)).toBe(200)

    const tooBig = await createCampaign(owner, 300)
    expect(tooBig.status).toBe(400)
    expect(await balance(owner)).toBe(200)
  })

  it('pays the award from the budget and refunds the rest on close', async () => {
    const campaign = await (await createCampaign(owner, 300)).json() as any
    await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { status: 'ACTIVE' })
    const sub = await submit(campaign.id, hunter)

    expect((await award(sub, owner, 80)).status).toBe(200)
    expect(await balance(hunter)).toBe(80)
    expect(await balance(owner)).toBe(200)

    // Re-sending the award is a no-op, a different amount is refused, and neither pays again.
    expect((await award(sub, owner, 80)).status).toBe(200)
    expect((await award(sub, owner, 90)).status).toBe(409)
    expect(await balance(hunter)).toBe(80)

    const closed = await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { status: 'COMPLETED' })
    expect(closed.status).toBe(200)
    expect((await closed.json() as any).remainingBudget).toBe(0)
    expect(await balance(owner)).toBe(420)

    // Closing again or reopening can't refund twice.
    expect((await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { status: 'ACTIVE' })).status).toBe(409)
    expect(await balance(owner)).toBe(420)
  })

  it('checks awards against min, max and the remaining budget', async () => {
    const campaign = await (await createCampaign(owner, 150, 10, 100)).json() as any
    await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { status: 'ACTIVE' })
    const a = await submit(campaign.id, hunter)
    const b = await submit(campaign.id, hunter)

    expect((await award(a, owner, 5)).status).toBe(400)
    expect((await award(a, owner, 101)).status).toBe(400)
    expect((await award(a, owner, 100)).status).toBe(200)
    // Only 50 left.
    expect((await award(b, owner, 60)).status).toBe(400)
    expect(await balance(hunter)).toBe(100)
    const after = await d1.prepare('SELECT status FROM bug_submissions WHERE id = ?').bind(b).first()
    expect(after.status).toBe('SUBMITTED')
  })

  it('only lets the owner or an admin award', async () => {
    const campaign = await (await createCampaign(owner, 100)).json() as any
    await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { status: 'ACTIVE' })
    const sub = await submit(campaign.id, hunter)
    expect((await award(sub, hunter, 50)).status).toBe(403)
    expect(await balance(hunter)).toBe(0)
  })

  it('moves the difference when the budget changes and refunds a deleted draft', async () => {
    const campaign = await (await createCampaign(owner, 100)).json() as any
    expect((await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { totalBudget: 250 })).status).toBe(200)
    expect(await balance(owner)).toBe(250)
    expect((await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { totalBudget: 1000 })).status).toBe(400)
    expect((await call('PUT', `/api/bug-bounty/campaigns/${campaign.id}`, owner, { totalBudget: 150 })).status).toBe(200)
    expect(await balance(owner)).toBe(350)

    expect((await call('DELETE', `/api/bug-bounty/campaigns/${campaign.id}`, owner)).status).toBe(200)
    expect(await balance(owner)).toBe(500)
  })

  it('charges the owner at award time for campaigns created before escrow', async () => {
    await d1.prepare(`INSERT INTO bug_bounty_campaigns (id, title, description, owner_id, status, total_budget, remaining_budget, min_reward, max_reward, created_at, updated_at) VALUES (?, 'Old', 'D', ?, 'ACTIVE', 1000, 1000, 0, 0, 0, 0)`)
      .bind(`legacy${n}`, owner).run()
    const sub = await submit(`legacy${n}`, hunter)
    expect((await award(sub, owner, 600)).status).toBe(400)
    expect(await balance(owner)).toBe(500)
    expect((await d1.prepare('SELECT remaining_budget FROM bug_bounty_campaigns WHERE id = ?').bind(`legacy${n}`).first()).remaining_budget).toBe(1000)

    expect((await award(sub, owner, 200)).status).toBe(200)
    expect(await balance(owner)).toBe(300)
    expect(await balance(hunter)).toBe(200)

    // Closing an unfunded campaign returns nothing, since nothing was held.
    expect((await call('PUT', `/api/bug-bounty/campaigns/legacy${n}`, owner, { status: 'CANCELLED' })).status).toBe(200)
    expect(await balance(owner)).toBe(300)
  })
})
