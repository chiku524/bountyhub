import { Link } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiUsers, FiDollarSign, FiShield } from 'react-icons/fi'

export default function PlatformDocs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/docs"
            className="inline-flex items-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Platform Documentation</h1>
          <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 text-lg">
            Complete overview of bountyhub platform features, architecture, and functionality
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-600 dark:text-gray-300">
            <li><a href="#overview" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Platform Overview</a></li>
            <li><a href="#features" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Core Features</a></li>
            <li><a href="#architecture" className="text-violet-400 hover:text-violet-300">Architecture</a></li>
            <li><a href="#tokenomics" className="text-violet-400 hover:text-violet-300">BBUX Tokenomics</a></li>
            <li><a href="#governance" className="text-violet-400 hover:text-violet-300">Governance System</a></li>
            <li><a href="#chat" className="text-violet-400 hover:text-violet-300">Global Chat</a></li>
            <li><a href="#security" className="text-violet-400 hover:text-violet-300">Security & Privacy</a></li>
            <li><a href="#roadmap" className="text-violet-400 hover:text-violet-300">Development Roadmap</a></li>
          </ul>
        </div>

        {/* Platform Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Platform Overview</h2>
          <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
              bountyhub is a decentralized question-and-answer platform that incentivizes knowledge sharing through 
              a virtual token system. The platform uses BBUX tokens as an internal currency to reward quality 
              contributions and foster community engagement.
            </p>
            <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
              Our mission is to create a sustainable ecosystem where knowledge is valued and rewarded, 
              fostering a community of experts and learners who contribute to the collective intelligence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <FiUsers className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                <h3 className="text-neutral-900 dark:text-white font-semibold">Community-Driven</h3>
                <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 text-sm">Built by and for the community</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <FiDollarSign className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                <h3 className="text-neutral-900 dark:text-white font-semibold">Virtual Token System</h3>
                <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 text-sm">Earn BBUX for quality contributions</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <FiShield className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                <h3 className="text-neutral-900 dark:text-white font-semibold">Transparent Governance</h3>
                <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 text-sm">Community-driven decision making</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Core Features</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Virtual Token System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub uses a virtual BBUX token system that operates entirely within the platform. 
                Users earn BBUX through various activities and can spend them on bounties and governance participation.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Virtual BBUX tokens with unlimited supply</li>
                <li>• Earn tokens through quality contributions</li>
                <li>• Spend tokens on bounties and governance</li>
                <li>• Transparent transaction history</li>
                <li>• No external wallet required for basic usage</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Bounty System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Users can create questions with attached bounties in BBUX tokens. When a question receives 
                a satisfactory answer, the bounty is automatically distributed to the answerer.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Set custom bounty amounts for questions</li>
                <li>• Automatic bounty distribution upon answer acceptance</li>
                <li>• Time-based bounty expiration</li>
                <li>• Community voting on answer quality</li>
                <li>• Refund system for unsatisfactory bounties</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Dynamic Governance System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Advanced governance system with dynamic reward rates based on platform activity, treasury health, 
                and user participation.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Dynamic staking rewards (0.05% - 0.12% daily)</li>
                <li>• Platform activity-based bonus rewards</li>
                <li>• Treasury health indicators</li>
                <li>• Governance participation bonuses</li>
                <li>• Real-time transparency logs</li>
                <li>• Community voting on refund requests</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Reputation System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Users build reputation through their contributions. Higher reputation unlocks additional 
                platform features and voting power.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Earn reputation points for quality answers</li>
                <li>• Unlock advanced features with higher reputation</li>
                <li>• Increased voting power for trusted users</li>
                <li>• Badge system for achievements</li>
                <li>• Integrity scoring system</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Refund Request System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Community-driven refund system where users can request refunds for unsatisfactory bounties, 
                with community voting determining the outcome.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Submit refund requests with detailed reasoning</li>
                <li>• Community voting on refund approval</li>
                <li>• Earn rewards for participating in refund decisions</li>
                <li>• Transparent voting process</li>
                <li>• Anti-gaming measures and requirements</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Notification System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Real-time notifications keep users informed about important events and activities 
                on the platform.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Real-time notification creation for user interactions</li>
                <li>• Direct navigation to relevant content</li>
                <li>• Mark as read functionality and unread count tracking</li>
                <li>• Notification preferences and filtering</li>
                <li>• Performance-optimized with minimal API calls</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Global Chat System</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Real-time community chat with support for text messages, emojis, and GIFs. 
                Connect with other users instantly and build relationships within the community.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Real-time messaging with persistent chat history</li>
                <li>• Emoji picker with popular emoji selection</li>
                <li>• GIF search powered by GIPHY API integration</li>
                <li>• Persistent chat sidebar accessible from any page</li>
                <li>• Mobile-responsive design with dark theme</li>
                <li>• Message types: text, emoji, and GIF support</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Bug Bounty Campaigns</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Create and manage bug bounty campaigns for open source projects. Connect GitHub repositories,
                set reward budgets, and track security submissions with a comprehensive verification workflow.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Create bug bounty campaigns with custom budgets and reward ranges</li>
                <li>• Connect GitHub repositories for automated issue tracking</li>
                <li>• Define scope, rules, and severity levels for submissions</li>
                <li>• Multi-step verification process with status tracking</li>
                <li>• Public and private campaign options</li>
                <li>• Team bounty support for collaborative submissions</li>
                <li>• Integration with GitHub Issues for seamless workflow</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">GitHub Integration</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Seamlessly connect your GitHub account to sync repositories, track contributions,
                and manage open source projects directly from the platform.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• OAuth-based GitHub authentication</li>
                <li>• Automatic repository synchronization</li>
                <li>• Track stars, forks, and repository metrics</li>
                <li>• Link repositories to bug bounty campaigns</li>
                <li>• Contribution tracking and analytics</li>
                <li>• GitHub Issue integration for bug submissions</li>
                <li>• Repository management dashboard</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Progressive Web App (PWA)</h3>
              <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
                Install BountyHub as a desktop or mobile app for a native-like experience with offline
                support and automatic updates.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Installable on desktop and mobile devices</li>
                <li>• Standalone app experience (no browser UI)</li>
                <li>• Offline functionality with service worker caching</li>
                <li>• Automatic updates when new versions are available</li>
                <li>• App shortcuts for quick access to key features</li>
                <li>• Push notification support (ready for future use)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Architecture</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Technology Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Frontend</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• React 18 with TypeScript</li>
                  <li>• Vite for build tooling</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• React Router for navigation</li>
                  <li>• Dark theme optimized UI</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Backend</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Cloudflare Workers</li>
                  <li>• Hono framework</li>
                  <li>• D1 database (SQLite)</li>
                  <li>• Drizzle ORM</li>
                  <li>• RESTful API design</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Virtual Token System</h4>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Virtual BBUX tokens with unlimited supply</li>
                <li>• Database-backed wallet system</li>
                <li>• Real-time balance tracking</li>
                <li>• Transparent transaction logging</li>
                <li>• Governance fee collection (5% on bounties)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tokenomics */}
        <section id="tokenomics" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">BBUX Tokenomics</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Virtual Token Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Token Information</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Name: BountyBucks (BBUX)</li>
                  <li>• Symbol: BBUX</li>
                  <li>• Type: Virtual Platform Token</li>
                  <li>• Supply: Unlimited (Virtual)</li>
                  <li>• Distribution: Activity-based</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Earning Mechanisms</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Quality answers to bountied questions</li>
                  <li>• Governance participation rewards</li>
                  <li>• Refund request voting</li>
                  <li>• Platform activity bonuses</li>
                  <li>• Staking rewards (0.05% - 0.12% daily)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Dynamic Reward System</h4>
              <div className="bg-neutral-700 rounded-lg p-4">
                <p className="text-neutral-600 dark:text-gray-300 mb-3">
                  The platform features a dynamic reward system that adjusts based on platform activity:
                </p>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• <strong>Base Rate:</strong> 0.05% daily (18.25% APY)</li>
                  <li>• <strong>Activity Bonus:</strong> +0.02% for high platform volume</li>
                  <li>• <strong>Treasury Bonus:</strong> +0.01% when treasury is healthy</li>
                  <li>• <strong>Governance Bonus:</strong> +0.02% for active governance participation</li>
                  <li>• <strong>Participation Penalty:</strong> -0.03% when total staking is high</li>
                  <li>• <strong>Maximum Rate:</strong> 0.12% daily (43.8% APY)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Governance System */}
        <section id="governance" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Governance System</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Virtual Governance</h3>
            <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
              bountyhub features a comprehensive virtual governance system that allows users to participate 
              in platform decisions and earn rewards for their participation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Staking & Rewards</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• Stake BBUX tokens for governance participation</li>
                  <li>• Dynamic reward rates based on platform metrics</li>
                  <li>• Real-time transparency logs</li>
                  <li>• Platform health indicators</li>
                  <li>• Personalized reward rates for users</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Community Voting</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• Vote on refund requests</li>
                  <li>• Earn rewards for voting participation</li>
                  <li>• Anti-gaming measures and requirements</li>
                  <li>• Transparent voting process</li>
                  <li>• Community-driven decision making</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Platform Metrics</h4>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Monthly Volume:</strong> Tracks bounty placements over 30 days</li>
                <li>• <strong>Treasury Health:</strong> LOW/MEDIUM/HIGH based on treasury balance</li>
                <li>• <strong>Participation Level:</strong> LOW/MEDIUM/HIGH based on active stakers</li>
                <li>• <strong>Active Stakers:</strong> Real-time count of users with active stakes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Global Chat */}
        <section id="chat" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Global Chat</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Real-Time Community Communication</h3>
            <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
              The Global Chat system enables real-time communication between community members, fostering 
              relationships and facilitating quick knowledge sharing outside of formal Q&A interactions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Core Features</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• Real-time messaging with persistent history</li>
                  <li>• Emoji picker with popular emoji selection</li>
                  <li>• GIF search powered by GIPHY API</li>
                  <li>• Persistent chat sidebar accessible from any page</li>
                  <li>• Mobile-responsive design with dark theme</li>
                  <li>• Message types: text, emoji, and GIF support</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">User Experience</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• One-click access from any page</li>
                  <li>• Auto-join global chat room</li>
                  <li>• Minimize/maximize functionality</li>
                  <li>• Message history preservation</li>
                  <li>• Real-time message updates</li>
                  <li>• Community etiquette guidelines</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Technical Implementation</h4>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Database:</strong> Persistent message storage with chat_rooms and chat_messages tables</li>
                <li>• <strong>API:</strong> RESTful endpoints for room management and messaging</li>
                <li>• <strong>Frontend:</strong> React components with real-time updates</li>
                <li>• <strong>GIF Integration:</strong> GIPHY API for search and selection</li>
                <li>• <strong>Security:</strong> Authentication required for all chat operations</li>
                <li>• <strong>Performance:</strong> Optimized queries and efficient message pagination</li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Community Benefits</h4>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Quick Questions:</strong> Get fast answers without creating formal posts</li>
                <li>• <strong>Community Building:</strong> Foster relationships between users</li>
                <li>• <strong>Knowledge Sharing:</strong> Share tips and insights informally</li>
                <li>• <strong>Platform Feedback:</strong> Discuss features and improvements</li>
                <li>• <strong>Celebration:</strong> Share achievements and bounty wins</li>
                <li>• <strong>Support:</strong> Help new users get started</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Security & Privacy</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Measures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Platform Security</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• HTTPS encryption</li>
                  <li>• Rate limiting</li>
                  <li>• Input validation</li>
                  <li>• SQL injection protection</li>
                  <li>• XSS prevention</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Blockchain Security</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Solana network security</li>
                  <li>• Transaction verification</li>
                  <li>• Smart contract audits</li>
                  <li>• Multi-signature wallets</li>
                </ul>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-violet-400 mb-2">Privacy Protection</h4>
            <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
              <li>• No personal data collection</li>
              <li>• Pseudonymous user accounts</li>
              <li>• Encrypted data storage</li>
              <li>• GDPR compliance</li>
              <li>• Data deletion rights</li>
            </ul>
          </div>
        </section>

        {/* Roadmap */}
        <section id="roadmap" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Development Roadmap</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Phase 1: Foundation (Q1 2025)</h3>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Core bounty platform launch</li>
                  <li>• User authentication and profiles</li>
                  <li>• Basic bounty creation and management</li>
                  <li>• Answer submission and acceptance</li>
                  <li>• Reputation system implementation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Phase 2: Enhancement (Q2 2025)</h3>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Advanced filtering and search</li>
                  <li>• Media upload and code block support</li>
                  <li>• Enhanced reputation and integrity system</li>
                  <li>• Mobile responsiveness improvements</li>
                  <li>• Performance optimizations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Phase 3: Expansion (Q3 2025)</h3>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Governance system launch</li>
                  <li>• Advanced analytics and insights</li>
                  <li>• API documentation and developer tools</li>
                  <li>• Community features and moderation</li>
                  <li>• Integration with external services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Phase 4: Ecosystem (Q4 2025)</h3>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Advanced governance features</li>
                  <li>• Cross-chain compatibility</li>
                  <li>• Enterprise features and partnerships</li>
                  <li>• Advanced AI and automation</li>
                  <li>• Global expansion and localization</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Documentation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Related Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/docs/user-guide"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">User Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Complete user documentation and tutorials</p>
            </Link>
            <Link
              to="/docs/developer-guide"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Developer Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Technical documentation for developers</p>
            </Link>
            <Link
              to="/docs/api-reference"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">API Reference</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Complete API documentation</p>
            </Link>
            <Link
              to="/docs/deployment-guide"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Deployment Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Production deployment instructions</p>
            </Link>
          </div>
        </section>

        {/* Download PDF */}
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Download Platform Documentation</h3>
          <p className="text-neutral-600 dark:text-gray-400 mb-4">
            Get a PDF version of this documentation for offline reading
          </p>
          <a
            href="/api/docs/platform.pdf"
            className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Download PDF
          </a>
        </div>
    </div>
  )
} 