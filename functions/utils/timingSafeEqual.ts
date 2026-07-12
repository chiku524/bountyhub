/** Constant-time string comparison to avoid timing leaks on secrets. */
export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  if (aBytes.byteLength !== bBytes.byteLength) {
    // Still compare against self-length buffer so timing is less informative
    const dummy = new Uint8Array(aBytes.byteLength)
    cryptoSubtleEqual(aBytes, dummy)
    return false
  }
  return cryptoSubtleEqual(aBytes, bBytes)
}

function cryptoSubtleEqual(a: Uint8Array, b: Uint8Array): boolean {
  let out = 0
  for (let i = 0; i < a.byteLength; i++) {
    out |= a[i]! ^ b[i]!
  }
  return out === 0
}
