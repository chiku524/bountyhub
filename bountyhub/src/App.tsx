import { Routes, Route, useLocation } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletProvider'
import { AuthProvider, useAuth } from './contexts/AuthProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Community from './pages/Community'
import Governance from './pages/Governance'
import Wallet from './pages/Wallet'
import Settings from './pages/Settings'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import UserProfile from './pages/UserProfile'
import UserPosts from './pages/UserPosts'
import Transactions from './pages/Transactions'
import RefundRequests from './pages/RefundRequests'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function AppContent() {
  const location = useLocation()
  const { user } = useAuth()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  
  // Show navbar only when user is authenticated and not on home page or auth pages
  const showNav = Boolean(user) && !isHomePage && !isAuthPage
  
  return (
    <Layout showNav={showNav}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/posts/create" element={<CreatePost />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route path="/:username" element={<UserProfile />} />
        <Route path="/:username/posts" element={<UserPosts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/refund-requests" element={<RefundRequests />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  )
}

export default App 