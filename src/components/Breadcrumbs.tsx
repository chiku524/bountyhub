import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <span className="text-neutral-400 dark:text-neutral-600" aria-hidden>
                  /
                </span>
              )}
              {item.to && !isLast ? (
                <Link to={item.to} className="truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'truncate font-medium text-neutral-700 dark:text-neutral-300' : 'truncate'}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
