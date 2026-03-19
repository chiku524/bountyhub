import { ReactNode } from 'react'
import { isDesktopApp } from '../utils/desktop'

interface PageContainerProps {
  children: ReactNode
  /** Optional max width: 'default' (7xl), 'narrow' (6xl), 'wide' (full with padding) */
  maxWidth?: 'default' | 'narrow' | 'wide'
  /** Reduce vertical padding on small screens */
  compact?: boolean
  className?: string
}

const maxWidthClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-6xl',
  wide: 'max-w-[90rem]'
}

const desktopMaxWidthClasses = {
  default: 'max-w-6xl',
  narrow: 'max-w-5xl',
  wide: 'max-w-7xl'
}

export function PageContainer({
  children,
  maxWidth = 'default',
  compact = false,
  className = ''
}: PageContainerProps) {
  const isDesktop = isDesktopApp()
  const maxW = isDesktop ? desktopMaxWidthClasses[maxWidth] : maxWidthClasses[maxWidth]
  const paddingX = isDesktop ? 'px-6 lg:px-10' : 'px-4 sm:px-6 lg:px-8'
  const paddingY = compact ? 'py-4 sm:py-6' : 'py-6 md:py-8'
  const desktopChrome = isDesktop
    ? 'rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white/90 dark:bg-neutral-800/90 shadow-sm'
    : ''

  return (
    <div
      className={`mx-auto w-full ${paddingX} ${paddingY} ${maxW} ${desktopChrome} ${className}`}
      role="main"
    >
      {children}
    </div>
  )
}
