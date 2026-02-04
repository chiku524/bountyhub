import { ReactNode } from 'react'

interface EmptyStateProps {
  /** Icon (e.g. from react-icons) or emoji */
  icon?: ReactNode
  title: string
  description?: string
  /** Primary action button or link */
  action?: ReactNode
  /** Optional secondary action */
  secondaryAction?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-4 sm:py-12 ${className}`}
      role="status"
      aria-label={`Empty state: ${title}`}
    >
      {icon && (
        <div className="mb-4 text-neutral-400 dark:text-neutral-500 text-4xl sm:text-5xl">
          {icon}
        </div>
      )}
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {action}
        {secondaryAction}
      </div>
    </div>
  )
}
