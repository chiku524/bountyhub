/**
 * Minimal transactional email sender.
 *
 * Uses Resend's HTTP API when RESEND_API_KEY is set (wrangler secret put RESEND_API_KEY).
 * EMAIL_FROM sets the sender, e.g. "BountyHub <no-reply@bountyhub.tech>" (domain must be verified in Resend).
 * Without a key the message is logged instead, so local dev and tests work without a provider.
 */
export interface EmailEnv {
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
  NODE_ENV?: string
}

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html?: string
  headers?: Record<string, string>
}

export async function sendEmail(env: EmailEnv, message: EmailMessage): Promise<{ sent: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set; would send:', message.subject, '->', message.to, '\n', message.text)
    return { sent: false, error: 'Email provider not configured' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'BountyHub <no-reply@bountyhub.tech>',
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        headers: message.headers,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[email] send failed', res.status, body)
      return { sent: false, error: `Email provider returned ${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('[email] send error', err)
    return { sent: false, error: 'Email send failed' }
  }
}

/** Resend accepts at most this many messages per batch request. */
export const EMAIL_BATCH_LIMIT = 100

/**
 * Sends up to EMAIL_BATCH_LIMIT messages in one Resend request (keeps the digest run under the provider's rate limit).
 * Without a key, logs each subject instead.
 */
export async function sendEmailBatch(env: EmailEnv, messages: EmailMessage[]): Promise<{ sent: number; error?: string }> {
  if (messages.length === 0) return { sent: 0 }
  if (messages.length > EMAIL_BATCH_LIMIT) throw new Error(`sendEmailBatch takes at most ${EMAIL_BATCH_LIMIT} messages`)
  if (!env.RESEND_API_KEY) {
    for (const m of messages) console.log('[email] RESEND_API_KEY not set; would send:', m.subject, '->', m.to)
    return { sent: 0, error: 'Email provider not configured' }
  }
  const from = env.EMAIL_FROM || 'BountyHub <no-reply@bountyhub.tech>'
  try {
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        messages.map((m) => ({ from, to: [m.to], subject: m.subject, text: m.text, html: m.html, headers: m.headers }))
      ),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[email] batch send failed', res.status, body)
      return { sent: 0, error: `Email provider returned ${res.status}` }
    }
    return { sent: messages.length }
  } catch (err) {
    console.error('[email] batch send error', err)
    return { sent: 0, error: 'Email send failed' }
  }
}

export function frontendBaseUrl(env: EmailEnv & { FRONTEND_URL?: string }): string {
  if (env.FRONTEND_URL) return env.FRONTEND_URL.replace(/\/$/, '')
  return env.NODE_ENV === 'production' ? 'https://bountyhub.tech' : 'http://localhost:5173'
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string
  )
}
