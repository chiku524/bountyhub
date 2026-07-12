import { describe, expect, it } from 'vitest'
import { isReservedProfilePath } from './reservedProfilePaths'

describe('isReservedProfilePath', () => {
  it('treats app segments as reserved', () => {
    expect(isReservedProfilePath('transactions')).toBe(true)
    expect(isReservedProfilePath('wallet')).toBe(true)
    expect(isReservedProfilePath('Admin')).toBe(true)
  })

  it('allows normal usernames', () => {
    expect(isReservedProfilePath('alice')).toBe(false)
    expect(isReservedProfilePath('dev_user')).toBe(false)
  })

  it('treats empty as reserved', () => {
    expect(isReservedProfilePath('')).toBe(true)
    expect(isReservedProfilePath('   ')).toBe(true)
  })
})
