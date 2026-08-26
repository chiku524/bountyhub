import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOUR_STORAGE_KEY, writeStorageFlag } from '../utils/supportTour'

interface SupportGuideContextValue {
  isOpen: boolean
  open: (opts?: { prompt?: string }) => void
  close: () => void
  toggle: () => void
  pendingPrompt: string | null
  consumePendingPrompt: () => string | null
  tourActive: boolean
  startTour: () => void
  stopTour: (completed: boolean) => void
}

const SupportGuideContext = createContext<SupportGuideContextValue | null>(null)

export function useSupportGuide(): SupportGuideContextValue {
  const ctx = useContext(SupportGuideContext)
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      toggle: () => {},
      pendingPrompt: null,
      consumePendingPrompt: () => null,
      tourActive: false,
      startTour: () => {},
      stopTour: () => {},
    }
  }
  return ctx
}

export function SupportGuideProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const [tourActive, setTourActive] = useState(false)

  const open = useCallback((opts?: { prompt?: string }) => {
    if (opts?.prompt) setPendingPrompt(opts.prompt)
    setOpen(true)
    setTourActive(false)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const consumePendingPrompt = useCallback(() => {
    const next = pendingPrompt
    setPendingPrompt(null)
    return next
  }, [pendingPrompt])

  const startTour = useCallback(() => {
    setOpen(false)
    setTourActive(true)
  }, [])

  const stopTour = useCallback((completed: boolean) => {
    setTourActive(false)
    if (completed) writeStorageFlag(TOUR_STORAGE_KEY, true)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      pendingPrompt,
      consumePendingPrompt,
      tourActive,
      startTour,
      stopTour,
    }),
    [isOpen, open, close, toggle, pendingPrompt, consumePendingPrompt, tourActive, startTour, stopTour],
  )

  return <SupportGuideContext.Provider value={value}>{children}</SupportGuideContext.Provider>
}
