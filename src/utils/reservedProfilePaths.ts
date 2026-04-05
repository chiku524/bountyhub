/**
 * First URL segments that must not be treated as public @username short links.
 * Keeps /docs, /settings, etc. from being mistaken for profiles if routing changes.
 */
const RESERVED = new Set(
  [
    'login',
    'signup',
    'launch',
    'community',
    'chat',
    'governance',
    'analytics',
    'wallet',
    'settings',
    'posts',
    'users',
    'download',
    'downloads',
    'docs',
    'privacy',
    'terms',
    'admin',
    'bug-bounty',
    'repositories',
    'contributions',
    'transactions',
    'refund-requests',
    'profile',
  ].map((s) => s.toLowerCase()),
)

export function isReservedProfilePath(segment: string): boolean {
  const s = segment.trim().toLowerCase()
  if (!s) return true
  return RESERVED.has(s)
}
