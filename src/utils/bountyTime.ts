/**
 * Human label for how long a bounty has left, e.g. "3 days left", "5 hours left", "Ended".
 * Returns null when there is no deadline.
 */
export function formatBountyTimeLeft(expiresAt: string | null | undefined, now: number = Date.now()): string | null {
  if (!expiresAt) return null
  const end = new Date(expiresAt).getTime()
  if (Number.isNaN(end)) return null
  const ms = end - now
  if (ms <= 0) return 'Ended'
  const hours = Math.floor(ms / 3_600_000)
  if (hours < 1) return 'Less than an hour left'
  if (hours < 48) return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`
  const days = Math.floor(hours / 24)
  return `${days} days left`
}

/** True when the bounty ends within the next 24 hours (used for urgency styling). */
export function isBountyEndingSoon(expiresAt: string | null | undefined, now: number = Date.now()): boolean {
  if (!expiresAt) return false
  const ms = new Date(expiresAt).getTime() - now
  return ms > 0 && ms < 24 * 3_600_000
}
