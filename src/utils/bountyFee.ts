/** Governance fee the asker pays on top of a bounty. It funds the treasury and is not refunded. */
export const BOUNTY_FEE_RATE = 0.05

export function bountyFee(amount: number): number {
  if (!(amount > 0)) return 0
  return Math.round(amount * BOUNTY_FEE_RATE * 1e6) / 1e6
}

/** What leaves the asker's wallet when they post a bounty: the bounty itself plus the fee. */
export function bountyTotalCost(amount: number): number {
  if (!(amount > 0)) return 0
  return Math.round((amount + bountyFee(amount)) * 1e6) / 1e6
}
