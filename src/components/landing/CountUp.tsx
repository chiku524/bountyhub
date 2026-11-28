import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../hooks/useLandingMotion'

interface CountUpProps {
  value: number
  format: (n: number) => string
  /** Animation length in ms. */
  duration?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Counts from 0 to `value` once the number scrolls into view.
 * Renders the final value immediately for reduced motion or when there is nothing to count.
 */
export function CountUp({ value, format, duration = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const shouldAnimate =
    value > 0 && !prefersReducedMotion() && typeof IntersectionObserver !== 'undefined'
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !shouldAnimate) return

    let frame = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setDisplay(value * easeOutCubic(t))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        run()
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration, shouldAnimate])

  return (
    <span ref={ref} className="tabular-nums">
      {/* Screen readers get the final figure, not every intermediate frame */}
      <span aria-hidden="true">{format(shouldAnimate ? display : value)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
