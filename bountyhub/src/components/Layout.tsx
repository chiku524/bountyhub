import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'
import ChatSidebar from './ChatSidebar'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  
  return (
    <div className="relative min-h-screen">
      <div className="min-h-screen w-full bg-neutral-900/95 flex flex-row">
        {showNav && <Nav />}
        <div className={`flex-1 flex flex-col ${showNav ? 'ml-20' : ''}`}>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      {!isHomePage && <ChatSidebar />}
    </div>
  )
} 