import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import type { CSSProperties } from 'react'
import { useSupportGuide } from '../../contexts/SupportGuideContext'
import { useAuth } from '../../contexts/AuthProvider'
import { isDesktopApp } from '../../utils/desktop'
import { filterTourSteps, type TourStep } from '../../utils/supportTour'
import { useRestoreFocusWhenOpen } from '../../hooks/useRestoreFocus'

interface HighlightBox {
  top: number
  left: number
  width: number
  height: number
}

function measureSelector(selector: string): HighlightBox | null {
  const nodes = document.querySelectorAll(selector)
  for (const el of nodes) {
    if (!(el instanceof HTMLElement)) continue
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue
    const rect = el.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) continue
    const pad = 8
    return {
      top: Math.max(8, rect.top - pad),
      left: Math.max(8, rect.left - pad),
      width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
      height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
    }
  }
  return null
}

function tooltipStyle(box: HighlightBox | null): CSSProperties {
  const width = Math.min(360, window.innerWidth - 24)
  if (!box) {
    return {
      top: '50%',
      left: '50%',
      width,
      transform: 'translate(-50%, -50%)',
    }
  }
  const spaceBelow = window.innerHeight - (box.top + box.height)
  const preferBelow = spaceBelow > 200 || box.top < 140
  const top = preferBelow
    ? Math.min(window.innerHeight - 24, box.top + box.height + 12)
    : Math.max(12, box.top - 12)
  let left = Math.min(Math.max(12, box.left), window.innerWidth - width - 12)
  return {
    top,
    left,
    width,
    transform: preferBelow ? undefined : 'translateY(-100%)',
  }
}

async function waitForSelector(selector: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (measureSelector(selector)) return true
    await new Promise((r) => setTimeout(r, 80))
  }
  return false
}

export function ProductTour() {
  const { tourActive, stopTour } = useSupportGuide()
  const { user } = useAuth()
  const isDesktop = isDesktopApp()
  const location = useLocation()
  const navigate = useNavigate()
  const steps = useMemo(
    () => filterTourSteps({ isDesktop, isAuthenticated: Boolean(user) }),
    [isDesktop, user],
  )

  const [index, setIndex] = useState(0)
  const [box, setBox] = useState<HighlightBox | null>(null)
  const [ready, setReady] = useState(false)

  useRestoreFocusWhenOpen(tourActive)

  const step: TourStep | undefined = steps[index]

  const recapture = useCallback(() => {
    if (!step?.selector) {
      setBox(null)
      return
    }
    setBox(measureSelector(step.selector))
  }, [step])

  useEffect(() => {
    if (!tourActive) {
      setIndex(0)
      setBox(null)
      setReady(false)
      return
    }
    setIndex(0)
  }, [tourActive])

  useEffect(() => {
    if (!tourActive || !step) return
    let cancelled = false
    setReady(false)

    const run = async () => {
      if (step.route && location.pathname !== step.route) {
        navigate(step.route)
        await new Promise((r) => setTimeout(r, 280))
      }
      if (cancelled) return
      if (step.selector) {
        const found = await waitForSelector(step.selector, 1600)
        if (cancelled) return
        if (!found) {
          setIndex((i) => i + 1)
          return
        }
      }
      if (cancelled) return
      recapture()
      setReady(true)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [tourActive, step, location.pathname, navigate, recapture])

  useEffect(() => {
    if (!tourActive || !ready) return
    const onWin = () => recapture()
    window.addEventListener('resize', onWin)
    window.addEventListener('scroll', onWin, true)
    return () => {
      window.removeEventListener('resize', onWin)
      window.removeEventListener('scroll', onWin, true)
    }
  }, [tourActive, ready, recapture])

  useEffect(() => {
    if (!tourActive) return
    if (index >= steps.length) {
      stopTour(true)
    }
  }, [index, steps.length, tourActive, stopTour])

  useEffect(() => {
    if (!tourActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        stopTour(false)
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        setIndex((i) => i + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [tourActive, stopTour])

  if (!tourActive || !step || !ready) return null

  const isLast = index >= steps.length - 1
  const tooltip = (
    <div
      className="fixed z-[301] rounded-xl border border-amber-200/80 bg-white p-4 shadow-2xl dark:border-amber-500/30 dark:bg-neutral-900"
      style={tooltipStyle(box)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-tour-title"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Step {index + 1} of {steps.length}
        </p>
        <button
          type="button"
          onClick={() => stopTour(false)}
          className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Skip tour"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <h2 id="product-tour-title" className="text-base font-semibold text-neutral-900 dark:text-white">
        {step.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{step.body}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => stopTour(false)}
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Skip
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (isLast) stopTour(true)
              else setIndex((i) => i + 1)
            }}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )

  const overlay = (
    <div className="fixed inset-0 z-[300]" role="presentation">
      {box ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.68)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-950/70" />
      )}
      {tooltip}
    </div>
  )

  return createPortal(overlay, document.body)
}
