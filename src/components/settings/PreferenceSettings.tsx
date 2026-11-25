import { useState } from 'react'
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

/** Settings → Notifications: opt in to OS/browser alerts for new answers, accepted answers and bounties. */
export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>(() => browserNotificationService.getPermission())
  const [pref, setPref] = useState(() => browserNotificationService.userPreference())
  const enabled = permission === 'granted' && pref === 'on'
  const where = isDesktopApp() ? 'your desktop' : 'this browser'

  const toggle = async (next: boolean) => {
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
    <div className="space-y-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        In-app notifications (the bell) are always on. Alerts also pop up on {where} when something needs you.
      </p>
      <Row
        title="Alerts for answers and bounties"
        description="New answers to your questions, your answer being accepted, and bounty payouts."
        control={<Switch checked={enabled} onChange={(v) => void toggle(v)} label="Alerts for answers and bounties" />}
      />
      {permission === 'denied' && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          Alerts are blocked in your {isDesktopApp() ? 'system' : 'browser'} settings for BountyHub. Allow notifications there, then turn this on.
        </p>
      )}
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
