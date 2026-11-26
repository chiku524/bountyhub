import { and, desc, eq, gt, inArray, isNull, lt, lte, ne, or, sql } from 'drizzle-orm'
import { createDb } from '../../src/utils/db'
import { answers, bounties, notificationSettings, posts, users } from '../../drizzle/schema'
import { randomDigestToken, type DigestFrequency } from '../../src/utils/notificationPreferences'
import { escapeHtml, frontendBaseUrl, sendEmailBatch, type EmailEnv, type EmailMessage } from './email'

/**
 * Optional daily / weekly email digest: new answers on the user's questions, the user's own bounties that
 * are about to end, and open bounties ending soon that they could still answer.
 *
 * The hourly cron calls runEmailDigests(). Daily digests go out from DIGEST_SEND_HOUR_UTC each day and
 * weekly ones from that hour on Mondays; any hourly run after the send time picks up users not yet sent,
 * so a large batch spreads over several runs and a missed run catches up on the next one.
 */
export const DIGEST_SEND_HOUR_UTC = 14
const DAY_MS = 24 * 60 * 60 * 1000
/** Users handled per chunk. D1 allows 100 bound parameters per query, so keep id lists well under that. */
const USERS_PER_CHUNK = 50
const CHUNKS_PER_RUN = 4
const MAX_ITEMS_PER_SECTION = 10
const OPEN_BOUNTIES_PER_EMAIL = 5

export type ActiveDigestFrequency = Exclude<DigestFrequency, 'off'>

export function digestPeriodMs(freq: ActiveDigestFrequency): number {
  return freq === 'daily' ? DAY_MS : 7 * DAY_MS
}

/** How far ahead a bounty counts as "about to expire" for this digest. */
export function expiringHorizonMs(freq: ActiveDigestFrequency): number {
  return freq === 'daily' ? 2 * DAY_MS : 7 * DAY_MS
}

/** The most recent scheduled send time at or before `now`. */
export function digestSlotStart(freq: ActiveDigestFrequency, now: Date): Date {
  const slot = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), DIGEST_SEND_HOUR_UTC))
  if (slot.getTime() > now.getTime()) slot.setUTCDate(slot.getUTCDate() - 1)
  if (freq === 'weekly') {
    const daysSinceMonday = (slot.getUTCDay() + 6) % 7
    slot.setUTCDate(slot.getUTCDate() - daysSinceMonday)
  }
  return slot
}

export function isDigestDue(freq: DigestFrequency, lastSentAt: Date | null, now: Date): boolean {
  if (freq === 'off') return false
  return !lastSentAt || lastSentAt.getTime() < digestSlotStart(freq, now).getTime()
}

/** Activity since the last digest, but never more than one period back. */
export function digestWindowStart(freq: ActiveDigestFrequency, lastSentAt: Date | null, now: Date): Date {
  const floor = now.getTime() - digestPeriodMs(freq)
  return new Date(Math.max(lastSentAt?.getTime() ?? 0, floor))
}

export function formatTimeLeft(expiresAt: Date, now: Date): string {
  const ms = expiresAt.getTime() - now.getTime()
  const hours = Math.max(1, Math.round(ms / (60 * 60 * 1000)))
  if (hours < 24) return `ends in ${hours} hour${hours === 1 ? '' : 's'}`
  const days = Math.round(hours / 24)
  return `ends in ${days} day${days === 1 ? '' : 's'}`
}

export interface DigestAnswer {
  postId: string
  postTitle: string
  answererUsername: string
}

export interface DigestBounty {
  postId: string
  title: string
  amount: number
  expiresAt: Date
  answerCount: number
}

