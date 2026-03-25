import React from 'react'
import { LogoSpinner } from './LogoSpinner'

const ORBIT_DEG = [0, 120, 240] as const

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'inverse'
  /** Orbit + coin (classic) or animated app logo + ring */
  graphic?: 'orbit' | 'logo'
  /** Use inside buttons or inline with text */
  inline?: boolean
  /** Screen reader text; use false when a parent already exposes busy state */
  label?: string | false
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'default',
  graphic = 'orbit',
  inline = false,
  label = 'Loading',
}) => {
  if (graphic === 'logo') {
    return (
      <div
        className={`${inline ? 'inline-flex' : 'flex'} items-center justify-center ${className}`}
        role={label === false ? undefined : 'status'}
        aria-live={label === false ? undefined : 'polite'}
      >
        {label !== false ? <span className="sr-only">{label}</span> : null}
        <LogoSpinner size={size} variant={variant} />
      </div>
    )
  }

  const sizeClass =
    size === 'sm' ? 'bounty-hub-spinner--sm' : size === 'lg' ? 'bounty-hub-spinner--lg' : 'bounty-hub-spinner--md'
  const variantClass = variant === 'inverse' ? 'bounty-hub-spinner--inverse' : ''

  return (
    <div
      className={`${inline ? 'inline-flex' : 'flex'} items-center justify-center ${className}`}
      role={label === false ? undefined : 'status'}
      aria-live={label === false ? undefined : 'polite'}
    >
      {label !== false ? <span className="sr-only">{label}</span> : null}
      <span className={`bounty-hub-spinner ${sizeClass} ${variantClass}`} aria-hidden>
        <span className="bounty-hub-spinner__track" />
        <span className="bounty-hub-spinner__orbit">
          {ORBIT_DEG.map((deg) => (
            <span
              key={deg}
              className="bounty-hub-spinner__dot"
              style={{ transform: `rotate(${deg}deg) translateY(calc(-1 * var(--bounty-orbit-r)))` }}
            />
          ))}
        </span>
        <span className="bounty-hub-spinner__coin">
          <span className="bounty-hub-spinner__coin-glare" />
        </span>
      </span>
    </div>
  )
}

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-sm ${className}`}></div>
  )
}

export const PostSkeleton: React.FC = () => {
  return (
    <div className="py-4 animate-pulse">
      <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-sm mb-2 w-3/4"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-sm mb-2 w-full"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-sm mb-2 w-2/3"></div>
      <div className="flex space-x-4 mt-2">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-sm w-20"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-sm w-24"></div>
      </div>
    </div>
  )
}
