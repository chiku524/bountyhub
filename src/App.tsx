import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthProvider'
import { SolanaWalletProvider } from './contexts/SolanaWalletProvider'
import { ToastProvider } from './contexts/ToastContext'
import { DesktopUpdateProvider, useDesktopUpdate } from './contexts/DesktopUpdateContext'
import { DesktopUpdateOverlay } from './components/DesktopUpdateOverlay'
import Layout from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { AnimatedBackground } from './components/AnimatedBackground'
import { TopNav } from './components/TopNav'
import { HomeNav } from './components/HomeNav'
import { Footer } from './components/Footer'
import { PageMetadata } from './components/PageMetadata'
import { useBountyNotifications } from './hooks/useBountyNotifications'
import { useDesktopUpdater } from './hooks/useDesktopUpdater'
import ChatSidebar from './components/ChatSidebar'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'
import '@solana/wallet-adapter-react-ui/styles.css'

// Eager-load critical above-the-fold route
import Home from './pages/Home'
import DesktopHome from './pages/DesktopHome'
import { isDesktopApp } from './utils/desktop'

// Lazy-load all other routes for smaller initial bundle
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Profile = lazy(() => import('./pages/Profile'))
const ProfileActivity = lazy(() => import('./pages/ProfileActivity'))
const ProfilePosts = lazy(() => import('./pages/ProfilePosts'))
const ProfileBookmarks = lazy(() => import('./pages/ProfileBookmarks'))
const Community = lazy(() => import('./pages/Community'))
const Chat = lazy(() => import('./pages/Chat'))
const Governance = lazy(() => import('./pages/Governance'))
const Admin = lazy(() => import('./pages/Admin'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Settings = lazy(() => import('./pages/Settings'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const UserPosts = lazy(() => import('./pages/UserPosts'))
const Transactions = lazy(() => import('./pages/Transactions'))
const RefundRequests = lazy(() => import('./pages/RefundRequests'))
const DocsSingle = lazy(() => import('./pages/DocsSingle'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const BugBountyCampaigns = lazy(() => import('./pages/BugBountyCampaigns'))
const BugBountyCampaignCreate = lazy(() => import('./pages/BugBountyCampaignCreate'))
const BugBountyCampaignDetail = lazy(() => import('./pages/BugBountyCampaignDetail'))
const BugBountySubmit = lazy(() => import('./pages/BugBountySubmit'))
const Repositories = lazy(() => import('./pages/Repositories'))
const RepositoryDetail = lazy(() => import('./pages/RepositoryDetail'))
const Contributions = lazy(() => import('./pages/Contributions'))
const Download = lazy(() => import('./pages/Download'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms'
  const isDownloadPage = location.pathname === '/download'
  const isDesktop = isDesktopApp()
  const isDesktopRoot = isDesktop && isHomePage

  // Determine which navbar to show: HomeNav on home and download (web only; desktop has its own portal)
  const isPublicPage = isHomePage || isAuthPage || isLegalPage || isDownloadPage
  const showAuthenticatedNav = Boolean(user) && !isPublicPage && !loading
  const showHomeNav = (isHomePage || isDownloadPage) && !isDesktop
  
  // Handle OAuth redirect - wait for auth to load before showing authenticated layout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('oauth_success') === 'true' && !loading) {
      // If auth is loaded but user is null, wait a bit more for cookie to be available
      if (!user) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }
  }, [loading, user])
  
  // Enable bounty notifications polling
  useBountyNotifications()
  const desktopUpdate = useDesktopUpdate()
  // Desktop: check for updates on a schedule; show overlay during install, then relaunch
  useDesktopUpdater(desktopUpdate?.setPhase)
  
  // Scroll to section handler for HomeNav
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  return (
    <ErrorBoundary>
      {/* Desktop: update status mini-app when installing */}
      {isDesktop && desktopUpdate?.phase !== 'idle' && <DesktopUpdateOverlay />}
      {/* Animated Background - Canvas only, no children */}
      <AnimatedBackground />
      
      {/* Light/Dark mode container - Always flex-col; data-desktop for app-like styling */}
      <div className="relative z-10 min-h-screen w-full bg-white/5 dark:bg-neutral-900/5 transition-colors duration-200 flex flex-col" data-desktop={isDesktop ? 'true' : undefined}>
        {/* Skip to main content - visible on focus for keyboard/screen reader users */}
        {showAuthenticatedNav && (
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Skip to main content
          </a>
        )}
        {/* Dynamic Navbar - HomeNav on landing/download; TopNav for authenticated app pages */}
        {showHomeNav ? (
          <HomeNav onScrollTo={scrollToSection} />
        ) : showAuthenticatedNav ? (
          <TopNav />
        ) : null}
        
        {/* Layout - Page content with top padding for navbar */}
        <Layout showNav={showAuthenticatedNav}>
          <ScrollToTop />
          <PageMetadata />
          {(() => {
            const routes = (
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={isDesktop ? <DesktopHome /> : <Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/activity" element={<ProfileActivity />} />
                  <Route path="/profile/posts" element={<ProfilePosts />} />
                  <Route path="/profile/bookmarks" element={<ProfileBookmarks />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/posts/create" element={<CreatePost />} />
                  <Route path="/posts/:postId" element={<PostDetail />} />
                  <Route path="/users/:username" element={<UserProfile />} />
                  <Route path="/users/:username/posts" element={<UserPosts />} />
                  <Route path="/download" element={<Download />} />
                  <Route path="/downloads" element={<Navigate to="/download" replace />} />
                  <Route path="/:username" element={<UserProfile />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/refund-requests" element={<RefundRequests />} />
                  <Route path="/docs" element={<DocsSingle />} />
                  <Route path="/docs/platform" element={<Navigate to="/docs#platform-features" replace />} />
                  <Route path="/docs/user-guide" element={<Navigate to="/docs#user-guide" replace />} />
                  <Route path="/docs/developer-guide" element={<Navigate to="/docs#developer-guide" replace />} />
                  <Route path="/docs/api-reference" element={<Navigate to="/docs#api-reference" replace />} />
                  <Route path="/docs/deployment-guide" element={<Navigate to="/docs#deployment" replace />} />
                  <Route path="/docs/legal" element={<Navigate to="/docs#legal" replace />} />
                  <Route path="/docs/refund-system" element={<Navigate to="/docs#refund-system" replace />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/bug-bounty/campaigns" element={<BugBountyCampaigns />} />
                  <Route path="/bug-bounty/campaigns/create" element={<BugBountyCampaignCreate />} />
                  <Route path="/bug-bounty/campaigns/:id" element={<BugBountyCampaignDetail />} />
                  <Route path="/bug-bounty/campaigns/:id/submit" element={<BugBountySubmit />} />
                  <Route path="/repositories" element={<Repositories />} />
                  <Route path="/repositories/:id" element={<RepositoryDetail />} />
                  <Route path="/contributions" element={<Contributions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            )
            return location.pathname === '/docs' ? (
              <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                {routes}
              </div>
            ) : routes
          })()}
        </Layout>
        
        {/* Footer - Show on every page except desktop home (portal is full-screen) */}
        {!isDesktopRoot && <Footer />}
        
        {/* Chat Sidebar - Only for authenticated pages */}
        {!isPublicPage && <ChatSidebar />}
        
      </div>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SolanaWalletProvider>
          <ToastProvider>
            <DesktopUpdateProvider>
              <AppContent />
            </DesktopUpdateProvider>
          </ToastProvider>
        </SolanaWalletProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App 