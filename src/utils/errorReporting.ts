/**
 * Optional browser error reporting.
 * When VITE_SENTRY_DSN is set, errors are sent to Sentry's store endpoint.
 * When unset, only console logging runs (no network calls).
 */

type ErrorContext = {
  componentStack?: string
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

let dsnParsed:
  | { publicKey: string; host: string; projectId: string }
  | null
  | undefined

function parseDsn(): { publicKey: string; host: string; projectId: string } | null {
  if (dsnParsed !== undefined) return dsnParsed
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) {
    dsnParsed = null
    return null
  }
  try {
    // Format: https://<key>@<host>/<project>
    const url = new URL(dsn)
    const publicKey = url.username
    const projectId = url.pathname.replace(/^\//, '')
    if (!publicKey || !projectId) {
      dsnParsed = null
      return null
    }
    dsnParsed = { publicKey, host: url.host, projectId }
    return dsnParsed
  } catch {
    dsnParsed = null
    return null
  }
}

export function initErrorReporting(): void {
  // Touch parse so misconfigured DSN is logged once at startup
  const parsed = parseDsn()
  if (import.meta.env.DEV && import.meta.env.VITE_SENTRY_DSN && !parsed) {
    console.warn('[errorReporting] VITE_SENTRY_DSN is set but could not be parsed')
  }
}

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error))
  console.error('[errorReporting]', err, context)

  const parsed = parseDsn()
  if (!parsed || typeof fetch === 'undefined') return

  const eventId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  const payload = {
    event_id: eventId.replace(/-/g, '').slice(0, 32),
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level: 'error',
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || undefined,
    exception: {
      values: [
        {
          type: err.name || 'Error',
          value: err.message,
          stacktrace: err.stack
            ? {
                frames: err.stack
                  .split('\n')
                  .slice(1)
                  .map((line) => ({ filename: line.trim() })),
              }
            : undefined,
        },
      ],
    },
    tags: {
      runtime: typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window ? 'desktop' : 'web',
      ...context.tags,
    },
    extra: {
      componentStack: context.componentStack,
      ...context.extra,
    },
  }

  const storeUrl = `https://${parsed.host}/api/${parsed.projectId}/store/`
  void fetch(storeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=bountyhub/1.0`,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* ignore reporting failures */
  })
}
