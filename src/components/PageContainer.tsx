import { ReactNode } from 'react'
import { isDesktopApp } from '../utils/desktop'

interface PageContainerProps {
  children: ReactNode
  /** Optional max width: 'default' (full panel), 'narrow' (3xl), 'wide' (large cap) */
  maxWidth?: 'default' | 'narrow' | 'wide'
  /** Reduce vertical padding on small screens */
  compact?: boolean
  className?: string
}

/** Default is full width of the layout glass panel; use narrow/wide for readability caps. */
const maxWidthClasses = {
  default: 'max-w-none',
  narrow: 'max-w-3xl',
  wide: 'max-w-[90rem]'
}

const desktopMaxWidthClasses = {
  default: 'max-w-none',
  narrow: 'max-w-3xl',
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
  const paddingX = isDesktop ? 'px-4 @xl/main:px-6 @3xl/main:px-10' : 'px-4 @sm/main:px-6 @5xl/main:px-8'
  const paddingY = compact ? 'py-4 @sm/main:py-6' : 'py-6 @3xl/main:py-8'

  return (
    <div className={`mx-auto min-w-0 w-full ${paddingX} ${paddingY} ${maxW} ${className}`}>
      {children}
    </div>
  )
}
