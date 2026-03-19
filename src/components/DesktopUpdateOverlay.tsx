import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'

const messages: Record<string, string> = {
  downloading: 'Downloading update…',
  installing: 'Installing update…',
  restarting: 'Update complete. Restarting the app…',
}

export function DesktopUpdateOverlay() {
  const { phase } = useDesktopUpdate()
  if (phase === 'idle') return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-900 shadow-2xl">
        {/* Mini-app title bar */}
        <div className="flex items-center gap-2 border-b border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-600" />
          <span className="ml-2 text-xs font-medium text-neutral-400">BountyHub Update</span>
        </div>
        <div className="flex flex-col items-center gap-4 px-6 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
            <svg
              className="h-6 w-6 animate-spin text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-center text-sm font-medium text-white">
            {messages[phase] ?? 'Preparing update…'}
          </p>
          <p className="text-center text-xs text-neutral-500">
            The app will restart automatically when the update is complete.
          </p>
        </div>
      </div>
    </div>
  )
}
