import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { BackToTop } from './BackToTop'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms'
  const isPublicPage = isHomePage || isAuthPage || isLegalPage
  const isDocsPage = location.pathname === '/docs'

  // Determine if we need top padding for authenticated nav (top navbar)
  const showAuthenticatedNav = Boolean(user) && !isPublicPage
  const needsTopPadding = showAuthenticatedNav && showNav

  const mainClasses = [
    'flex-1 min-h-0',
    isDocsPage ? 'flex flex-col overflow-hidden overflow-x-hidden' : 'overflow-y-auto overflow-x-hidden'
  ].join(' ')

  return (
    <div className={`flex-1 flex flex-col ${needsTopPadding ? 'pt-16' : ''} pb-16 md:pb-0`}>
      <main id="main-content" className={mainClasses} tabIndex={-1}>
        {children}
      </main>
      <BackToTop />
    </div>
  )
} 