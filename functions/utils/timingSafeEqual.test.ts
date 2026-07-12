import { describe, expect, it } from 'vitest'
import { timingSafeEqual } from '../utils/timingSafeEqual'

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('cron-secret', 'cron-secret')).toBe(true)
  })

  it('returns false for different strings of same length', () => {
    expect(timingSafeEqual('aaaaaaaa', 'aaaaaaab')).toBe(false)
  })

  it('returns false for different lengths', () => {
    expect(timingSafeEqual('short', 'much-longer-secret')).toBe(false)
  })

  it('returns false for empty vs non-empty', () => {
    expect(timingSafeEqual('', 'x')).toBe(false)
    expect(timingSafeEqual('x', '')).toBe(false)
  })

  it('returns true for empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true)
  })
})
