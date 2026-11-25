import type { ReactNode } from 'react'
import { isDesktopApp } from '../utils/desktop'
import '../components/desktop-splash.css'

/** Shared frame for standalone auth screens (forgot / reset password); matches the Login layout. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  const isDesktop = isDesktopApp()
  return (
    <div
      className={
        isDesktop
          ? 'desktop-intro-canvas text-neutral-900 dark:text-white'
          : 'min-h-screen flex items-center justify-center text-neutral-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs'
      }
    >
      <div className={`w-full ${isDesktop ? 'max-w-[380px] px-4' : 'max-w-md'}`}>
        <div
          className={
            isDesktop
              ? 'rounded-2xl border border-cyan-500/20 dark:border-violet-500/30 bg-neutral-900/95 px-8 py-10 shadow-2xl text-white'
              : 'rounded-2xl border border-neutral-200 bg-white/90 px-6 py-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80'
          }
        >
          <h1 className="text-center text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export const authInputClass =
  'block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-violet-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white sm:text-sm'
