import { useId } from 'react'

const BADGE_URL = 'https://www.tinystartups.com/startup/bountyhub'

/** Tiny Startups launch badge — required for tinystartups.com listing. */
export function TinyStartupsBadge({ className = '' }: { className?: string }) {
  const gradientId = useId().replace(/:/g, '')

  return (
    <a
      href={BADGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Launched on Tiny Startups — view bountyhub on tinystartups.com"
      className={`inline-flex items-center gap-3.5 rounded-[14px] py-3.5 pl-[18px] pr-[22px] font-sans text-white no-underline transition-opacity hover:opacity-90 ${className}`}
      style={{
        background:
          'linear-gradient(#0E0B1F, #0E0B1F) padding-box, linear-gradient(90deg, #3525E6, #D81FE0, #22B8F0) border-box',
        border: '2px solid transparent',
      }}
    >
      <svg width="56" height="56" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1=".1" y1="0" x2=".9" y2="1">
            <stop offset="0%" stopColor="#3525E6" />
            <stop offset="55%" stopColor="#D81FE0" />
            <stop offset="100%" stopColor="#22B8F0" />
          </linearGradient>
        </defs>
        <path
          d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z"
          fill={`url(#${gradientId})`}
        />
      </svg>
      <span className="flex flex-col leading-[1.15]">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
          Launched on
        </span>
        <span className="text-[22px] font-extrabold tracking-[-0.025em] text-white">Tiny Startups</span>
        <span className="mt-1 text-[11px] text-white/55">tinystartups.com</span>
      </span>
    </a>
  )
}
