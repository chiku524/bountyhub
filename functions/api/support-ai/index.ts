import { Hono } from 'hono'
import { z } from 'zod'
import { checkRateLimit } from '../../utils/kv'
import type { GravityContext } from '@gravity-ai/api'
import { fetchGuideAds } from '../../utils/gravityAds'
import {
  SUPPORT_KNOWLEDGE,
  defaultUnknownReply,
  isTourIntent,
  localGuideResponse,
  matchFaqFallback,
  mergeActions,
  parseSupportActions,
  type SupportAction,
  type SupportChatMessage,
} from '../../../src/utils/supportKnowledge'

interface Env {
  AI?: Ai
  CACHE?: KVNamespace
  SUPPORT_AI_MODEL?: string
  GRAVITY_API_KEY?: string
  GRAVITY_PRODUCTION?: string
  NODE_ENV?: string
}

const RATE_LIMIT = 20
const RATE_WINDOW = 60
// llama-3.1-8b-instruct was deprecated 2026-05-30. Use an active catalog model.
const DEFAULT_MODEL = '@cf/meta/llama-3.2-3b-instruct'

const GravityContextSchema = z
  .object({
    sessionId: z.string().min(1).max(200).optional(),
    user: z
      .object({
        userId: z.string().min(1).max(200).optional(),
        id: z.string().min(1).max(200).optional(),
        email_hash: z.string().max(128).optional(),
        hashed_phone: z.string().max(128).optional(),
        gruid: z.string().max(200).optional(),
        grclid: z.string().max(200).optional(),
        graid: z.string().max(200).optional(),
      })
      .passthrough()
      .optional(),
    device: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    consent: z.record(z.unknown()).optional(),
  })
  .passthrough()

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(16),
  context: z
    .object({
      path: z.string().max(200).optional(),
      isDesktop: z.boolean().optional(),
      isAuthenticated: z.boolean().optional(),
    })
    .optional(),
  /** Client context from `@gravity-ai/api` `gravityContext()` — forwarded to Gravity. */
  gravity_context: GravityContextSchema.optional(),
})

const app = new Hono<{ Bindings: Env }>()

function clientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
}

function extractAiText(result: unknown): string {
  if (typeof result === 'string') return result
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>
    if (typeof record.response === 'string') return record.response
    if (typeof record.text === 'string') return record.text
    if (Array.isArray(record.result) && typeof record.result[0] === 'string') {
      return record.result.join('\n')
    }
  }
  return ''
}

function buildSystemPrompt(context?: {
  path?: string
  isDesktop?: boolean
  isAuthenticated?: boolean
}): string {
  const path = context?.path || '/'
  const surface = context?.isDesktop ? 'desktop app' : 'web app'
  const auth = context?.isAuthenticated ? 'signed in' : 'guest (not signed in)'
  return `You are Guide, BountyHub's built-in product assistant. Be concise, friendly, and accurate.
Current context: user is on ${path} in the ${surface}, ${auth}.

${SUPPORT_KNOWLEDGE}

When the user wants a tour, walkthrough, or to be shown around, include [[action:start_tour]] once in your reply.
When sending them to a page, include exactly one tag such as [[action:navigate:/wallet]] using only these paths: / /community /posts/create /wallet /chat /docs /governance /settings /profile /bug-bounty/campaigns /repositories /contributions /analytics /refund-requests /transactions /download /login /signup /privacy /terms
Do not wrap the whole reply in JSON. Do not invent action tags. Keep answers under 120 words unless the user asks for detail.`
}

app.post('/', async (c) => {
  const ip = clientIp(c)
  const { allowed } = await checkRateLimit(c.env.CACHE, `support-ai:${ip}`, RATE_LIMIT, RATE_WINDOW)
  if (!allowed) {
    return c.json({ error: 'Too many questions. Please wait a minute and try again.' }, 429)
  }

  let parsed: z.infer<typeof BodySchema>
  try {
    parsed = BodySchema.parse(await c.req.json())
  } catch {
    return c.json({ error: 'Send a messages array with user/assistant turns.' }, 400)
  }

  const lastUser = [...parsed.messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) {
    return c.json({ error: 'Include at least one user message.' }, 400)
  }

  const history: SupportChatMessage[] = parsed.messages.map((m) => ({
    role: m.role,
    content: m.content.trim(),
  }))

  // Fast path: obvious tour / FAQ matches still go through AI when available,
  // but we always merge structured actions from the last user turn.
  const local = localGuideResponse(lastUser.content)
  const faq = matchFaqFallback(lastUser.content)

  // Fire Gravity in parallel with the LLM — never block Guide on ad latency.
  const adsPromise = fetchGuideAds({
    env: c.env,
    headers: c.req.raw.headers,
    messages: history,
    gravity_context: parsed.gravity_context as GravityContext | undefined,
    clientIp: ip !== 'unknown' ? ip : null,
  })

  const withAds = async <T extends Record<string, unknown>>(payload: T) => {
    const { ads, gravityApiKey } = await adsPromise
    return {
      ...payload,
      ads,
      ...(gravityApiKey ? { gravityApiKey } : {}),
    }
  }

  const ai = c.env.AI
  if (!ai) {
    return c.json(
      await withAds({
        reply: local.reply,
        actions: local.actions,
        source: 'faq' as const,
      }),
    )
  }

  const model = (c.env.SUPPORT_AI_MODEL?.trim() || DEFAULT_MODEL) as Parameters<Ai['run']>[0]
  const system = buildSystemPrompt(parsed.context)

  try {
    const result = await ai.run(model, {
      messages: [
        { role: 'system', content: system },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 400,
      temperature: 0.3,
    })

    const raw = extractAiText(result).trim()
    if (!raw) {
      return c.json(
        await withAds({
          reply: local.reply,
          actions: local.actions,
          source: 'faq' as const,
        }),
      )
    }

    const parsedReply = parseSupportActions(raw)
    let actions: SupportAction[] = parsedReply.actions
    if (isTourIntent(lastUser.content)) {
      actions = mergeActions(actions, [{ type: 'start_tour' }])
    }
    if (faq?.actions?.length) {
      actions = mergeActions(actions, faq.actions)
    }

    const reply = parsedReply.reply || local.reply
    return c.json(
      await withAds({
        reply,
        actions,
        source: 'ai' as const,
      }),
    )
  } catch (err) {
    console.error('[support-ai] model error', { model, err })
    return c.json(
      await withAds({
        reply: local.reply || defaultUnknownReply(),
        actions: local.actions,
        source: 'faq' as const,
      }),
    )
  }
})

export default app
