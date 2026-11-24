import { PublicKey } from '@solana/web3.js'

/** True when `value` is a well-formed base58 Solana public key (32 bytes). */
export function isValidSolanaAddress(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 32 || trimmed.length > 44) return false
  try {
    return new PublicKey(trimmed).toBytes().length === 32
  } catch {
    return false
  }
}

/** Shortens an address for display: "7xKX…9fQa". */
export function shortenAddress(value: string, chars = 4): string {
  const v = value.trim()
  return v.length <= chars * 2 + 1 ? v : `${v.slice(0, chars)}…${v.slice(-chars)}`
}

export const WITHDRAW_FEE_RATE = 0.03

export function withdrawBreakdown(amount: number): { fee: number; net: number } {
  const safe = Number.isFinite(amount) && amount > 0 ? amount : 0
  const fee = safe * WITHDRAW_FEE_RATE
  return { fee, net: safe - fee }
}
