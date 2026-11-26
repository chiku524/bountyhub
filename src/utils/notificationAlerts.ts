import type { AppNotification } from '../hooks/useNotificationsQuery'

/**
 * Decides which notifications deserve an OS alert after each poll. Kept free of React and storage so
 * the rules are easy to test:
 * - Only unread notifications newer than the last one already alerted (the "watermark"), so a restart
 *   doesn't replay old alerts, and nothing older than a day ever pops.
 * - Votes stay in the bell but never pop up; answers, accepted answers/bounties, comments and system
 *   messages do.
 * - More than a few at once (e.g. the app was closed for a while) collapse into one summary alert.
 */

export const ALERT_TYPES: ReadonlySet<AppNotification['type']> = new Set(['answer', 'bounty', 'comment', 'system'])
/** Above this many new alerts in one poll, show one summary instead of a burst. */
export const MAX_INDIVIDUAL_ALERTS = 3
/** First run for a user: alert only what arrived in the last couple of minutes. */
export const FIRST_RUN_LOOKBACK_MS = 2 * 60_000
/** Never alert anything older than this, whatever the watermark says. */
export const MAX_ALERT_AGE_MS = 24 * 60 * 60_000

export interface AlertDecision {
  /** Notifications to alert individually, oldest first. Empty when `summary` is set. */
  individual: AppNotification[]
  /** One summary alert covering everything new, when there are too many to show one by one. */
  summary: { title: string; body: string } | null
  /** New watermark (ms) to persist: the newest createdAt seen so far. */
  watermark: number
}

function timeOf(n: AppNotification): number {
  const t = new Date(n.createdAt).getTime()
  return Number.isFinite(t) ? t : 0
}

export function pickAlerts(
  notifications: readonly AppNotification[],
  watermark: number | null,
  now: number = Date.now(),
): AlertDecision {
  const since = Math.max(watermark ?? now - FIRST_RUN_LOOKBACK_MS, now - MAX_ALERT_AGE_MS)
  const newest = notifications.reduce((max, n) => Math.max(max, timeOf(n)), watermark ?? 0)

  const fresh = notifications
    .filter((n) => !n.read && ALERT_TYPES.has(n.type) && timeOf(n) > since)
    .sort((a, b) => timeOf(a) - timeOf(b))

  const nextWatermark = Math.max(newest, watermark ?? now - FIRST_RUN_LOOKBACK_MS)

  if (fresh.length > MAX_INDIVIDUAL_ALERTS) {
    const bounties = fresh.filter((n) => n.type === 'bounty').length
    const answers = fresh.filter((n) => n.type === 'answer').length
    const parts: string[] = []
    if (bounties) parts.push(`${bounties} bount${bounties === 1 ? 'y' : 'ies'} awarded`)
    if (answers) parts.push(`${answers} new answer${answers === 1 ? '' : 's'}`)
    const other = fresh.length - bounties - answers
    if (other) parts.push(`${other} other update${other === 1 ? '' : 's'}`)
    return {
      individual: [],
      summary: { title: `${fresh.length} new notifications on BountyHub`, body: parts.join(', ') },
      watermark: nextWatermark,
    }
  }

  return { individual: fresh, summary: null, watermark: nextWatermark }
}
