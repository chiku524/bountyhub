import { eq } from 'drizzle-orm'
import { notificationSettings } from '../../drizzle/schema'

export type NotificationType = 'comment' | 'vote' | 'answer' | 'bounty' | 'system'
export type DigestFrequency = 'off' | 'daily' | 'weekly'

/** What a user has chosen; this is the shape the settings API reads and writes. */
export interface NotificationPreferences {
  answer: boolean
  comment: boolean
  vote: boolean
  bounty: boolean
  system: boolean
  digestFrequency: DigestFrequency
}

/** Everyone gets every in-app alert and no email digest until they change it. */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  answer: true,
  comment: true,
  vote: true,
  bounty: true,
  system: true,
  digestFrequency: 'off',
}

const DIGEST_FREQUENCIES: DigestFrequency[] = ['off', 'daily', 'weekly']
const TYPE_KEYS: NotificationType[] = ['answer', 'comment', 'vote', 'bounty', 'system']

type SettingsRow = typeof notificationSettings.$inferSelect

export function preferencesFromRow(row: SettingsRow | undefined | null): NotificationPreferences {
  if (!row) return { ...DEFAULT_NOTIFICATION_PREFERENCES }
  return {
    answer: row.answerNotifications,
    comment: row.commentNotifications,
    vote: row.voteNotifications,
    bounty: row.bountyNotifications,
    system: row.systemNotifications,
    digestFrequency: DIGEST_FREQUENCIES.includes(row.digestFrequency as DigestFrequency)
      ? (row.digestFrequency as DigestFrequency)
      : 'off',
  }
}

/**
 * Validates a partial update from the client. Unknown keys are ignored; a wrong type is an error,
 * so a buggy client can't silently switch alerts off.
 */
export function parsePreferencesUpdate(
  body: unknown
): { ok: true; update: Partial<NotificationPreferences> } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Expected a JSON object' }
  const input = body as Record<string, unknown>
  const update: Partial<NotificationPreferences> = {}
  for (const key of TYPE_KEYS) {
    if (input[key] === undefined) continue
    if (typeof input[key] !== 'boolean') return { ok: false, error: `${key} must be true or false` }
    update[key] = input[key] as boolean
  }
  if (input.digestFrequency !== undefined) {
    if (!DIGEST_FREQUENCIES.includes(input.digestFrequency as DigestFrequency)) {
      return { ok: false, error: 'digestFrequency must be off, daily or weekly' }
    }
    update.digestFrequency = input.digestFrequency as DigestFrequency
  }
  return { ok: true, update }
}

/** Maps preferences onto notification_settings columns. */
export function preferencesToColumns(p: Partial<NotificationPreferences>) {
  const cols: Partial<SettingsRow> = {}
  if (p.answer !== undefined) cols.answerNotifications = p.answer
  if (p.comment !== undefined) cols.commentNotifications = p.comment
  if (p.vote !== undefined) cols.voteNotifications = p.vote
  if (p.bounty !== undefined) cols.bountyNotifications = p.bounty
  if (p.system !== undefined) cols.systemNotifications = p.system
  if (p.digestFrequency !== undefined) cols.digestFrequency = p.digestFrequency
  return cols
}

export async function getNotificationSettingsRow(db: any, userId: string): Promise<SettingsRow | undefined> {
  const [row] = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId)).limit(1)
  return row
}

/** True when the user wants in-app alerts of this type. Fails open so a settings lookup error never drops alerts. */
export async function isNotificationTypeEnabled(db: any, userId: string, type: NotificationType): Promise<boolean> {
  try {
    const prefs = preferencesFromRow(await getNotificationSettingsRow(db, userId))
    return prefs[type]
  } catch (error) {
    console.error('Error reading notification settings:', error)
    return true
  }
}

export function randomDigestToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Saves a partial update, creating the row on first save. Turning the digest on stamps
 * lastDigestSentAt = now so the first email covers activity from this point and arrives at the next send time.
 */
export async function saveNotificationPreferences(
  db: any,
  userId: string,
  update: Partial<NotificationPreferences>,
  now = new Date()
): Promise<NotificationPreferences> {
  const existing = await getNotificationSettingsRow(db, userId)
  const cols: Partial<SettingsRow> = { ...preferencesToColumns(update), updatedAt: now }
  const wasOff = !existing || existing.digestFrequency === 'off'
  if (update.digestFrequency && update.digestFrequency !== 'off') {
    if (wasOff) cols.lastDigestSentAt = now
    if (!existing?.digestToken) cols.digestToken = randomDigestToken()
  }

  if (existing) {
    await db.update(notificationSettings).set(cols).where(eq(notificationSettings.userId, userId))
    return preferencesFromRow({ ...existing, ...cols } as SettingsRow)
  }
  const row = {
    id: crypto.randomUUID(),
    userId,
    answerNotifications: true,
    commentNotifications: true,
    voteNotifications: true,
    bountyNotifications: true,
    systemNotifications: true,
    digestFrequency: 'off' as DigestFrequency,
    createdAt: now,
    ...cols,
  }
  await db.insert(notificationSettings).values(row).onConflictDoUpdate({ target: notificationSettings.userId, set: cols })
  return preferencesFromRow(row as SettingsRow)
}
