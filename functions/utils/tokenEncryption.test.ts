import { describe, expect, it } from 'vitest'
import {
  decryptSecret,
  encryptSecret,
  isEncryptedSecret,
} from '../utils/tokenEncryption'

/** 32 zero bytes, base64 */
const TEST_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

describe('tokenEncryption', () => {
  it('encrypts and decrypts round-trip', async () => {
    const plain = 'gho_test_token_abc123'
    const encrypted = await encryptSecret(plain, TEST_KEY)
    expect(isEncryptedSecret(encrypted)).toBe(true)
    expect(encrypted).not.toContain(plain)
    const decrypted = await decryptSecret(encrypted, TEST_KEY)
    expect(decrypted).toBe(plain)
  })

  it('produces different ciphertext each encrypt (random IV)', async () => {
    const a = await encryptSecret('same', TEST_KEY)
    const b = await encryptSecret('same', TEST_KEY)
    expect(a).not.toBe(b)
    expect(await decryptSecret(a, TEST_KEY)).toBe('same')
    expect(await decryptSecret(b, TEST_KEY)).toBe('same')
  })

  it('passes through legacy plaintext when decrypting', async () => {
    const legacy = 'gho_legacy_plaintext'
    expect(await decryptSecret(legacy, TEST_KEY)).toBe(legacy)
    expect(isEncryptedSecret(legacy)).toBe(false)
  })

  it('returns plaintext when key is missing (dev fallback)', async () => {
    const plain = 'dev_token'
    const stored = await encryptSecret(plain, undefined)
    expect(stored).toBe(plain)
  })

  it('throws when decrypting enc:v1 without a key', async () => {
    const encrypted = await encryptSecret('secret', TEST_KEY)
    await expect(decryptSecret(encrypted, undefined)).rejects.toThrow(
      /TOKEN_ENCRYPTION_KEY/
    )
  })

  it('rejects invalid key length', async () => {
    await expect(encryptSecret('x', 'dG9vLXNob3J0')).rejects.toThrow(/32 bytes/)
  })
})
