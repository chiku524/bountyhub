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

export function frontendBaseUrl(env: EmailEnv & { FRONTEND_URL?: string }): string {
  if (env.FRONTEND_URL) return env.FRONTEND_URL.replace(/\/$/, '')
  return env.NODE_ENV === 'production' ? 'https://bountyhub.tech' : 'http://localhost:5173'
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string
  )
}
