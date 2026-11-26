import { useEffect, useState } from 'react'
import { api } from '../../utils/api'
import { useToast } from '../../contexts/ToastContext'
import { useTheme } from '../../contexts/ThemeProvider'
import { browserNotificationService } from '../../utils/browserNotifications'
import { isDesktopApp } from '../../utils/desktop'
import { getCloseToTray, setCloseToTray } from '../../utils/desktopNative'

function Row({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700 @sm/main:flex-row @sm/main:items-center @sm/main:justify-between">
      <div>
        <p className="font-medium text-neutral-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-violet-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

type DigestFrequency = 'off' | 'daily' | 'weekly'
interface ServerPreferences {
  answer: boolean
  comment: boolean
  vote: boolean
  bounty: boolean
  system: boolean
  digestFrequency: DigestFrequency
}

const ALERT_TYPES: Array<{ key: Exclude<keyof ServerPreferences, 'digestFrequency'>; title: string; description: string }> = [
  { key: 'answer', title: 'New answers', description: 'Someone answers one of your questions.' },
  { key: 'bounty', title: 'Bounty payouts', description: 'Your answer is accepted and you receive a bounty.' },
  { key: 'comment', title: 'Comments', description: 'Someone comments on your post.' },
  { key: 'vote', title: 'Votes', description: 'Someone votes on your post.' },
  { key: 'system', title: 'Bounty status updates', description: 'Your bounty ends, is refunded, or is awarded automatically.' },
]

const DIGEST_OPTIONS: Array<{ value: DigestFrequency; label: string }> = [
  { value: 'off', label: 'Off' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

/** Settings → Notifications: which alerts the account gets, the optional email digest, and pop-up alerts on this device. */
export function NotificationSettings() {
  const toast = useToast()
  const [prefs, setPrefs] = useState<ServerPreferences | null>(null)
  const [loadError, setLoadError] = useState('')
  const [permission, setPermission] = useState<NotificationPermission>(() => browserNotificationService.getPermission())
  const [pref, setPref] = useState(() => browserNotificationService.userPreference())
  const enabled = permission === 'granted' && pref === 'on'
  const where = isDesktopApp() ? 'your desktop' : 'this browser'

  useEffect(() => {
    let cancelled = false
    api
      .request<ServerPreferences>('/api/notifications/settings')
      .then((p) => !cancelled && setPrefs(p))
      .catch((err: unknown) => !cancelled && setLoadError(err instanceof Error ? err.message : 'Could not load your notification settings.'))
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (update: Partial<ServerPreferences>) => {
    if (!prefs) return
    const previous = prefs
    setPrefs({ ...prefs, ...update })
    try {
      const saved = await api.request<ServerPreferences>('/api/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify(update),
      })
      setPrefs(saved)
      if (update.digestFrequency && update.digestFrequency !== 'off') {
        toast.success(`${update.digestFrequency === 'daily' ? 'Daily' : 'Weekly'} digest turned on. It goes to your account email.`)
      }
    } catch (err: unknown) {
      setPrefs(previous)
      toast.error(err instanceof Error ? err.message : 'Could not save that change.')
    }
  }

  const toggleDevice = async (next: boolean) => {
    if (next) {
      browserNotificationService.setUserPreference('on')
      setPref('on')
      if (permission === 'default') {
        await browserNotificationService.requestPermission()
        setPermission(browserNotificationService.getPermission())
      }
    } else {
      browserNotificationService.setUserPreference('off')
      setPref('off')
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4" aria-labelledby="alert-types-heading">
        <div>
          <h3 id="alert-types-heading" className="font-semibold text-neutral-900 dark:text-white">What you're notified about</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Applies to the bell and pop-up alerts on every device you use.
          </p>
        </div>
        {loadError && (
          <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {loadError}
          </p>
        )}
        {!prefs && !loadError && <p className="text-sm text-neutral-500">Loading…</p>}
        {prefs &&
          ALERT_TYPES.map((t) => (
            <Row
              key={t.key}
              title={t.title}
              description={t.description}
              control={<Switch checked={prefs[t.key]} onChange={(v) => void save({ [t.key]: v })} label={t.title} />}
            />
          ))}
      </section>

      <section className="space-y-4" aria-labelledby="digest-heading">
        <div>
          <h3 id="digest-heading" className="font-semibold text-neutral-900 dark:text-white">Email digest</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            A summary of new answers to your questions and bounties that are about to expire, sent to your account email.
            Nothing is sent when there's nothing new.
          </p>
        </div>
        {prefs && (
          <Row
            title="Send me a digest"
            description={
              prefs.digestFrequency === 'daily'
                ? 'Every day, in the afternoon (UTC).'
                : prefs.digestFrequency === 'weekly'
                  ? 'Every Monday, in the afternoon (UTC).'
                  : 'No digest emails.'
            }
            control={
              <div className="flex gap-2" role="radiogroup" aria-label="Email digest frequency">
                {DIGEST_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={prefs.digestFrequency === o.value}
                    onClick={() => prefs.digestFrequency !== o.value && void save({ digestFrequency: o.value })}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      prefs.digestFrequency === o.value
                        ? 'border-violet-500 bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            }
          />
        )}
      </section>

      <section className="space-y-4" aria-labelledby="device-alerts-heading">
        <div>
          <h3 id="device-alerts-heading" className="font-semibold text-neutral-900 dark:text-white">Pop-up alerts on {where}</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The bell always shows your notifications. This also pops them up on {where} when something needs you.
          </p>
        </div>
        <Row
          title="Show pop-up alerts"
          description="Uses the alert types you chose above."
          control={<Switch checked={enabled} onChange={(v) => void toggleDevice(v)} label="Show pop-up alerts" />}
        />
        {permission === 'denied' && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            Alerts are blocked in your {isDesktopApp() ? 'system' : 'browser'} settings for BountyHub. Allow notifications there, then turn this on.
          </p>
        )}
      </section>
    </div>
  )
}

/** Settings → Appearance: light / dark theme. */
export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const option = (value: 'light' | 'dark', label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={theme === value}
      onClick={() => setTheme(value)}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
        theme === value
          ? 'border-violet-500 bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200'
          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
      }`}
    >
      {label}
    </button>
  )
  return (
    <div className="space-y-4">
      <Row
        title="Theme"
        description="Applies to every page, including the desktop app."
        control={
          <div className="flex gap-2" role="radiogroup" aria-label="Theme">
            {option('light', 'Light')}
            {option('dark', 'Dark')}
          </div>
        }
      />
    </div>
  )
}

const SHORTCUTS: Array<[string, string]> = [
  ['⌘/Ctrl + K', 'Search and jump anywhere'],
  ['⌘/Ctrl + ,', 'Open settings'],
  ['⌘/Ctrl + Q', 'Quit BountyHub'],
]

/** Settings → Desktop app: window behaviour and keyboard shortcuts (shown above version/update info). */
export function DesktopPreferences() {
  const [closeToTray, setCloseToTrayState] = useState(() => getCloseToTray())

  return (
    <div className="space-y-4">
      <Row
        title="Keep running in the tray"
        description="Closing the window hides BountyHub to the tray so alerts for answers and bounties still arrive. Turn off to quit when you close the window."
        control={
          <Switch
            checked={closeToTray}
            onChange={(v) => {
              setCloseToTrayState(v)
              void setCloseToTray(v)
            }}
            label="Keep running in the tray"
          />
        }
      />
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <p className="font-medium text-neutral-900 dark:text-white">Keyboard shortcuts</p>
        <dl className="mt-3 space-y-2 text-sm">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={keys} className="flex items-center justify-between gap-4">
              <dt className="text-neutral-600 dark:text-neutral-400">{action}</dt>
              <dd>
                <kbd className="rounded border border-neutral-300 bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-800 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100">
                  {keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
