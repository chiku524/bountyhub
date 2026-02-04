import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isDocsPage = location.pathname.startsWith('/docs')
  const isLegalPage = isDocsPage || location.pathname === '/privacy' || location.pathname === '/terms'
  const isPublicPage = isHomePage || isAuthPage || isLegalPage
  
  // Determine if we need top padding for authenticated nav (top navbar)
  const showAuthenticatedNav = Boolean(user) && !isPublicPage
  const needsTopPadding = showAuthenticatedNav && showNav
  
  return (
    <div className={`flex-1 flex flex-col ${needsTopPadding ? 'pt-16' : ''} pb-16 md:pb-0`}>
      <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
} 