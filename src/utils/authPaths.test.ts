import { describe, expect, it } from 'vitest'
import { isAuthPath } from './authPaths'
import { isReservedProfilePath } from './reservedProfilePaths'

describe('isAuthPath', () => {
  it('matches the standalone auth screens', () => {
    expect(isAuthPath('/login')).toBe(true)
    expect(isAuthPath('/forgot-password')).toBe(true)
    expect(isAuthPath('/reset-password')).toBe(true)
    expect(isAuthPath('/community')).toBe(false)
  })

  it('keeps password-reset routes from being read as @username links', () => {
    expect(isReservedProfilePath('forgot-password')).toBe(true)
    expect(isReservedProfilePath('reset-password')).toBe(true)
  })
})
