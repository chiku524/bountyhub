/**
 * AES-GCM encryption for secrets at rest (e.g. GitHub access tokens).
 * Format: enc:v1:<base64(iv)>:<base64(ciphertext+tag)>
 * Legacy plaintext values (no prefix) are returned as-is on decrypt.
 */

const PREFIX = 'enc:v1:'

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Copy into a standalone ArrayBuffer for Web Crypto typing. */
function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

async function importKey(keyMaterial: string): Promise<CryptoKey> {
  const raw = base64ToBytes(keyMaterial.trim())
  if (raw.byteLength !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64')
  }
  return crypto.subtle.importKey('raw', toBufferSource(raw), { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

/** Encrypt plaintext. If key is missing, returns plaintext (dev fallback) and logs a warning. */
export async function encryptSecret(
  plaintext: string,
  keyMaterial: string | undefined
): Promise<string> {
  if (!plaintext) return plaintext
  if (!keyMaterial) {
    console.warn(
      '[tokenEncryption] TOKEN_ENCRYPTION_KEY not set; storing secret in plaintext'
    )
    return plaintext
  }

  const key = await importKey(keyMaterial)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return `${PREFIX}${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(cipherBuf))}`
}

/** Decrypt stored value. Plaintext (legacy) values pass through unchanged. */
export async function decryptSecret(
  stored: string,
  keyMaterial: string | undefined
): Promise<string> {
  if (!stored) return stored
  if (!stored.startsWith(PREFIX)) return stored

  if (!keyMaterial) {
    throw new Error('TOKEN_ENCRYPTION_KEY is required to decrypt stored secrets')
  }

  const payload = stored.slice(PREFIX.length)
  const [ivB64, cipherB64] = payload.split(':')
  if (!ivB64 || !cipherB64) {
    throw new Error('Invalid encrypted secret format')
  }

  const key = await importKey(keyMaterial)
  const iv = base64ToBytes(ivB64)
  const cipher = base64ToBytes(cipherB64)
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toBufferSource(iv) },
    key,
    toBufferSource(cipher)
  )
  return new TextDecoder().decode(plainBuf)
}

export function isEncryptedSecret(stored: string | null | undefined): boolean {
  return !!stored && stored.startsWith(PREFIX)
}
