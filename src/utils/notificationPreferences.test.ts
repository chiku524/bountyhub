import { describe, expect, it } from 'vitest'
import { DEFAULT_NOTIFICATION_PREFERENCES, parsePreferencesUpdate, preferencesFromRow, preferencesToColumns } from './notificationPreferences'

describe('notification preferences', () => {
  it('defaults to every alert on and no digest', () => {
    expect(preferencesFromRow(undefined)).toEqual(DEFAULT_NOTIFICATION_PREFERENCES)
    expect(DEFAULT_NOTIFICATION_PREFERENCES.digestFrequency).toBe('off')
  })
  it('accepts partial updates and ignores unknown keys', () => {
    expect(parsePreferencesUpdate({ vote: false, digestFrequency: 'weekly', extra: 1 })).toEqual({
      ok: true,
      update: { vote: false, digestFrequency: 'weekly' },
    })
  })
  it('rejects bad values', () => {
    expect(parsePreferencesUpdate({ vote: 'no' }).ok).toBe(false)
    expect(parsePreferencesUpdate({ digestFrequency: 'hourly' }).ok).toBe(false)
    expect(parsePreferencesUpdate(null).ok).toBe(false)
  })
  it('maps to columns', () => {
    expect(preferencesToColumns({ answer: false, digestFrequency: 'daily' })).toEqual({
      answerNotifications: false,
      digestFrequency: 'daily',
    })
  })
})
