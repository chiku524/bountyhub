import { describe, expect, it } from 'vitest'
import { bountyFee, bountyTotalCost } from './bountyFee'

describe('bounty fee', () => {
  it('charges 5% on top of the bounty', () => {
    expect(bountyFee(100)).toBe(5)
    expect(bountyTotalCost(100)).toBe(105)
    expect(bountyTotalCost(0.1)).toBe(0.105)
  })
  it('is zero for empty or invalid amounts', () => {
    expect(bountyFee(0)).toBe(0)
    expect(bountyTotalCost(NaN)).toBe(0)
  })
})
