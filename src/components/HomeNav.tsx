import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { ThemeToggle } from './ThemeToggle'
import { logoUrl } from '../utils/logoUrl'

interface HomeNavProps {
  onScrollTo: (sectionId: string) => void
}

const SECTION_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'bug-bounties', label: 'Bug bounties' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'stats', label: 'Stats' },
  { id: 'cta', label: 'Get started' },
] as const

export function HomeNav({ onScrollTo }: HomeNavProps) {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const mq = window.matchMedia('(min-width: 1280px)')
    const close = () => setMobileMenuOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [mobileMenuOpen])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const scrollTo = (sectionId: string) => {
    onScrollTo(sectionId)
    setMobileMenuOpen(false)
  }

  const linkClass =
    'text-sm text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-medium whitespace-nowrap'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 overflow-x-clip transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-lg border-b border-neutral-200 dark:border-neutral-700'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-3 h-14 sm:h-16">
          {/* Logo */}
          <div className="flex min-w-0 shrink-0 items-center">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-1.5 sm:gap-2"
              aria-label="bountyhub home"
            >
              <img src={logoUrl} alt="" className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8" aria-hidden />
              <span className="truncate text-lg font-bold text-bounty-wordmark sm:text-xl lg:text-2xl">
                bountyhub
              </span>
            </Link>
          </div>

          {/* Desktop section links */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-6">
            {SECTION_LINKS.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className={linkClass}>
                {label}
              </button>
            ))}
            <Link to="/download" className={linkClass}>
              Download
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <ThemeToggle />
            {user ? (
              <Link to="/community" className="btn-primary px-3 py-1.5 text-sm sm:px-4 sm:py-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden sm:inline ${linkClass} px-1 py-2`}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary px-3 py-1.5 text-sm sm:px-4 sm:py-2 whitespace-nowrap"
                >
                  Get started
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="xl:hidden rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
              aria-expanded={mobileMenuOpen}
              aria-controls="home-nav-mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            id="home-nav-mobile-menu"
            className="border-t border-neutral-200 py-3 dark:border-neutral-700 xl:hidden"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-0.5">
              {SECTION_LINKS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="rounded-lg px-3 py-2.5 text-left text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                >
                  {label}
                </button>
              ))}
              <Link
                to="/download"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
              >
                Download
              </Link>
              {!user && (
                <>
                  <div className="my-2 border-t border-neutral-200 dark:border-neutral-600" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 sm:hidden"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
