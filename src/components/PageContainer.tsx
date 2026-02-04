import { ReactNode } from 'react'

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

export function PageContainer({
  children,
  maxWidth = 'default',
  compact = false,
  className = ''
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${compact ? 'py-4 sm:py-6' : 'py-6 md:py-8'} ${maxWidthClasses[maxWidth]} ${className}`}
      role="main"
    >
      {children}
    </div>
  )
}
