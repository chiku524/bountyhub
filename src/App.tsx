import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthProvider'
import { SolanaWalletProvider } from './contexts/SolanaWalletProvider'
import Layout from './components/Layout'
import { AnimatedBackground } from './components/AnimatedBackground'
import { TopNav } from './components/TopNav'
import { HomeNav } from './components/HomeNav'
import { Footer } from './components/Footer'
import { PageMetadata } from './components/PageMetadata'
import { useBountyNotifications } from './hooks/useBountyNotifications'
import ChatSidebar from './components/ChatSidebar'
import { InstallPrompt } from './components/InstallPrompt'
import { LoadingSpinner } from './components/LoadingSpinner'
import '@solana/wallet-adapter-react-ui/styles.css'

// Eager-load critical above-the-fold route
import Home from './pages/Home'

// Lazy-load all other routes for smaller initial bundle
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Profile = lazy(() => import('./pages/Profile'))
const ProfileActivity = lazy(() => import('./pages/ProfileActivity'))
const ProfilePosts = lazy(() => import('./pages/ProfilePosts'))
const ProfileBookmarks = lazy(() => import('./pages/ProfileBookmarks'))
const Community = lazy(() => import('./pages/Community'))
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
const Docs = lazy(() => import('./pages/Docs'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const PlatformDocs = lazy(() => import('./pages/docs/Platform'))
const UserGuide = lazy(() => import('./pages/docs/UserGuide'))
const DeveloperGuide = lazy(() => import('./pages/docs/DeveloperGuide'))
const ApiReference = lazy(() => import('./pages/docs/ApiReference'))
const DeploymentGuide = lazy(() => import('./pages/docs/DeploymentGuide'))
const Legal = lazy(() => import('./pages/docs/Legal'))
const RefundSystem = lazy(() => import('./pages/docs/RefundSystem'))
const BugBountyCampaigns = lazy(() => import('./pages/BugBountyCampaigns'))
const BugBountyCampaignCreate = lazy(() => import('./pages/BugBountyCampaignCreate'))
const BugBountyCampaignDetail = lazy(() => import('./pages/BugBountyCampaignDetail'))
const Repositories = lazy(() => import('./pages/Repositories'))
const Contributions = lazy(() => import('./pages/Contributions'))

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
  const isDocsPage = location.pathname.startsWith('/docs')
  const isLegalPage = isDocsPage || location.pathname === '/privacy' || location.pathname === '/terms'
  
  // Determine which navbar to show
  const isPublicPage = isHomePage || isAuthPage || isLegalPage
  const showAuthenticatedNav = Boolean(user) && !isPublicPage && !loading
  
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
  
  // Scroll to section handler for HomeNav
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  return (
    <>
      {/* Animated Background - Canvas only, no children */}
      <AnimatedBackground />
      
      {/* Light/Dark mode container - Always flex-col */}
      <div className="relative z-10 min-h-screen w-full bg-white/10 dark:bg-neutral-900/10 transition-colors duration-200 flex flex-col">
        {/* Dynamic Navbar - Top navbar for authenticated pages */}
        {isHomePage ? (
          <HomeNav onScrollTo={scrollToSection} />
        ) : showAuthenticatedNav ? (
          <TopNav />
        ) : null}
        
        {/* Layout - Page content with top padding for navbar */}
        <Layout showNav={showAuthenticatedNav}>
          <PageMetadata />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/activity" element={<ProfileActivity />} />
            <Route path="/profile/posts" element={<ProfilePosts />} />
            <Route path="/profile/bookmarks" element={<ProfileBookmarks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/posts/create" element={<CreatePost />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/users/:username" element={<UserProfile />} />
            <Route path="/users/:username/posts" element={<UserPosts />} />
            <Route path="/:username" element={<UserProfile />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/refund-requests" element={<RefundRequests />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/platform" element={<PlatformDocs />} />
            <Route path="/docs/user-guide" element={<UserGuide />} />
            <Route path="/docs/developer-guide" element={<DeveloperGuide />} />
            <Route path="/docs/api-reference" element={<ApiReference />} />
            <Route path="/docs/deployment-guide" element={<DeploymentGuide />} />
            <Route path="/docs/legal" element={<Legal />} />
            <Route path="/docs/refund-system" element={<RefundSystem />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/bug-bounty/campaigns" element={<BugBountyCampaigns />} />
            <Route path="/bug-bounty/campaigns/create" element={<BugBountyCampaignCreate />} />
            <Route path="/bug-bounty/campaigns/:id" element={<BugBountyCampaignDetail />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/contributions" element={<Contributions />} />
          </Routes>
          </Suspense>
        </Layout>
        
        {/* Footer - Show on every page, full width below content */}
        <Footer />
        
        {/* Chat Sidebar - Only for authenticated pages */}
        {!isPublicPage && <ChatSidebar />}
        
        {/* PWA Install Prompt */}
        <InstallPrompt />
      </div>
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SolanaWalletProvider>
          <AppContent />
        </SolanaWalletProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App 