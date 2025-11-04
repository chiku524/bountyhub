import { Link } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiCode, FiServer, FiDatabase } from 'react-icons/fi'

export default function DeveloperGuide() {
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
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Developer Guide</h1>
          <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 text-lg">
            Technical documentation for developers, contributors, and integrators
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-600 dark:text-gray-300">
            <li><a href="#overview" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Technical Overview</a></li>
            <li><a href="#architecture" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">System Architecture</a></li>
            <li><a href="#setup" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Development Setup</a></li>
            <li><a href="#frontend" className="text-violet-400 hover:text-violet-300">Frontend Development</a></li>
            <li><a href="#backend" className="text-violet-400 hover:text-violet-300">Backend Development</a></li>
            <li><a href="#virtual-tokens" className="text-violet-400 hover:text-violet-300">Virtual Token System</a></li>
            <li><a href="#governance" className="text-violet-400 hover:text-violet-300">Governance System</a></li>
            <li><a href="#refund-system" className="text-violet-400 hover:text-violet-300">Refund Request System</a></li>
            <li><a href="#notification-system" className="text-violet-400 hover:text-violet-300">Notification System</a></li>
            <li><a href="#chat-system" className="text-violet-400 hover:text-violet-300">Chat System</a></li>
            <li><a href="#database" className="text-violet-400 hover:text-violet-300">Database Schema</a></li>
            <li><a href="#api" className="text-violet-400 hover:text-violet-300">API Reference</a></li>
            <li><a href="#deployment" className="text-violet-400 hover:text-violet-300">Deployment</a></li>
            <li><a href="#contributing" className="text-violet-400 hover:text-violet-300">Contributing</a></li>
          </ul>
        </div>

        {/* Technical Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Technical Overview</h2>
          <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Technology Stack</h3>
            <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
              bountyhub is built using modern web technologies with a focus on performance, scalability, and developer experience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-600 dark:text-violet-400 mb-2">Frontend</h4>
                <ul className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• React 18 with TypeScript</li>
                  <li>• Vite for build tooling</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• React Router for navigation</li>
                  <li>• React Hook Form for forms</li>
                  <li>• Dark theme optimized UI</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-600 dark:text-violet-400 mb-2">Backend</h4>
                <ul className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• Cloudflare Workers</li>
                  <li>• Hono framework</li>
                  <li>• D1 database (SQLite)</li>
                  <li>• Drizzle ORM</li>
                  <li>• JWT for authentication</li>
                  <li>• RESTful API design</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-600 dark:text-violet-400 mb-2">Virtual Token System</h4>
              <ul className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 space-y-1">
                <li>• Virtual BBUX tokens with unlimited supply</li>
                <li>• Database-backed wallet system</li>
                <li>• Real-time balance tracking</li>
                <li>• Transparent transaction logging</li>
                <li>• Dynamic governance rewards</li>
              </ul>
            </div>
          </div>
        </section>

        {/* System Architecture */}
        <section id="architecture" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">System Architecture</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">High-Level Architecture</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub follows a modern serverless architecture with edge computing capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiCode className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Frontend</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">React SPA with SSR</p>
                </div>
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiServer className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">API Layer</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Cloudflare Workers</p>
                </div>
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiDatabase className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Data Layer</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">D1 + Virtual Tokens</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Data Flow</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. <strong>User Interaction:</strong> Frontend sends requests to API</li>
                <li>2. <strong>Authentication:</strong> JWT tokens validate user sessions</li>
                <li>3. <strong>Business Logic:</strong> Workers process requests</li>
                <li>4. <strong>Data Persistence:</strong> D1 database stores application data</li>
                <li>5. <strong>Virtual Token Operations:</strong> Database transactions for token operations</li>
                <li>6. <strong>Response:</strong> JSON responses sent back to frontend</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Security Architecture</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• JWT-based authentication with refresh tokens</li>
                <li>• Rate limiting on all API endpoints</li>
                <li>• Input validation and sanitization</li>
                <li>• CORS protection</li>
                <li>• HTTPS encryption</li>
                <li>• Virtual token transaction verification</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Development Setup */}
        <section id="setup" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Development Setup</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Prerequisites</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Node.js 18+ and npm</li>
                <li>• Git for version control</li>
                <li>• Cloudflare account (for deployment)</li>
                <li>• Modern web browser</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Local Development</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Clone the repository: <code className="bg-neutral-700 px-2 py-1 rounded">git clone https://github.com/bountyhub/bountyhub.git</code></li>
                <li>2. Install dependencies: <code className="bg-neutral-700 px-2 py-1 rounded">npm install</code></li>
                <li>3. Set up environment variables: <code className="bg-neutral-700 px-2 py-1 rounded">cp .env.example .env</code></li>
                <li>4. Start development server: <code className="bg-neutral-700 px-2 py-1 rounded">npm run dev</code></li>
                <li>5. Start backend worker: <code className="bg-neutral-700 px-2 py-1 rounded">npm run worker:dev</code></li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Environment Variables</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left text-violet-400 py-2">Variable</th>
                      <th className="text-left text-violet-400 py-2">Description</th>
                      <th className="text-left text-violet-400 py-2">Required</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600 dark:text-gray-300">
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">DATABASE_URL</td>
                      <td className="py-2">D1 database connection string</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">JWT_SECRET</td>
                      <td className="py-2">Secret key for JWT tokens</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">JWT_REFRESH_SECRET</td>
                      <td className="py-2">Secret key for refresh tokens</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">ENVIRONMENT</td>
                      <td className="py-2">Development/production environment</td>
                      <td className="py-2">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Frontend Development */}
        <section id="frontend" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Frontend Development</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Project Structure</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>src/</div>
                <div className="ml-4">├── components/     # Reusable UI components</div>
                <div className="ml-4">├── pages/         # Page components</div>
                <div className="ml-4">├── contexts/      # React contexts</div>
                <div className="ml-4">├── hooks/         # Custom React hooks</div>
                <div className="ml-4">├── types/         # TypeScript type definitions</div>
                <div className="ml-4">├── utils/         # Utility functions</div>
                <div className="ml-4">├── App.tsx        # Main app component</div>
                <div className="ml-4">└── main.tsx       # App entry point</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Key Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Core Components</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Layout - Main app layout</li>
                    <li>• Nav - Navigation bar</li>
                    <li>• AuthProvider - Authentication context</li>
                    <li>• WalletProvider - Wallet connection</li>
                    <li>• LoadingSpinner - Loading states</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Feature Components</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• PostCard - Question/answer display</li>
                    <li>• VoteButton - Voting functionality</li>
                    <li>• CommentSection - Comments system</li>
                    <li>• TagSelector - Tag selection</li>
                    <li>• SearchBar - Search functionality</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">State Management</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The app uses React Context for global state management with custom hooks for data fetching.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• AuthProvider - User authentication state</li>
                <li>• WalletProvider - Solana wallet connection</li>
                <li>• Custom hooks for API calls</li>
                <li>• Local state for component-specific data</li>
                <li>• React Query for server state (planned)</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Styling</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Tailwind CSS is used for styling with a custom design system.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Dark theme by default</li>
                <li>• Violet accent colors</li>
                <li>• Responsive design</li>
                <li>• Consistent spacing and typography</li>
                <li>• Component-based styling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Backend Development */}
        <section id="backend" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Backend Development</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">API Structure</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>functions/api/</div>
                <div className="ml-4">├── auth/           # Authentication endpoints</div>
                <div className="ml-4">├── posts/          # Posts and questions</div>
                <div className="ml-4">├── users/          # User management</div>
                <div className="ml-4">├── wallet/         # Wallet operations</div>
                <div className="ml-4">├── governance/     # Governance system</div>
                <div className="ml-4">└── index.ts        # Main API handler</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Request Handling</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                All API requests go through a centralized handler with middleware for authentication, validation, and error handling.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. <strong>Request Validation:</strong> Validate input data and headers</li>
                <li>2. <strong>Authentication:</strong> Verify JWT tokens</li>
                <li>3. <strong>Rate Limiting:</strong> Check request frequency</li>
                <li>4. <strong>Business Logic:</strong> Process the request</li>
                <li>5. <strong>Response:</strong> Return JSON response</li>
                <li>6. <strong>Error Handling:</strong> Catch and format errors</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Authentication</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• JWT-based authentication</li>
                <li>• Refresh token rotation</li>
                <li>• Session management</li>
                <li>• Role-based access control</li>
                <li>• Secure password hashing</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Error Handling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">HTTP Status Codes</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• 200 - Success</li>
                    <li>• 400 - Bad Request</li>
                    <li>• 401 - Unauthorized</li>
                    <li>• 403 - Forbidden</li>
                    <li>• 404 - Not Found</li>
                    <li>• 500 - Internal Server Error</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Error Response Format</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Virtual Token System */}
        <section id="virtual-tokens" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Virtual Token System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">System Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub uses a virtual BBUX token system that operates entirely within the platform. 
                All token operations are handled through database transactions, providing a seamless 
                user experience without requiring external blockchain interactions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Key Features</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Virtual tokens with unlimited supply</li>
                    <li>• Database-backed wallet system</li>
                    <li>• Real-time balance tracking</li>
                    <li>• Transparent transaction logging</li>
                    <li>• Dynamic governance rewards</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Benefits</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• No external wallet required</li>
                    <li>• Instant transactions</li>
                    <li>• No gas fees</li>
                    <li>• Simplified user experience</li>
                    <li>• Easy integration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Schema</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>users table:</div>
                <div className="ml-4">├── id: number (primary key)</div>
                <div className="ml-4">├── username: string</div>
                <div className="ml-4">├── email: string</div>
                <div className="ml-4">├── password: string (hashed)</div>
                <div className="ml-4">├── reputation: number (default: 0)</div>
                <div className="ml-4">├── bbuxBalance: number (default: 0)</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
                <br />
                <div>transactions table:</div>
                <div className="ml-4">├── id: string (primary key)</div>
                <div className="ml-4">├── userId: number (foreign key)</div>
                <div className="ml-4">├── type: enum (earn, spend, stake, unstake, reward)</div>
                <div className="ml-4">├── amount: number</div>
                <div className="ml-4">├── description: string</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Token Operations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Earning Tokens</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                    <li>• <strong>Quality Answers:</strong> Earn BBUX for accepted answers</li>
                    <li>• <strong>Governance Participation:</strong> Rewards for voting</li>
                    <li>• <strong>Refund Voting:</strong> Earn tokens for participating in refund decisions</li>
                    <li>• <strong>Staking Rewards:</strong> Daily rewards for staked tokens</li>
                    <li>• <strong>Platform Activity:</strong> Bonuses for high activity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Spending Tokens</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                    <li>• <strong>Bounty Creation:</strong> Set bounties on questions</li>
                    <li>• <strong>Governance Staking:</strong> Stake tokens for voting power</li>
                    <li>• <strong>Platform Fees:</strong> 5% fee on bounty placements</li>
                    <li>• <strong>Community Treasury:</strong> Funding platform development</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Dynamic Reward System</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The platform features a dynamic reward system that adjusts based on platform activity and user participation.
              </p>
              <div className="bg-neutral-700 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Reward Rate Calculation</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• <strong>Base Rate:</strong> 0.05% daily (18.25% APY)</li>
                  <li>• <strong>Activity Bonus:</strong> +0.02% for high platform volume</li>
                  <li>• <strong>Treasury Bonus:</strong> +0.01% when treasury is healthy</li>
                  <li>• <strong>Governance Bonus:</strong> +0.02% for active governance participation</li>
                  <li>• <strong>Participation Penalty:</strong> -0.03% when total staking is high</li>
                  <li>• <strong>Maximum Rate:</strong> 0.12% daily (43.8% APY)</li>
                </ul>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 text-sm">
                Reward rates are calculated in real-time based on platform metrics and distributed automatically.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Implementation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Backend Services</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <code className="bg-neutral-700 px-1 rounded">utils/token-supply.ts</code> - Token supply calculations</li>
                    <li>• <code className="bg-neutral-700 px-1 rounded">utils/governance.ts</code> - Governance and rewards</li>
                    <li>• <code className="bg-neutral-700 px-1 rounded">api/wallet/</code> - Wallet operations</li>
                    <li>• <code className="bg-neutral-700 px-1 rounded">api/governance/</code> - Governance endpoints</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Frontend Components</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <code className="bg-neutral-700 px-1 rounded">pages/Wallet.tsx</code> - Wallet interface</li>
                    <li>• <code className="bg-neutral-700 px-1 rounded">pages/Governance.tsx</code> - Governance dashboard</li>
                    <li>• <code className="bg-neutral-700 px-1 rounded">contexts/WalletProvider.tsx</code> - Wallet state</li>
                    <li>• <code className="bg-neutral-700 px-1 rounded">utils/api.ts</code> - API integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notification System */}
        <section id="notification-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Notification System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Architecture Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The notification system provides real-time alerts for user interactions and platform events.
                It's designed for performance and scalability with minimal API overhead.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Frontend Components</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Notifications.tsx - Main notification component</li>
                    <li>• Nav.tsx - Notification bell and badge</li>
                    <li>• useNotifications hook - State management</li>
                    <li>• Notification types and interfaces</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Backend APIs</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• /api/notifications - List notifications</li>
                    <li>• /api/notifications/{'{id}'}/read - Mark as read</li>
                    <li>• /api/notifications/read-all - Mark all read</li>
                    <li>• /api/notifications/unread-count - Get count</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Schema</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>notifications table:</div>
                <div className="ml-4">├── id: string (primary key)</div>
                <div className="ml-4">├── userId: number (foreign key)</div>
                <div className="ml-4">├── title: string</div>
                <div className="ml-4">├── message: string</div>
                <div className="ml-4">├── type: enum (comment, vote, answer, bounty, system)</div>
                <div className="ml-4">├── read: boolean (default: false)</div>
                <div className="ml-4">├── navigation: json (url, label)</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Notification Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">User Interactions</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>comment:</strong> New comment on user's post</li>
                    <li>• <strong>vote:</strong> Vote on user's content</li>
                    <li>• <strong>answer:</strong> New answer to user's question</li>
                    <li>• <strong>bounty:</strong> Bounty awarded or received</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">System Events</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>system:</strong> Platform announcements</li>
                    <li>• <strong>reputation:</strong> Reputation changes</li>
                    <li>• <strong>governance:</strong> Governance updates</li>
                    <li>• <strong>security:</strong> Security alerts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Performance Optimizations</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The notification system has been optimized for performance and user experience.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Recent Improvements</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Removed unnecessary API polling</li>
                    <li>• Real-time notification creation</li>
                    <li>• Efficient unread count endpoint</li>
                    <li>• Optimized database queries</li>
                    <li>• Enhanced error handling</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Best Practices</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Create notifications on user actions</li>
                    <li>• Use navigation data for direct links</li>
                    <li>• Implement proper error handling</li>
                    <li>• Cache unread counts locally</li>
                    <li>• Batch notification operations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chat System */}
        <section id="chat-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Chat System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Architecture Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The chat system provides real-time messaging capabilities with support for text, emojis, and GIFs.
                It's built using a RESTful API approach with persistent message storage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Frontend Components</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• ChatSidebar.tsx - Main chat interface</li>
                    <li>• Chat.tsx - Full chat page</li>
                    <li>• Emoji picker integration</li>
                    <li>• GIF search with GIPHY API</li>
                    <li>• Real-time message updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Backend APIs</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• /api/chat - Get chat rooms</li>
                    <li>• /api/chat/{'{roomId}'}/messages - Get/send messages</li>
                    <li>• /api/chat/{'{roomId}'}/join - Join chat room</li>
                    <li>• /api/gifs/search - Search GIFs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Schema</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>chat_rooms table:</div>
                <div className="ml-4">├── id: string (primary key)</div>
                <div className="ml-4">├── name: string</div>
                <div className="ml-4">├── type: enum (GLOBAL, PRIVATE)</div>
                <div className="ml-4">├── description: string</div>
                <div className="ml-4">├── memberCount: number</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
                <div className="mt-2">chat_messages table:</div>
                <div className="ml-4">├── id: string (primary key)</div>
                <div className="ml-4">├── roomId: string (foreign key)</div>
                <div className="ml-4">├── userId: number (foreign key)</div>
                <div className="ml-4">├── content: string</div>
                <div className="ml-4">├── type: enum (text, gif, emoji)</div>
                <div className="ml-4">├── gifUrl: string (optional)</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Message Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Text Messages</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Standard text content</li>
                    <li>• Markdown support</li>
                    <li>• Username display</li>
                    <li>• Timestamp tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Emoji Messages</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Emoji picker integration</li>
                    <li>• Popular emoji selection</li>
                    <li>• Unicode emoji support</li>
                    <li>• Quick reaction system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">GIF Messages</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• GIPHY API integration</li>
                    <li>• Search functionality</li>
                    <li>• Preview and selection</li>
                    <li>• Direct GIF sending</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">GIF Integration</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The chat system integrates with GIPHY API for GIF search and sharing capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">GIPHY API Setup</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Environment variable configuration</li>
                    <li>• API key management</li>
                    <li>• Rate limiting handling</li>
                    <li>• Error handling and fallbacks</li>
                    <li>• Search result pagination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Frontend Integration</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Search input with debouncing</li>
                    <li>• GIF grid display</li>
                    <li>• Loading states and error handling</li>
                    <li>• Responsive design for mobile</li>
                    <li>• Click-to-send functionality</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Message Updates</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Polling-based message updates</li>
                    <li>• Optimistic UI updates</li>
                    <li>• Message history preservation</li>
                    <li>• Pagination for large chat histories</li>
                    <li>• Auto-scroll to latest messages</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">User Experience</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Persistent chat sidebar</li>
                    <li>• Minimize/maximize functionality</li>
                    <li>• Mobile-responsive design</li>
                    <li>• Dark theme integration</li>
                    <li>• Loading and error states</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Security & Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Security Measures</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Authentication required for all endpoints</li>
                    <li>• Input validation and sanitization</li>
                    <li>• Rate limiting on message sending</li>
                    <li>• Content moderation capabilities</li>
                    <li>• User permission checks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Performance Optimizations</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Efficient database queries</li>
                    <li>• Message pagination</li>
                    <li>• GIF search caching</li>
                    <li>• Optimized API responses</li>
                    <li>• Minimal re-renders</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governance System */}
        <section id="governance" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Governance System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Governance Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The governance system allows users to participate in platform decisions and manage platform resources.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Governance Types</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Proposal:</strong> New feature or change proposal</li>
                    <li>• <strong>Vote:</strong> Decision on a proposal</li>
                    <li>• <strong>Reputation:</strong> User reputation points</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Governance Process</h4>
                  <ol className="text-neutral-600 dark:text-gray-400 space-y-2">
                    <li>1. <strong>Proposal Submission:</strong> User creates a proposal</li>
                    <li>2. <strong>Voting:</strong> Community votes on the proposal</li>
                    <li>3. <strong>Implementation:</strong> Proposal implemented if majority vote</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Schema</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>governance table:</div>
                <div className="ml-4">├── id: string (primary key)</div>
                <div className="ml-4">├── userId: number (foreign key)</div>
                <div className="ml-4">├── proposal: string</div>
                <div className="ml-4">├── vote: boolean (default: false)</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Reputation System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Reputation Calculation</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-4">
                    Reputation points are calculated based on user activity and contributions.
                  </p>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                    <li>• Positive actions (e.g., upvotes, helpful comments) increase reputation</li>
                    <li>• Negative actions (e.g., downvotes, harmful comments) decrease reputation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Reputation Impact</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-4">
                    Reputation affects user privileges and access to platform features.
                  </p>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                    <li>• Higher reputation allows more voting power</li>
                    <li>• Lower reputation may limit voting power</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Request System */}
        <section id="refund-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Refund Request System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Refund Request Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The refund request system allows users to request a refund for a post or answer.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Refund Request Process</h4>
                  <ol className="text-neutral-600 dark:text-gray-400 space-y-2">
                    <li>1. <strong>Request Submission:</strong> User submits a refund request</li>
                    <li>2. <strong>Review:</strong> Platform reviews the request</li>
                    <li>3. <strong>Decision:</strong> Platform decides on the request</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Refund Request Types</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Post Refund:</strong> Refund for a post</li>
                    <li>• <strong>Answer Refund:</strong> Refund for an answer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Schema</h3>
              <div className="bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div>refunds table:</div>
                <div className="ml-4">├── id: string (primary key)</div>
                <div className="ml-4">├── userId: number (foreign key)</div>
                <div className="ml-4">├── postId: string (foreign key)</div>
                <div className="ml-4">├── answerId: string (foreign key)</div>
                <div className="ml-4">├── amount: number</div>
                <div className="ml-4">├── status: enum (pending, approved, rejected)</div>
                <div className="ml-4">├── createdAt: timestamp</div>
                <div className="ml-4">└── updatedAt: timestamp</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Refund Request Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Post Refund</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-4">
                    Refund for a post, including all answers and comments.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Answer Refund</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-4">
                    Refund for a specific answer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Database Schema */}
        <section id="database" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Database Schema</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Core Tables</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Users</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• id: Primary key</li>
                    <li>• username: Unique username</li>
                    <li>• email: User email</li>
                    <li>• password_hash: Hashed password</li>
                    <li>• solana_address: Wallet address</li>
                    <li>• reputation: User reputation points</li>
                    <li>• created_at: Account creation date</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Posts</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• id: Primary key</li>
                    <li>• user_id: Author user ID</li>
                    <li>• title: Post title</li>
                    <li>• content: Post content</li>
                    <li>• type: 'question' or 'answer'</li>
                    <li>• parent_id: Parent question ID (for answers)</li>
                    <li>• bounty_amount: BBUX bounty amount</li>
                    <li>• status: Post status</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Votes</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• id: Primary key</li>
                    <li>• user_id: Voter user ID</li>
                    <li>• post_id: Voted post ID</li>
                    <li>• vote_type: 'up' or 'down'</li>
                    <li>• created_at: Vote timestamp</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Relationships</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Users can have many Posts (one-to-many)</li>
                <li>• Posts can have many Votes (one-to-many)</li>
                <li>• Questions can have many Answers (one-to-many)</li>
                <li>• Users can vote on multiple Posts (many-to-many)</li>
                <li>• Tags are linked to Posts (many-to-many)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">API Reference</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Authentication Endpoints</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">POST /api/auth/signup</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Create a new user account</p>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "username": "string",
  "email": "string",
  "password": "string",
  "solanaAddress": "string"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">POST /api/auth/login</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Authenticate user and get JWT token</p>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "email": "string",
  "password": "string"
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Posts Endpoints</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">GET /api/posts</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Get paginated list of posts</p>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Query params: page, limit, sort, filter</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">POST /api/posts</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Create a new post</p>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "title": "string",
  "content": "string",
  "type": "question",
  "bountyAmount": "number",
  "tags": ["string"]
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">POST /api/posts/{'{id}'}/vote</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Vote on a post</p>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "voteType": "up" | "down"
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Wallet Endpoints</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">GET /api/wallet</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Get user's wallet information</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">POST /api/wallet/deposit</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Initiate BBUX deposit</p>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "amount": "number",
  "solAmount": "number"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">POST /api/wallet/withdraw</h4>
                  <p className="text-neutral-600 dark:text-gray-300 mb-2">Withdraw BBUX tokens</p>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "amount": "number"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deployment */}
        <section id="deployment" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Deployment</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Production Deployment</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub is deployed on Cloudflare Pages and Workers for optimal performance and scalability.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. <strong>Build:</strong> <code className="bg-neutral-700 px-2 py-1 rounded">npm run build</code></li>
                <li>2. <strong>Deploy Frontend:</strong> <code className="bg-neutral-700 px-2 py-1 rounded">npm run deploy</code></li>
                <li>3. <strong>Deploy Workers:</strong> <code className="bg-neutral-700 px-2 py-1 rounded">wrangler deploy</code></li>
                <li>4. <strong>Setup Database:</strong> <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 migrations apply</code></li>
                <li>5. <strong>Configure Environment:</strong> Set production environment variables</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Environment Configuration</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Use production Solana RPC endpoints</li>
                <li>• Configure production database</li>
                <li>• Set secure JWT secrets</li>
                <li>• Enable monitoring and logging</li>
                <li>• Configure CDN and caching</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Monitoring</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Cloudflare Analytics for performance</li>
                <li>• Error tracking and alerting</li>
                <li>• Database performance monitoring</li>
                <li>• Blockchain transaction monitoring</li>
                <li>• User activity analytics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contributing */}
        <section id="contributing" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Contributing</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Development Workflow</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Fork the repository</li>
                <li>2. Create a feature branch: <code className="bg-neutral-700 px-2 py-1 rounded">git checkout -b feature/name</code></li>
                <li>3. Make your changes</li>
                <li>4. Write tests for new functionality</li>
                <li>5. Run linting: <code className="bg-neutral-700 px-2 py-1 rounded">npm run lint</code></li>
                <li>6. Run tests: <code className="bg-neutral-700 px-2 py-1 rounded">npm run test</code></li>
                <li>7. Commit your changes: <code className="bg-neutral-700 px-2 py-1 rounded">git commit -m "feat: add new feature"</code></li>
                <li>8. Push to your fork: <code className="bg-neutral-700 px-2 py-1 rounded">git push origin feature/name</code></li>
                <li>9. Create a pull request</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Code Standards</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Follow TypeScript best practices</li>
                <li>• Use ESLint and Prettier for formatting</li>
                <li>• Write meaningful commit messages</li>
                <li>• Add JSDoc comments for functions</li>
                <li>• Write unit tests for new features</li>
                <li>• Follow the existing code style</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Getting Help</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Community</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• GitHub Discussions</li>
                    <li>• Discord server</li>
                    <li>• Community forum</li>
                    <li>• Stack Overflow</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Resources</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• API documentation</li>
                    <li>• Architecture diagrams</li>
                    <li>• Development guides</li>
                    <li>• Video tutorials</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Documentation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Related Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/docs/api-reference"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">API Reference</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Complete API documentation with examples</p>
            </Link>
            <Link
              to="/docs/deployment-guide"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Deployment Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Production deployment instructions</p>
            </Link>
            <Link
              to="/docs/platform"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Platform Documentation</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Platform overview and architecture</p>
            </Link>
            <a
              href="https://github.com/bountyhub/bountyhub"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">GitHub Repository</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Source code and issue tracking</p>
            </a>
          </div>
        </section>

        {/* Download PDF */}
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Download Developer Guide</h3>
          <p className="text-neutral-600 dark:text-gray-400 mb-4">
            Get a PDF version of this developer guide for offline reading
          </p>
          <a
            href="/api/docs/developer-guide.pdf"
            className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
} 