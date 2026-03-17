/**
 * KV helpers for caching and rate limiting.
 * All functions no-op when env.CACHE is not bound.
 */

const DEFAULT_CACHE_TTL = 300 // 5 minutes
const RATE_LIMIT_WINDOW = 60 // 1 minute in seconds
const RATE_LIMIT_PREFIX = 'rl:'
const CACHE_PREFIX = 'cache:'

export async function getCached<T>(cache: KVNamespace | undefined, key: string): Promise<T | null> {
  if (!cache) return null
  try {
    const raw = await cache.get(CACHE_PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function setCached(
  cache: KVNamespace | undefined,
  key: string,
  value: unknown,
  ttlSeconds: number = DEFAULT_CACHE_TTL
): Promise<void> {
  if (!cache) return
  try {
    await cache.put(CACHE_PREFIX + key, JSON.stringify(value), { expirationTtl: ttlSeconds })
  } catch {
    // ignore
  }
}

/**
 * Rate limit by key (e.g. IP or userId). Returns true if under limit, false if over.
 * Uses KV with key prefix rl:{key}, value = count, expirationTtl = windowSeconds.
 */
export async function checkRateLimit(
  cache: KVNamespace | undefined,
  key: string,
  limit: number,
  windowSeconds: number = RATE_LIMIT_WINDOW
): Promise<{ allowed: boolean; remaining: number }> {
  if (!cache) return { allowed: true, remaining: limit }
  const kvKey = RATE_LIMIT_PREFIX + key
  try {
    const raw = await cache.get(kvKey)
    const count = raw ? parseInt(raw, 10) : 0
    if (count >= limit) return { allowed: false, remaining: 0 }
    await cache.put(kvKey, String(count + 1), { expirationTtl: windowSeconds })
    return { allowed: true, remaining: limit - count - 1 }
  } catch {
    return { allowed: true, remaining: limit }
  }
}
