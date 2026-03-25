import { logoUrl } from '../utils/logoUrl'

export interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'inverse'
  className?: string
}

const IMG_PX: Record<NonNullable<LogoSpinnerProps['size']>, number> = {
  sm: 14,
  md: 26,
  lg: 46,
}

/**
 * Animated loader: app logo with a rotating accent ring and subtle looping wobble.
 */
export function LogoSpinner({ size = 'md', variant = 'default', className = '' }: LogoSpinnerProps) {
  const sizeClass = size === 'sm' ? 'logo-spinner--sm' : size === 'lg' ? 'logo-spinner--lg' : 'logo-spinner--md'
  const variantClass = variant === 'inverse' ? 'logo-spinner--inverse' : ''
  const img = IMG_PX[size]

  return (
    <span className={`logo-spinner ${sizeClass} ${variantClass} ${className}`.trim()} aria-hidden>
      <span className="logo-spinner__ring" />
      <img
        src={logoUrl}
        alt=""
        width={img}
        height={img}
        className="logo-spinner__mark"
        draggable={false}
      />
    </span>
  )
}
