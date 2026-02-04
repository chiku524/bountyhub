import { createContext, useCallback, useContext, useState, useRef, useEffect, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
  createdAt: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const t = timeoutsRef.current.get(id)
    if (t) clearTimeout(t)
    timeoutsRef.current.delete(id)
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const item: ToastItem = { id, message, type, duration, createdAt: Date.now() }
      setToasts((prev) => [...prev.slice(-4), item])

      if (duration > 0) {
        const t = setTimeout(() => dismiss(id), duration)
        timeoutsRef.current.set(id, t)
      }
    },
    [dismiss]
  )

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration ?? DEFAULT_DURATION), [showToast])
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration ?? 6000), [showToast])
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration ?? DEFAULT_DURATION), [showToast])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t))
      timeoutsRef.current.clear()
    }
  }, [])

  const value: ToastContextValue = {
    toasts,
    showToast,
    success,
    error,
    info,
    dismiss
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full sm:max-w-md pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const isSuccess = item.type === 'success'
  const isError = item.type === 'error'

  const bg =
    isSuccess
      ? 'bg-green-900/95 dark:bg-green-800/95 border-green-500/50 text-white'
      : isError
        ? 'bg-red-900/95 dark:bg-red-800/95 border-red-500/50 text-white'
        : 'bg-neutral-800/95 dark:bg-neutral-700/95 border-neutral-500/50 text-white' // info

  const icon = isSuccess ? (
    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ) : isError ? (
    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  )

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${bg}`}
      role="alert"
    >
      <span className="mt-0.5">{icon}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
