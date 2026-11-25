import { describe, expect, it } from 'vitest'
import { isValidSolanaAddress, shortenAddress, withdrawBreakdown } from './solanaAddress'

describe('isValidSolanaAddress', () => {
  it('accepts real public keys', () => {
    expect(isValidSolanaAddress('11111111111111111111111111111111')).toBe(true)
    expect(isValidSolanaAddress('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')).toBe(true)
  })
  it('rejects typos and junk', () => {
    expect(isValidSolanaAddress('')).toBe(false)
    expect(isValidSolanaAddress('not-an-address')).toBe(false)
    expect(isValidSolanaAddress('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5D0')).toBe(false) // 0 is not base58
    expect(isValidSolanaAddress('0x52908400098527886E0F7030069857D2E4169EE7')).toBe(false)
  })
})

describe('withdrawBreakdown', () => {
  it('takes a 3% fee', () => {
    const { fee, net } = withdrawBreakdown(100)
    expect(fee).toBeCloseTo(3)
    expect(net).toBeCloseTo(97)
  })
  it('treats invalid input as zero', () => {
    expect(withdrawBreakdown(NaN)).toEqual({ fee: 0, net: 0 })
  })
})

describe('shortenAddress', () => {
  it('keeps both ends', () => {
    expect(shortenAddress('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')).toBe('Toke…Q5DA')
  })
})
