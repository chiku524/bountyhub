import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  /** Optional short description below the title */
  description?: string
  /** Actions (buttons, links) aligned to the right on desktop */
  actions?: ReactNode
  /** Smaller title on mobile */
  compact?: boolean
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  compact = false,
  className = ''
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 ${className}`}
      aria-label="Page header"
    >
      <div className="min-w-0">
        <h1
          className={`break-words font-bold text-neutral-900 dark:text-white ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-3 flex-wrap justify-end">
          {actions}
        </div>
      )}
    </div>
  )
}
