import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { BackToTop } from './BackToTop'
import { isDesktopApp } from '../utils/desktop'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  const isDesktop = isDesktopApp()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms'
  const isPublicPage = isHomePage || isAuthPage || isLegalPage
  const isDocsPage = location.pathname === '/docs'
  const isChatPage = location.pathname === '/chat'
  const isLaunchPage = location.pathname === '/launch'
  /**
   * Desktop splash/auth/launch must not sit inside the frosted panel: backdrop-filter on an ancestor
   * breaks `position: fixed` for `.desktop-splash` and clips the sign-in canvas.
   */
  const isFullBleedPage =
    isLaunchPage || (isDesktop && (isHomePage || isAuthPage))
  /** Full-height routes: glass panel fills the scroll region (flex) so inner layouts can scroll. */
  const glassFillsViewport = isDocsPage || isChatPage

  // Determine if we need top padding for authenticated nav (top navbar)
  const showAuthenticatedNav = Boolean(user) && !isPublicPage
  const needsTopPadding = showAuthenticatedNav && showNav
  const topPaddingClass = needsTopPadding ? (isDesktop ? 'pt-14' : 'pt-16') : ''

  // Named container: children use @sm/main:, @xl/main:, … (see Tailwind container queries).
  const mainClasses = [
    '@container/main flex min-h-0 min-w-0 flex-1 flex-col',
    isDocsPage ? 'overflow-hidden overflow-x-hidden' : 'overflow-y-auto overflow-x-hidden'
  ].join(' ')

  const glassPanelClass = [
    'mx-auto w-full min-w-0 rounded-xl border border-white/30 bg-white/45 shadow-sm backdrop-blur-md',
    'dark:border-white/10 dark:bg-neutral-950/40',
    glassFillsViewport ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : ''
  ].join(' ')

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${topPaddingClass} pb-16 md:pb-0`}>
      <main id="main-content" className={mainClasses} tabIndex={-1}>
        {isDocsPage ? (
          <div className="box-border flex min-h-0 min-w-0 flex-1 flex-col px-2 py-2 @sm/main:px-2.5 @sm/main:py-2.5 @3xl/main:px-3 @3xl/main:py-3">
            <div className={glassPanelClass}>{children}</div>
          </div>
        ) : isFullBleedPage ? (
          <div className="box-border flex min-h-full min-w-0 w-full flex-1 flex-col">{children}</div>
        ) : (
          <div className="box-border flex min-h-full w-full flex-1 flex-col items-stretch justify-center px-3 py-4 @sm/main:px-5 @3xl/main:px-8 @3xl/main:py-6">
            <div className={glassPanelClass}>{children}</div>
          </div>
        )}
      </main>
      <BackToTop />
    </div>
  )
} 