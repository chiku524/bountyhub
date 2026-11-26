import { and, eq, inArray } from 'drizzle-orm'
import { notifications, notificationSettings, postWatches, tagFollows } from '../../drizzle/schema'
import type { NotificationType } from './notifications'

/**
 * Fan-out notifications for followed tags and watched questions.
 *
 * Every helper here swallows its own errors: a failed notification must never
 * fail the answer, comment, post or accept that triggered it.
 */

/** D1 allows 100 bound parameters per statement; a notification row binds 11. */
const NOTIFICATION_INSERT_CHUNK = 8
/** Keeps a single request's fan-out bounded on very popular tags or questions. */
export const MAX_FANOUT_RECIPIENTS = 500

type Db = any

type SettingKey = 'bountyNotifications' | 'commentNotifications'

export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/** Unique recipients, minus anyone excluded (the actor, people already notified directly). */
export function selectRecipients(
  candidateIds: Array<string | null | undefined>,
  exclude: Array<string | null | undefined>,
  optedOut: Iterable<string> = []
): string[] {
  const skip = new Set<string>()
  for (const id of exclude) if (id) skip.add(id)
  for (const id of optedOut) skip.add(id)
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of candidateIds) {
    if (!id || skip.has(id) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (out.length >= MAX_FANOUT_RECIPIENTS) break
  }
  return out
}

async function optedOutUsers(db: Db, userIds: string[], setting: SettingKey): Promise<string[]> {
  if (userIds.length === 0) return []
  const out: string[] = []
  for (const ids of chunk(userIds, 90)) {
    const rows: Array<{ userId: string }> = await db
      .select({ userId: notificationSettings.userId })
      .from(notificationSettings)
      .where(and(inArray(notificationSettings.userId, ids), eq(notificationSettings[setting], false)))
    for (const row of rows) out.push(row.userId)
  }
  return out
}

interface FanoutNotification {
  type: NotificationType
  title: string
  message: string
  postId: string
}

async function insertForUsers(db: Db, userIds: string[], n: FanoutNotification): Promise<number> {
  if (userIds.length === 0) return 0
  const now = new Date()
  for (const ids of chunk(userIds, NOTIFICATION_INSERT_CHUNK)) {
    await db.insert(notifications).values(
      ids.map((userId) => ({
        id: crypto.randomUUID(),
        userId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: false,
        navigationType: 'post',
        navigationId: n.postId,
        navigationUrl: `/posts/${n.postId}`,
        createdAt: now,
        updatedAt: now,
      }))
    )
  }
  return userIds.length
}

function quoteTitle(title: string): string {
  const trimmed = title.trim()
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed
}

/**
 * A question with a bounty was posted: tell everyone following one of its tags.
 * Respects each user's "bounty notifications" setting.
 */
export async function notifyTagFollowersOfBounty(
  db: Db,
  params: { postId: string; postTitle: string; authorId: string; tagIds: string[]; amount: number }
): Promise<number> {
  try {
    if (params.tagIds.length === 0) return 0
    const rows: Array<{ userId: string }> = await db
      .select({ userId: tagFollows.userId })
      .from(tagFollows)
      .where(inArray(tagFollows.tagId, params.tagIds.slice(0, 90)))
    const candidates = selectRecipients(
      rows.map((r) => r.userId),
      [params.authorId]
    )
    const optedOut = await optedOutUsers(db, candidates, 'bountyNotifications')
    const recipients = selectRecipients(candidates, [], optedOut)
    return await insertForUsers(db, recipients, {
      type: 'bounty',
      title: 'New bounty in a tag you follow',
      message: `${params.amount} BBUX bounty: "${quoteTitle(params.postTitle)}"`,
      postId: params.postId,
    })
  } catch (error) {
    console.error('Error notifying tag followers:', error)
    return 0
  }
}

export type WatchedActivity =
  | { kind: 'answer'; actorUsername: string }
  | { kind: 'comment'; actorUsername: string }
  | { kind: 'accepted' }

export function watchedActivityNotification(
  activity: WatchedActivity,
  postTitle: string
): { type: NotificationType; title: string; message: string; setting: SettingKey | null } {
  const title = quoteTitle(postTitle)
  switch (activity.kind) {
    case 'answer':
      return {
        type: 'answer',
        title: 'New answer on a question you watch',
        message: `${activity.actorUsername} answered "${title}"`,
        setting: null,
      }
    case 'comment':
      return {
        type: 'comment',
        title: 'New comment on a question you watch',
        message: `${activity.actorUsername} commented on "${title}"`,
        setting: 'commentNotifications',
      }
    case 'accepted':
      return {
        type: 'system',
        title: 'A question you watch was resolved',
        message: `An answer was accepted on "${title}"`,
        setting: null,
      }
  }
}

/**
 * Something happened on a question: tell its watchers.
 * `exclude` should hold the actor and anyone who already got a direct notification
 * (e.g. the post author for a new answer).
 */
export async function notifyPostWatchers(
  db: Db,
  params: { postId: string; postTitle: string; activity: WatchedActivity; exclude: Array<string | null | undefined> }
): Promise<number> {
  try {
    const rows: Array<{ userId: string }> = await db
      .select({ userId: postWatches.userId })
      .from(postWatches)
      .where(eq(postWatches.postId, params.postId))
    const candidates = selectRecipients(
      rows.map((r) => r.userId),
      params.exclude
    )
    const n = watchedActivityNotification(params.activity, params.postTitle)
    const optedOut = n.setting ? await optedOutUsers(db, candidates, n.setting) : []
    const recipients = selectRecipients(candidates, [], optedOut)
    return await insertForUsers(db, recipients, {
      type: n.type,
      title: n.title,
      message: n.message,
      postId: params.postId,
    })
  } catch (error) {
    console.error('Error notifying post watchers:', error)
    return 0
  }
}
