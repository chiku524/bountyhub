import { describe, expect, it } from 'vitest'
import { buildDigestEmail, digestSlotStart, digestWindowStart, formatTimeLeft, isDigestDue } from './emailDigest'

// 2026-11-26 is a Thursday.
const thu = (h: number, m = 0) => new Date(Date.UTC(2026, 10, 26, h, m))

describe('digest schedule', () => {
  it('daily slot is today 14:00 UTC once that has passed, else yesterday', () => {
    expect(digestSlotStart('daily', thu(15)).toISOString()).toBe('2026-11-26T14:00:00.000Z')
    expect(digestSlotStart('daily', thu(9)).toISOString()).toBe('2026-11-25T14:00:00.000Z')
  })
  it('weekly slot is the most recent Monday 14:00 UTC', () => {
    expect(digestSlotStart('weekly', thu(15)).toISOString()).toBe('2026-11-23T14:00:00.000Z')
    expect(digestSlotStart('weekly', new Date(Date.UTC(2026, 10, 23, 13))).toISOString()).toBe('2026-11-16T14:00:00.000Z')
    expect(digestSlotStart('weekly', new Date(Date.UTC(2026, 10, 23, 14))).toISOString()).toBe('2026-11-23T14:00:00.000Z')
  })
  it('is due once per slot', () => {
    expect(isDigestDue('off', null, thu(15))).toBe(false)
    expect(isDigestDue('daily', null, thu(15))).toBe(true)
    expect(isDigestDue('daily', thu(13), thu(15))).toBe(true)
    expect(isDigestDue('daily', thu(14, 5), thu(16))).toBe(false)
    expect(isDigestDue('weekly', thu(14, 5), thu(16))).toBe(false)
  })
  it('window starts at the last send but never more than one period back', () => {
    expect(digestWindowStart('daily', thu(1), thu(15)).toISOString()).toBe(thu(1).toISOString())
    expect(digestWindowStart('daily', new Date(0), thu(15)).toISOString()).toBe('2026-11-25T15:00:00.000Z')
  })
  it('formats time left', () => {
    expect(formatTimeLeft(thu(18), thu(15))).toBe('ends in 3 hours')
    expect(formatTimeLeft(new Date(thu(15).getTime() + 49 * 3600_000), thu(15))).toBe('ends in 2 days')
  })
})

describe('buildDigestEmail', () => {
  const base = {
    username: 'ada',
    frequency: 'daily' as const,
    newAnswers: [],
    yourBounties: [],
    openBounties: [],
    baseUrl: 'https://bountyhub.tech',
    unsubscribeUrl: 'https://bountyhub.tech/email/unsubscribe?token=abc',
    now: thu(15),
  }
  it('returns null when there is nothing to report', () => {
    expect(buildDigestEmail(base)).toBeNull()
  })
  it('lists answers and bounties, escapes HTML and links to unsubscribe', () => {
    const email = buildDigestEmail({
      ...base,
      newAnswers: [{ postId: 'p1', postTitle: 'Why <script>?', answererUsername: 'bob' }],
      yourBounties: [{ postId: 'p2', title: 'Fix it', amount: 50, expiresAt: thu(20), answerCount: 2 }],
    })!
    expect(email.subject).toBe('Your BountyHub daily digest: 1 new answer, 1 bounty of yours ending soon')
    expect(email.html).toContain('Why &lt;script&gt;?')
    expect(email.html).not.toContain('<script>')
    expect(email.text).toContain('https://bountyhub.tech/posts/p1')
    expect(email.text).toContain('2 answers, accept one before it ends')
    expect(email.html).toContain(base.unsubscribeUrl)
    expect(email.headers?.['List-Unsubscribe']).toBe(`<${base.unsubscribeUrl}>`)
  })
  it('caps long sections', () => {
    const many = Array.from({ length: 13 }, (_, i) => ({ postId: `p${i}`, postTitle: `Q${i}`, answererUsername: 'x' }))
    const email = buildDigestEmail({ ...base, newAnswers: many })!
    expect(email.text).toContain('and 3 more')
  })
})