export interface DigestContent {
  username: string
  frequency: ActiveDigestFrequency
  newAnswers: DigestAnswer[]
  yourBounties: DigestBounty[]
  openBounties: DigestBounty[]
  baseUrl: string
  unsubscribeUrl: string
  now: Date
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

/** Builds the email, or returns null when there is nothing worth sending. */
export function buildDigestEmail(d: DigestContent): Omit<EmailMessage, 'to'> | null {
  if (d.newAnswers.length + d.yourBounties.length + d.openBounties.length === 0) return null

  const postUrl = (id: string) => `${d.baseUrl}/posts/${encodeURIComponent(id)}`
  const settingsUrl = `${d.baseUrl}/settings?tab=notifications`
  const label = d.frequency === 'daily' ? 'daily' : 'weekly'

  const summary: string[] = []
  if (d.newAnswers.length) summary.push(plural(d.newAnswers.length, 'new answer'))
  if (d.yourBounties.length) summary.push(`${plural(d.yourBounties.length, 'bounty', 'bounties')} of yours ending soon`)
  if (!summary.length) summary.push(`${plural(d.openBounties.length, 'open bounty', 'open bounties')} ending soon`)
  const subject = `Your BountyHub ${label} digest: ${summary.join(', ')}`

  const text: string[] = [`Hi ${d.username},`, '', `Here's your ${label} BountyHub digest.`]
  const html: string[] = [
    `<p>Hi ${escapeHtml(d.username)},</p>`,
    `<p>Here's your ${label} BountyHub digest.</p>`,
  ]

  const section = <T,>(
    heading: string,
    items: T[],
    line: (item: T) => { text: string; html: string }
  ) => {
    if (!items.length) return
    const shown = items.slice(0, MAX_ITEMS_PER_SECTION)
    text.push('', heading)
    html.push(`<h3 style="margin:20px 0 8px">${escapeHtml(heading)}</h3>`, '<ul style="padding-left:20px;margin:0">')
    for (const item of shown) {
      const l = line(item)
      text.push(`- ${l.text}`)
      html.push(`<li style="margin:4px 0">${l.html}</li>`)
    }
    if (items.length > shown.length) {
      text.push(`- and ${items.length - shown.length} more`)
      html.push(`<li style="margin:4px 0">and ${items.length - shown.length} more</li>`)
    }
    html.push('</ul>')
  }

  section('New answers to your questions', d.newAnswers, (a) => ({
    text: `${a.answererUsername} answered "${a.postTitle}": ${postUrl(a.postId)}`,
    html: `<strong>${escapeHtml(a.answererUsername)}</strong> answered <a href="${postUrl(a.postId)}">${escapeHtml(a.postTitle)}</a>`,
  }))

  section('Your bounties ending soon', d.yourBounties, (b) => {
    const hint = b.answerCount > 0
      ? `${plural(b.answerCount, 'answer')}, accept one before it ends`
      : 'no answers yet; it will be refunded if none arrive'
    return {
      text: `"${b.title}" (${b.amount} BBUX) ${formatTimeLeft(b.expiresAt, d.now)}, ${hint}: ${postUrl(b.postId)}`,
      html: `<a href="${postUrl(b.postId)}">${escapeHtml(b.title)}</a> (${b.amount} BBUX) ${formatTimeLeft(b.expiresAt, d.now)}, ${escapeHtml(hint)}`,
    }
  })

  section('Open bounties ending soon', d.openBounties, (b) => ({
    text: `"${b.title}" (${b.amount} BBUX) ${formatTimeLeft(b.expiresAt, d.now)}: ${postUrl(b.postId)}`,
    html: `<a href="${postUrl(b.postId)}">${escapeHtml(b.title)}</a> (${b.amount} BBUX) ${formatTimeLeft(b.expiresAt, d.now)}`,
  }))

  text.push(
    '',
    `Change what you get: ${settingsUrl}`,
    `Stop these emails: ${d.unsubscribeUrl}`
  )
  html.push(
    `<p style="margin-top:24px;font-size:12px;color:#666">You're getting this because you turned on the ${label} digest. ` +
      `<a href="${settingsUrl}">Change notification settings</a> or <a href="${d.unsubscribeUrl}">unsubscribe</a>.</p>`
  )

  return {
    subject,
    text: text.join('\n') + '\n',
    html: html.join(''),
    headers: { 'List-Unsubscribe': `<${d.unsubscribeUrl}>` },
  }
}

export type DigestRunResult = { considered: number; sent: number; skippedEmpty: number; errors: number }

type DueUser = {
  userId: string
  email: string
  username: string
  frequency: ActiveDigestFrequency
  lastDigestSentAt: Date | null
  digestToken: string | null
}

/** Sends every digest that is due (bounded per run). Safe to call every hour. */
export async function runEmailDigests(env: EmailEnv & { DB: any; FRONTEND_URL?: string }, now = new Date()): Promise<DigestRunResult> {
  const db = createDb(env.DB)
  const result: DigestRunResult = { considered: 0, sent: 0, skippedEmpty: 0, errors: 0 }
  const baseUrl = frontendBaseUrl(env)
  const dailySlot = digestSlotStart('daily', now)
  const weeklySlot = digestSlotStart('weekly', now)
  const maxHorizon = new Date(now.getTime() + expiringHorizonMs('weekly'))

  // Open bounties ending within the longest horizon, biggest first; filtered per user below.
  const openBountyRows = await db
    .select({
      postId: posts.id,
      title: posts.title,
      authorId: posts.authorId,
      amount: bounties.amount,
      expiresAt: bounties.expiresAt,
      answerCount: sql<number>`(select count(*) from ${answers} where ${answers.postId} = ${posts.id})`,
    })
    .from(bounties)
    .innerJoin(posts, eq(bounties.postId, posts.id))
    .where(and(eq(bounties.status, 'ACTIVE'), gt(bounties.expiresAt, now), lte(bounties.expiresAt, maxHorizon)))
    .orderBy(desc(bounties.amount))
    .limit(20)

  for (let chunk = 0; chunk < CHUNKS_PER_RUN; chunk++) {
    const dueRows = await db
      .select({
        userId: notificationSettings.userId,
        email: users.email,
        username: users.username,
        frequency: notificationSettings.digestFrequency,
        lastDigestSentAt: notificationSettings.lastDigestSentAt,
        digestToken: notificationSettings.digestToken,
      })
      .from(notificationSettings)
      .innerJoin(users, eq(notificationSettings.userId, users.id))
      .where(
        or(
          and(
            eq(notificationSettings.digestFrequency, 'daily'),
            or(isNull(notificationSettings.lastDigestSentAt), lt(notificationSettings.lastDigestSentAt, dailySlot))
          ),
          and(
            eq(notificationSettings.digestFrequency, 'weekly'),
            or(isNull(notificationSettings.lastDigestSentAt), lt(notificationSettings.lastDigestSentAt, weeklySlot))
          )
        )
      )
      .limit(USERS_PER_CHUNK)
    const due = dueRows as DueUser[]
    if (due.length === 0) break
    result.considered += due.length

    try {
      result.sent += await processChunk(db, env, due, openBountyRows, baseUrl, now, result)
    } catch (err) {
      result.errors += due.length
      console.error('[digest] chunk failed', err)
    }

    // Mark the whole chunk handled (sent, empty or failed) so a provider outage can't cause a resend loop.
    await db
      .update(notificationSettings)
      .set({ lastDigestSentAt: now })
      .where(inArray(notificationSettings.userId, due.map((u) => u.userId)))

    if (due.length < USERS_PER_CHUNK) break
  }
  return result
}

async function processChunk(
  db: ReturnType<typeof createDb>,
  env: EmailEnv,
  due: DueUser[],
  openBountyRows: Array<Omit<DigestBounty, 'expiresAt'> & { authorId: string; expiresAt: Date | null }>,
  baseUrl: string,
  now: Date,
  result: DigestRunResult
): Promise<number> {
  const ids = due.map((u) => u.userId)
  const earliestWindow = new Date(
    Math.min(...due.map((u) => digestWindowStart(u.frequency, u.lastDigestSentAt, now).getTime()))
  )

  const answerer = sql<string>`(select ${users.username} from ${users} where ${users.id} = ${answers.authorId})`
  const newAnswerRows = await db
    .select({
      askerId: posts.authorId,
      postId: posts.id,
      postTitle: posts.title,
      answererUsername: answerer,
      createdAt: answers.createdAt,
    })
    .from(answers)
    .innerJoin(posts, eq(answers.postId, posts.id))
    .where(and(inArray(posts.authorId, ids), gt(answers.createdAt, earliestWindow), ne(answers.authorId, posts.authorId)))
    .orderBy(desc(answers.createdAt))
    .limit(1000)

  const ownBountyRows = await db
    .select({
      authorId: posts.authorId,
      postId: posts.id,
      title: posts.title,
      amount: bounties.amount,
      expiresAt: bounties.expiresAt,
      answerCount: sql<number>`(select count(*) from ${answers} where ${answers.postId} = ${posts.id})`,
    })
    .from(bounties)
    .innerJoin(posts, eq(bounties.postId, posts.id))
    .where(
      and(
        inArray(posts.authorId, ids),
        eq(bounties.status, 'ACTIVE'),
        gt(bounties.expiresAt, now),
        lte(bounties.expiresAt, new Date(now.getTime() + expiringHorizonMs('weekly')))
      )
    )
    .orderBy(bounties.expiresAt)
    .limit(500)

  // Skip open bounties the user already answered.
  const openPostIds = openBountyRows.map((b) => b.postId)
  const answeredOpen = new Set<string>()
  if (openPostIds.length) {
    const rows = await db
      .select({ authorId: answers.authorId, postId: answers.postId })
      .from(answers)
      .where(and(inArray(answers.authorId, ids), inArray(answers.postId, openPostIds)))
    for (const r of rows) answeredOpen.add(`${r.authorId}:${r.postId}`)
  }

  const messages: EmailMessage[] = []
  for (const user of due) {
    const windowStart = digestWindowStart(user.frequency, user.lastDigestSentAt, now).getTime()
    const horizon = now.getTime() + expiringHorizonMs(user.frequency)
    const endsSoon = (b: { expiresAt: Date | null }) => !!b.expiresAt && b.expiresAt.getTime() <= horizon

    const newAnswers = newAnswerRows
      .filter((a) => a.askerId === user.userId && a.createdAt.getTime() > windowStart)
      .map((a) => ({ postId: a.postId, postTitle: a.postTitle, answererUsername: a.answererUsername || 'Someone' }))
    const yourBounties = ownBountyRows
      .filter((b) => b.authorId === user.userId && endsSoon(b))
      .map((b) => ({ ...b, expiresAt: b.expiresAt as Date, answerCount: Number(b.answerCount) }))
    const openBounties = openBountyRows
      .filter((b) => b.authorId !== user.userId && endsSoon(b) && !answeredOpen.has(`${user.userId}:${b.postId}`))
      .slice(0, OPEN_BOUNTIES_PER_EMAIL)
      .map((b) => ({ ...b, expiresAt: b.expiresAt as Date, answerCount: Number(b.answerCount) }))

    let token = user.digestToken
    if (!token) {
      token = randomDigestToken()
      await db.update(notificationSettings).set({ digestToken: token }).where(eq(notificationSettings.userId, user.userId))
    }

    const email = buildDigestEmail({
      username: user.username || 'there',
      frequency: user.frequency,
      newAnswers,
      yourBounties,
      openBounties,
      baseUrl,
      unsubscribeUrl: `${baseUrl}/email/unsubscribe?token=${token}`,
      now,
    })
    if (!email) {
      result.skippedEmpty++
      continue
    }
    messages.push({ ...email, to: user.email })
  }

  const sent = await sendEmailBatch(env, messages)
  if (sent.error && env.RESEND_API_KEY) result.errors += messages.length
  return sent.sent
}
