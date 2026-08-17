import * as bs58Module from 'bs58'

function decodeBase58(value: string): Uint8Array {
  const decode = (bs58Module as { decode?: (v: string) => Uint8Array } & { default?: { decode?: (v: string) => Uint8Array } }).decode
    || (bs58Module as { default?: { decode?: (v: string) => Uint8Array } }).default?.decode
  if (typeof decode !== 'function') {
    throw new Error('bs58 decode is unavailable')
  }
  const decoded = decode(value)
  return decoded instanceof Uint8Array ? decoded : Uint8Array.from(decoded)
}

function decodeBase64(value: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'))
  }
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Decode a Solana secret key from Phantom-style base58, legacy base64, or a JSON byte array.
 */
export function decodeSolanaSecretKey(privateKeyString: string): Uint8Array {
  const trimmed = privateKeyString.trim()
  if (!trimmed) {
    throw new Error('Platform private key is empty')
  }

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown
    if (!Array.isArray(parsed) || !parsed.every((n) => typeof n === 'number')) {
      throw new Error('Invalid JSON secret key array')
    }
    const bytes = Uint8Array.from(parsed)
    if (bytes.length === 64) return bytes
    throw new Error(`Invalid private key length: ${bytes.length} bytes (expected 64)`)
  }

  const attempts: Array<{ name: string; decode: (value: string) => Uint8Array }> = [
    { name: 'base58', decode: decodeBase58 },
    { name: 'base64', decode: decodeBase64 },
  ]

  const errors: string[] = []
  for (const attempt of attempts) {
    try {
      const bytes = attempt.decode(trimmed)
      if (bytes.length === 64) return bytes
      errors.push(`${attempt.name}: ${bytes.length} bytes`)
    } catch (error) {
      errors.push(`${attempt.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  throw new Error(`Unsupported private key format (${errors.join('; ')})`)
}
