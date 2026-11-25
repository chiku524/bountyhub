import { describe, expect, it } from 'vitest'
import { formatBountyTimeLeft, isBountyEndingSoon } from './bountyTime'

const NOW = Date.parse('2026-11-24T12:00:00Z')
const at = (h: number) => new Date(NOW + h * 3_600_000).toISOString()

describe('formatBountyTimeLeft', () => {
  it('handles missing and past deadlines', () => {
    expect(formatBountyTimeLeft(null, NOW)).toBeNull()
    expect(formatBountyTimeLeft('garbage', NOW)).toBeNull()
    expect(formatBountyTimeLeft(at(-1), NOW)).toBe('Ended')
  })
  it('uses hours under two days and days after', () => {
    expect(formatBountyTimeLeft(at(0.5), NOW)).toBe('Less than an hour left')
    expect(formatBountyTimeLeft(at(1), NOW)).toBe('1 hour left')
    expect(formatBountyTimeLeft(at(30), NOW)).toBe('30 hours left')
    expect(formatBountyTimeLeft(at(24 * 7), NOW)).toBe('7 days left')
  })
})

describe('isBountyEndingSoon', () => {
  it('is true only inside the last 24 hours', () => {
    expect(isBountyEndingSoon(at(5), NOW)).toBe(true)
    expect(isBountyEndingSoon(at(30), NOW)).toBe(false)
    expect(isBountyEndingSoon(at(-1), NOW)).toBe(false)
  })
})
