import { Hono } from 'hono'
import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { createDb } from '../../../src/utils/db'
import { users, sessions, passwordResetTokens } from '../../../drizzle/schema'
import { hashPassword } from '../../utils/auth'
import { checkRateLimit } from '../../utils/kv'
import { sendEmail, frontendBaseUrl, escapeHtml, type EmailEnv } from '../../utils/email'

interface Env extends EmailEnv {
  DB: D1Database
  CACHE?: KVNamespace
  FRONTEND_URL?: string
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
const MIN_PASSWORD_LENGTH = 8

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const app = new Hono<{ Bindings: Env }>()

/**
 * POST /api/auth/password-reset/request  { email }
 * Always answers 200 with the same message so the endpoint can't be used to discover accounts.
 */
app.post('/request', async (c) => {
  const genericResponse = {
    success: true,
    message: 'If an account exists for that email, a reset link is on its way.',
  }
  try {
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
    const { allowed } = await checkRateLimit(c.env.CACHE, `pwreset:${ip}`, 5, 15 * 60)
    if (!allowed) {
      return c.json({ error: 'Too many reset requests. Try again in a few minutes.' }, 429)
    }

    const body = await c.req.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !email.includes('@')) {
      return c.json({ error: 'Enter the email address you signed up with.' }, 400)
    }

    const db = createDb(c.env.DB)
    const [user] = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1)
    if (!user) return c.json(genericResponse)

    const token = randomToken()
    await db.insert(passwordResetTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: await sha256Hex(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })

    const link = `${frontendBaseUrl(c.env)}/reset-password?token=${token}`
    const name = user.username || 'there'
    await sendEmail(c.env, {
      to: user.email,
      subject: 'Reset your BountyHub password',
      text: `Hi ${name},\n\nSomeone asked to reset the password for your BountyHub account. Use this link within the next hour:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email; your password won't change.\n`,
      html: `<p>Hi ${escapeHtml(name)},</p><p>Someone asked to reset the password for your BountyHub account. This link works for the next hour:</p><p><a href="${link}">Reset your password</a></p><p>If you didn't ask for this, you can ignore this email; your password won't change.</p>`,
    })

    return c.json(genericResponse)
  } catch (error) {
    console.error('Password reset request error:', error)
    return c.json(genericResponse)
  }
})

/**
 * POST /api/auth/password-reset/confirm  { token, password }
 * Sets the new password, burns the token, and signs the user out everywhere.
 */
app.post('/confirm', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!token) return c.json({ error: 'This reset link is missing its token.' }, 400)
    if (password.length < MIN_PASSWORD_LENGTH) {
      return c.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, 400)
    }

    const db = createDb(c.env.DB)
    const tokenHash = await sha256Hex(token)
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1)
    if (!row) {
      return c.json({ error: 'This reset link is invalid or has expired. Request a new one.' }, 400)
    }

    await db.update(users).set({ password: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, row.userId))
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.userId, row.userId))
    await db.delete(sessions).where(eq(sessions.userId, row.userId))

    return c.json({ success: true, message: 'Password updated. You can log in with your new password.' })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return c.json({ error: 'Could not reset password. Please try again.' }, 500)
  }
})

export default app
