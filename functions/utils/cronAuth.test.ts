import { describe, expect, it } from 'vitest'
import { isAuthorizedCronRequest } from '../utils/cronAuth'

function mockContext(headers: Record<string, string | undefined>) {
  return {
    req: {
      header: (name: string) => headers[name] ?? headers[name.toLowerCase()],
    },
  } as any
}

describe('isAuthorizedCronRequest', () => {
  const secret = 'super-secret-cron'

  it('rejects when CRON_SECRET is unset', () => {
    expect(isAuthorizedCronRequest(mockContext({ Authorization: `Bearer ${secret}` }), undefined)).toBe(
      false
    )
  })

  it('accepts Authorization Bearer matching secret', () => {
    expect(
      isAuthorizedCronRequest(mockContext({ Authorization: `Bearer ${secret}` }), secret)
    ).toBe(true)
  })

  it('accepts X-Cron-Secret header', () => {
    expect(
      isAuthorizedCronRequest(mockContext({ 'X-Cron-Secret': secret }), secret)
    ).toBe(true)
  })

  it('rejects wrong bearer token', () => {
    expect(
      isAuthorizedCronRequest(mockContext({ Authorization: 'Bearer wrong' }), secret)
    ).toBe(false)
  })

  it('rejects missing auth headers', () => {
    expect(isAuthorizedCronRequest(mockContext({}), secret)).toBe(false)
  })
})
