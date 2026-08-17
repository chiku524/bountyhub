import { Keypair } from '@solana/web3.js'
import { describe, expect, it } from 'vitest'
import { decodeSolanaSecretKey } from './solanaSecretKey'
import * as bs58Module from 'bs58'

function encodeBase58(bytes: Uint8Array): string {
  const encode = (bs58Module as { encode?: (v: Uint8Array) => string } & { default?: { encode?: (v: Uint8Array) => string } }).encode
    || (bs58Module as { default?: { encode?: (v: Uint8Array) => string } }).default?.encode
  if (typeof encode !== 'function') {
    throw new Error('bs58 encode is unavailable')
  }
  return encode(bytes)
}

describe('decodeSolanaSecretKey', () => {
  it('decodes Phantom-style base58 secret keys', () => {
    const keypair = Keypair.generate()
    const decoded = decodeSolanaSecretKey(encodeBase58(keypair.secretKey))
    expect(Keypair.fromSecretKey(decoded).publicKey.toBase58()).toBe(keypair.publicKey.toBase58())
  })

  it('decodes legacy base64 secret keys', () => {
    const keypair = Keypair.generate()
    const encoded = Buffer.from(keypair.secretKey).toString('base64')
    const decoded = decodeSolanaSecretKey(encoded)
    expect(Keypair.fromSecretKey(decoded).publicKey.toBase58()).toBe(keypair.publicKey.toBase58())
  })

  it('decodes JSON byte-array secret keys', () => {
    const keypair = Keypair.generate()
    const decoded = decodeSolanaSecretKey(JSON.stringify(Array.from(keypair.secretKey)))
    expect(Keypair.fromSecretKey(decoded).publicKey.toBase58()).toBe(keypair.publicKey.toBase58())
  })
})
