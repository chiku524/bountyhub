import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false
}

/** Tracks the user's reduced-motion preference and updates if it changes. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function reveal(el: HTMLElement) {
  const name = el.getAttribute('data-animate')
  if (!name) return
  const delay = el.getAttribute('data-animate-delay')
  if (delay) el.style.animationDelay = `${delay}ms`
  el.classList.add(`animate-${name}`)
}

/**
 * Scroll-reveal: elements with `data-animate="<name>"` get `animate-<name>` the
 * first time they enter the viewport. `data-animate-delay` (ms) staggers siblings.
 * Without IntersectionObserver, or with reduced motion, everything is shown at once.
 */
export function useScrollReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current
    if (!container) return
    const els = Array.from(container.querySelectorAll<HTMLElement>('[data-animate]'))
    if (!els.length) return

    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      els.forEach(reveal)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          observer.unobserve(el)
          requestAnimationFrame(() => reveal(el))
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [root])
}
