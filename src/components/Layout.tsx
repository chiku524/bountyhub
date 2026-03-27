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

  // Determine if we need top padding for authenticated nav (top navbar)
  const showAuthenticatedNav = Boolean(user) && !isPublicPage
  const needsTopPadding = showAuthenticatedNav && showNav
  const topPaddingClass = needsTopPadding ? (isDesktop ? 'pt-14' : 'pt-16') : ''

  // Named container: children use @sm/main:, @xl/main:, … (see Tailwind container queries).
  const mainClasses = [
    '@container/main flex min-h-0 min-w-0 flex-1 flex-col',
    isDocsPage ? 'overflow-hidden overflow-x-hidden' : 'overflow-y-auto overflow-x-hidden'
  ].join(' ')

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${topPaddingClass} pb-16 md:pb-0`}>
      <main id="main-content" className={mainClasses} tabIndex={-1}>
        {children}
      </main>
      <BackToTop />
    </div>
  )
} 