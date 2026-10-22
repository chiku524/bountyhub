/**
 * Gravity contextual ads helper for Cloudflare Workers / Hono.
 * Uses @gravity-ai/api with an explicit API key from Worker bindings
 * (Workers do not populate process.env.GRAVITY_API_KEY automatically).
 */
import { Gravity, type Ad, type GravityContext, type MessageObject } from '@gravity-ai/api'

/** Stable placement_id — matches the slug created in the Gravity dashboard. */
export const GUIDE_PLACEMENT_ID = 'Guide-below-response'

export type GravityAdsEnv = {
  GRAVITY_API_KEY?: string
  /** When "true", serve live ads. Otherwise test creatives (no billing). */
  GRAVITY_PRODUCTION?: string
  NODE_ENV?: string
}

/**
 * Build the request-shaped object Gravity's SDK expects from a Hono request
 * whose JSON body was already parsed (Hono bodies can only be read once).
 */
export function buildGravityIncomingRequest(
  headers: Headers,
  gravity_context: GravityContext | undefined,
  clientIp?: string | null,
): { body: { gravity_context?: GravityContext }; headers: Record<string, string> } {
  const headerMap: Record<string, string> = {}
  headers.forEach((value, key) => {
    headerMap[key.toLowerCase()] = value
  })

  // Gravity SDK only reads x-forwarded-for / x-real-ip; Cloudflare uses cf-connecting-ip.
  const ip =
    clientIp ||
    headerMap['cf-connecting-ip'] ||
    headerMap['x-forwarded-for']?.split(',')[0]?.trim() ||
    headerMap['x-real-ip']
  if (ip && !headerMap['x-forwarded-for'] && !headerMap['x-real-ip']) {
    headerMap['x-forwarded-for'] = ip
  }

  return {
    body: gravity_context ? { gravity_context } : {},
    headers: headerMap,
  }
}

export async function fetchGuideAds(options: {
  env: GravityAdsEnv
  headers: Headers
  messages: MessageObject[]
  gravity_context?: GravityContext
  clientIp?: string | null
}): Promise<{ ads: Ad[]; gravityApiKey?: string }> {
  const apiKey = options.env.GRAVITY_API_KEY?.trim()
  if (!apiKey) {
    return { ads: [] }
  }

  const production =
    options.env.GRAVITY_PRODUCTION === 'true' ||
    (options.env.GRAVITY_PRODUCTION !== 'false' && options.env.NODE_ENV === 'production')

  const gravity = new Gravity({
    apiKey,
    production,
    // In non-production, always return a test creative so local UI wiring is visible.
    alwaysReturn: !production,
  })

  const req = buildGravityIncomingRequest(options.headers, options.gravity_context, options.clientIp)
  const { ads } = await gravity.getAds(req, options.messages, [
    { placement: 'below_response', placement_id: GUIDE_PLACEMENT_ID },
  ])

  // Feedback submissions from <GravityAd> need the same publisher key in the browser.
  // Only return it when we actually have an ad to render.
  return {
    ads: ads.filter(Boolean) as Ad[],
    gravityApiKey: ads.some(Boolean) ? apiKey : undefined,
  }
}
