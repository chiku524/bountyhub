import { useEffect, useState } from 'react'
import { FiWifiOff } from 'react-icons/fi'

/** Thin banner shown while the device reports no network, so failed loads/saves aren't a mystery. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[95] flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-sm font-medium text-neutral-950 shadow"
    >
      <FiWifiOff className="h-4 w-4 shrink-0" aria-hidden />
      You're offline. Changes won't be saved until your connection is back.
    </div>
  )
}
