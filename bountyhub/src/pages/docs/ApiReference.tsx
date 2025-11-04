import { Link } from 'react-router-dom'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
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
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">API Reference</h1>
          <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 text-lg">
            Complete API documentation with endpoints, examples, and integration guides
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-600 dark:text-gray-300">
            <li><a href="#overview" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">API Overview</a></li>
            <li><a href="#authentication" className="text-violet-400 hover:text-violet-300">Authentication</a></li>
            <li><a href="#endpoints" className="text-violet-400 hover:text-violet-300">Endpoints</a></li>
            <li><a href="#virtual-tokens" className="text-violet-400 hover:text-violet-300">Virtual Token System</a></li>
            <li><a href="#governance" className="text-violet-400 hover:text-violet-300">Governance API</a></li>
            <li><a href="#refunds" className="text-violet-400 hover:text-violet-300">Refund Requests</a></li>
            <li><a href="#chat" className="text-violet-400 hover:text-violet-300">Chat API</a></li>
            <li><a href="#models" className="text-violet-400 hover:text-violet-300">Data Models</a></li>
            <li><a href="#errors" className="text-violet-400 hover:text-violet-300">Error Handling</a></li>
            <li><a href="#rate-limiting" className="text-violet-400 hover:text-violet-300">Rate Limiting</a></li>
            <li><a href="#examples" className="text-violet-400 hover:text-violet-300">Code Examples</a></li>
            <li><a href="#sdks" className="text-violet-400 hover:text-violet-300">SDKs & Libraries</a></li>
          </ul>
        </div>

        {/* API Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">API Overview</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Base URL</h3>
            <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 font-mono text-sm">
              <div className="text-violet-400">Production:</div>
              <div className="text-neutral-600 dark:text-gray-300">https://api.bountyhub.tech</div>
              <div className="text-violet-400 mt-2">Development:</div>
              <div className="text-neutral-600 dark:text-gray-300">http://localhost:8787</div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">API Versioning</h4>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The API uses URL versioning. All endpoints are prefixed with the version number.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div className="text-neutral-600 dark:text-gray-300">https://api.bountyhub.tech/v1/posts</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Content Type</h4>
              <p className="text-neutral-600 dark:text-gray-300">
                All requests and responses use JSON format with the Content-Type header set to application/json.
              </p>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Virtual Token System</h4>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub uses a virtual BBUX token system. All token operations are handled internally 
                without requiring external blockchain transactions.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                <li>• Virtual tokens with unlimited supply</li>
                <li>• Database-backed wallet system</li>
                <li>• Real-time balance tracking</li>
                <li>• Transparent transaction logging</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Authentication</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">JWT Authentication</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 font-mono text-sm">
                <div className="text-neutral-600 dark:text-gray-300">Authorization: Bearer YOUR_JWT_TOKEN</div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Getting a Token</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Authenticate by sending your credentials to the login endpoint.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Request</h4>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Response</h4>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Token Refresh</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Use the refresh token to get a new access token when it expires.
              </p>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Endpoints</h2>
          
          {/* Authentication Endpoints */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Authentication</h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/auth/signup</h4>
                  <span className="text-green-400 text-sm">Public</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Create a new user account</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "username": "string",
  "email": "string",
  "password": "string"
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/auth/login</h4>
                  <span className="text-green-400 text-sm">Public</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Authenticate user and get JWT token</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "email": "string",
  "password": "string"
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Endpoints */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Posts</h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/posts</h4>
                  <span className="text-green-400 text-sm">Public</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get paginated list of posts</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Query Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• page: Page number (default: 1)</li>
                      <li>• limit: Items per page (default: 10)</li>
                      <li>• sort: Sort field (newest, oldest, votes)</li>
                      <li>• filter: Filter by status (open, closed)</li>
                      <li>• tags: Filter by tags (comma-separated)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/posts</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Create a new post</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "title": "string",
  "content": "string",
  "type": "question",
  "bountyAmount": 100,
  "tags": ["javascript", "react"]
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "post": {
    "id": 1,
    "title": "string",
    "content": "string",
    "type": "question",
    "bountyAmount": 100,
    "tags": ["javascript", "react"],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/posts/{'{id}'}</h4>
                  <span className="text-green-400 text-sm">Public</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get a specific post with answers and comments</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Path Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• id: Post ID</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "post": {
    "id": 1,
    "title": "string",
    "content": "string",
    "answers": [...],
    "comments": [...],
    "votes": 10
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Endpoints */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Wallet</h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/wallet</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get user's wallet information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "wallet": {
    "bbuxBalance": "1000.000000000",
    "solBalance": "0.5",
    "address": "solana_address",
    "transactions": [...]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/wallet/deposit</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Initiate BBUX deposit</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "amount": 100,
  "solAmount": 0.1
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "transaction": {
    "id": "tx_id",
    "status": "pending",
    "amount": 100,
    "solAmount": 0.1
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/wallet/withdraw</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Withdraw BBUX tokens</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "amount": 100
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "transaction": {
    "id": "tx_id",
    "status": "pending",
    "amount": 100,
    "fee": 3,
    "netAmount": 97
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Endpoints */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Users</h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/users/{'{username}'}</h4>
                  <span className="text-green-400 text-sm">Public</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get user profile information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Path Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• username: User's username</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "reputation": 150,
    "posts": [...],
    "answers": [...]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Endpoints */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/notifications</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get user's notifications with pagination</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Query Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• page: Page number (default: 1)</li>
                      <li>• limit: Items per page (default: 20)</li>
                      <li>• read: Filter by read status (true/false)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "notifications": [
    {
      "id": "string",
      "userId": "number",
      "title": "string",
      "message": "string",
      "type": "comment" | "vote" | "answer" | "bounty" | "system",
      "read": "boolean",
      "navigation": {
        "url": "string",
        "label": "string"
      },
      "createdAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/notifications/{'{id}'}/read</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Mark a specific notification as read</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Path Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• id: Notification ID</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "Notification marked as read"
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/notifications/read-all</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Mark all user notifications as read</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "All notifications marked as read",
  "updatedCount": 15
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/notifications/unread-count</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get the count of unread notifications</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">No Parameters</h5>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">Returns count of unread notifications</p>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "count": 5
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Endpoints */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Chat</h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/chat</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get available chat rooms</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">No Parameters</h5>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">Returns list of available chat rooms</p>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "rooms": [
    {
      "id": "global-chat",
      "name": "Global Chat",
      "type": "GLOBAL",
      "description": "Community-wide conversation",
      "memberCount": 42
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/chat/{'{roomId}'}/messages</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Get messages from a specific chat room</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Query Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• limit: Number of messages to return (default: 30)</li>
                      <li>• before: Get messages before this timestamp</li>
                      <li>• after: Get messages after this timestamp</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "messages": [
    {
      "id": "string",
      "roomId": "global-chat",
      "userId": "number",
      "username": "string",
      "content": "string",
      "type": "text" | "gif" | "emoji",
      "gifUrl": "string (optional)",
      "createdAt": "string (ISO 8601)"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/chat/{'{roomId}'}/messages</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Send a message to a chat room</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "content": "string",
  "type": "text" | "gif" | "emoji",
  "gifUrl": "string (optional, for GIF messages)"
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": {
    "id": "string",
    "roomId": "global-chat",
    "userId": "number",
    "username": "string",
    "content": "string",
    "type": "text" | "gif" | "emoji",
    "gifUrl": "string (optional)",
    "createdAt": "string (ISO 8601)"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">POST /api/chat/{'{roomId}'}/join</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Join a chat room</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Request Body</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "Successfully joined chat room",
  "room": {
    "id": "global-chat",
    "name": "Global Chat",
    "type": "GLOBAL",
    "memberCount": 43
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-violet-400">GET /api/gifs/search</h4>
                  <span className="text-yellow-400 text-sm">Authenticated</span>
                </div>
                <p className="text-neutral-600 dark:text-gray-300 mb-3">Search for GIFs using GIPHY API</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Query Parameters</h5>
                    <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• q: Search query (required)</li>
                      <li>• limit: Number of results (default: 10, max: 25)</li>
                      <li>• offset: Pagination offset (default: 0)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Response</h5>
                    <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "gifs": [
    {
      "id": "string",
      "title": "string",
      "url": "string",
      "previewUrl": "string",
      "width": "number",
      "height": "number"
    }
  ],
  "pagination": {
    "total": 100,
    "count": 10,
    "offset": 0
  }
}`}
                    </pre>
                  </div>
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
              <h3 className="text-xl font-semibold text-white mb-4">Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                bountyhub uses a virtual BBUX token system where all token operations are handled internally. 
                Users automatically receive a virtual wallet upon account creation.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Virtual tokens with unlimited supply</li>
                <li>• Database-backed wallet system</li>
                <li>• Real-time balance tracking</li>
                <li>• Transparent transaction logging</li>
                <li>• No external wallet required</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">GET /api/wallet</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Get user's virtual wallet information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">No Parameters</h5>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Returns wallet balance and transaction history</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "wallet": {
    "balance": 1250.5,
    "totalEarned": 2000,
    "totalSpent": 749.5,
    "transactions": [
      {
        "id": "string",
        "type": "earn" | "spend" | "stake" | "unstake" | "reward",
        "amount": 100,
        "description": "string",
        "createdAt": "string (ISO 8601)"
      }
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">GET /api/stats</h4>
                <span className="text-green-400 text-sm">Public</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Get platform statistics including token supply</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">No Parameters</h5>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Returns platform-wide statistics</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "stats": {
    "totalUsers": 1250,
    "totalPosts": 3400,
    "totalAnswers": 8900,
    "totalBounties": 1200,
    "totalBBUX": 50000,
    "treasuryBalance": 2500
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governance API */}
        <section id="governance" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Governance API</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The governance system allows users to stake BBUX tokens and participate in platform decisions 
                with dynamic reward rates based on platform activity.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Dynamic staking rewards (0.05% - 0.12% daily)</li>
                <li>• Platform activity-based bonuses</li>
                <li>• Treasury health indicators</li>
                <li>• Real-time transparency logs</li>
                <li>• Community voting on refund requests</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">GET /api/governance</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Get governance dashboard data</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">No Parameters</h5>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Returns governance metrics and user staking info</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "governance": {
    "userStake": 500,
    "userRewardRate": 0.08,
    "totalStaked": 15000,
    "activeStakers": 45,
    "treasuryBalance": 2500,
    "monthlyVolume": 8000,
    "platformMetrics": {
      "treasuryHealth": "HIGH",
      "participationLevel": "MEDIUM",
      "activityLevel": "HIGH"
    },
    "transparencyLogs": [
      {
        "id": "string",
        "type": "stake" | "unstake" | "reward" | "governance_fee",
        "amount": 100,
        "description": "string",
        "timestamp": "string (ISO 8601)"
      }
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">POST /api/governance/stake</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Stake BBUX tokens for governance participation</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">Request Body</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "amount": 100
}`}
                  </pre>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "Successfully staked 100 BBUX",
  "newStake": 600,
  "rewardRate": 0.08
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">POST /api/governance/unstake</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Unstake BBUX tokens</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">Request Body</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "amount": 50
}`}
                  </pre>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "Successfully unstaked 50 BBUX",
  "newStake": 550,
  "rewardRate": 0.08
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">GET /api/governance/reward-rates</h4>
                <span className="text-green-400 text-sm">Public</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Get current reward rates and platform metrics</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">No Parameters</h5>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Returns current reward rates and platform health</p>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "rewardRates": {
    "baseRate": 0.05,
    "activityBonus": 0.02,
    "treasuryBonus": 0.01,
    "governanceBonus": 0.02,
    "participationPenalty": 0.03,
    "currentRate": 0.08,
    "maxRate": 0.12
  },
  "platformMetrics": {
    "monthlyVolume": 8000,
    "treasuryHealth": "HIGH",
    "participationLevel": "MEDIUM",
    "activeStakers": 45
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Requests */}
        <section id="refunds" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Refund Requests</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Overview</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The refund request system allows users to request refunds for unsatisfactory bounties, 
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
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">GET /api/refund-requests</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Get list of refund requests with pagination</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">Query Parameters</h5>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1 text-sm">
                    <li>• page: Page number (default: 1)</li>
                    <li>• limit: Items per page (default: 20)</li>
                    <li>• status: Filter by status (pending/approved/rejected)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "refundRequests": [
    {
      "id": "string",
      "postId": "string",
      "userId": "number",
      "username": "string",
      "reason": "string",
      "bountyAmount": 100,
      "status": "pending" | "approved" | "rejected",
      "votes": {
        "approve": 15,
        "reject": 8
      },
      "userVote": "approve" | "reject" | null,
      "createdAt": "string (ISO 8601)",
      "expiresAt": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">POST /api/refund-requests</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Create a new refund request</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">Request Body</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "postId": "string",
  "reason": "string"
}`}
                  </pre>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "Refund request created successfully",
  "refundRequest": {
    "id": "string",
    "postId": "string",
    "status": "pending",
    "createdAt": "string (ISO 8601)",
    "expiresAt": "string (ISO 8601)"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-violet-400">POST /api/refund-requests/{'{id}'}/vote</h4>
                <span className="text-yellow-400 text-sm">Authenticated</span>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 mb-3">Vote on a refund request</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">Request Body</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "vote": "approve" | "reject"
}`}
                  </pre>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-2">Response</h5>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": true,
  "message": "Vote recorded successfully",
  "reward": 5,
  "updatedVotes": {
    "approve": 16,
    "reject": 8
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Models */}
        <section id="models" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Data Models</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">User</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "id": "number",
  "username": "string",
  "email": "string",
  "solanaAddress": "string",
  "reputation": "number",
  "bio": "string",
  "avatar": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Post</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "id": "number",
  "userId": "number",
  "title": "string",
  "content": "string",
  "type": "question" | "answer",
  "parentId": "number?",
  "bountyAmount": "number?",
  "status": "open" | "closed" | "resolved",
  "tags": "string[]",
  "votes": "number",
  "answers": "Post[]",
  "comments": "Comment[]",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Comment</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "id": "number",
  "userId": "number",
  "postId": "number",
  "content": "string",
  "votes": "number",
  "user": "User",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Transaction</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "id": "string",
  "userId": "number",
  "type": "deposit" | "withdrawal" | "bounty" | "reward",
  "amount": "string",
  "solAmount": "string?",
  "status": "pending" | "completed" | "failed",
  "txHash": "string?",
  "createdAt": "string (ISO 8601)"
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Notification</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "id": "string",
  "userId": "number",
  "title": "string",
  "message": "string",
  "type": "comment" | "vote" | "answer" | "bounty" | "system",
  "read": "boolean",
  "navigation": {
    "url": "string",
    "label": "string"
  },
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section id="errors" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Error Handling</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Error Response Format</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                All error responses follow a consistent format with an error message, code, and optional details.
              </p>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details (optional)"
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Common Error Codes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">HTTP Status Codes</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• 400 - Bad Request</li>
                    <li>• 401 - Unauthorized</li>
                    <li>• 403 - Forbidden</li>
                    <li>• 404 - Not Found</li>
                    <li>• 422 - Validation Error</li>
                    <li>• 429 - Rate Limited</li>
                    <li>• 500 - Internal Server Error</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Error Codes</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• INVALID_CREDENTIALS</li>
                    <li>• TOKEN_EXPIRED</li>
                    <li>• INSUFFICIENT_BALANCE</li>
                    <li>• VALIDATION_ERROR</li>
                    <li>• RATE_LIMITED</li>
                    <li>• TRANSACTION_FAILED</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limiting */}
        <section id="rate-limiting" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Rate Limiting</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Rate Limits</h3>
            <p className="text-neutral-600 dark:text-gray-300 mb-4">
              API requests are rate limited to prevent abuse and ensure fair usage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Public Endpoints</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• 100 requests per minute</li>
                  <li>• 1000 requests per hour</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Authenticated Endpoints</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                  <li>• 500 requests per minute</li>
                  <li>• 5000 requests per hour</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Rate Limit Headers</h4>
              <p className="text-neutral-600 dark:text-gray-300 mb-2">
                Rate limit information is included in response headers:
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                <li>• X-RateLimit-Limit: Maximum requests per window</li>
                <li>• X-RateLimit-Remaining: Remaining requests in current window</li>
                <li>• X-RateLimit-Reset: Time when the rate limit resets (Unix timestamp)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section id="examples" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Code Examples</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">JavaScript/Node.js</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`// Authentication
const login = async (email, password) => {
  const response = await fetch('https://api.bountyhub.tech/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get posts
const getPosts = async (token, page = 1) => {
  const response = await fetch(\`https://api.bountyhub.tech/api/posts?page=\${page}\`, {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  return response.json();
};

// Create a post
const createPost = async (token, postData) => {
  const response = await fetch('https://api.bountyhub.tech/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify(postData)
  });
  return response.json();
};`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Python</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`import requests

class BountyHubAPI:
    def __init__(self, base_url="https://api.bountyhub.tech"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f"{self.base_url}/api/auth/login", json={
            "email": email,
            "password": password
        })
        data = response.json()
        if data["success"]:
            self.token = data["token"]
        return data
    
    def get_posts(self, page=1):
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        response = requests.get(f"{self.base_url}/api/posts?page={page}", headers=headers)
        return response.json()
    
    def create_post(self, title, content, post_type="question"):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
        response = requests.post(f"{self.base_url}/api/posts", json={
            "title": title,
            "content": content,
            "type": post_type
        }, headers=headers)
        return response.json()`}
              </pre>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">cURL</h3>
              <pre className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`# Login
curl -X POST https://api.bountyhub.tech/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password"}'

# Get posts
curl -X GET https://api.bountyhub.tech/api/posts \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a post
curl -X POST https://api.bountyhub.tech/api/posts \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"title": "My Question", "content": "Question content", "type": "question"}'`}
              </pre>
            </div>
          </div>
        </section>

        {/* SDKs */}
        <section id="sdks" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">SDKs & Libraries</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Official SDKs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">JavaScript/TypeScript</h4>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`npm install @bountyhub/sdk`}
                  </pre>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm mt-2">
                    Official JavaScript SDK with TypeScript support
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Python</h4>
                  <pre className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`pip install bountyhub-python`}
                  </pre>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm mt-2">
                    Official Python SDK with async support
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Community Libraries</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• <a href="#" className="text-violet-400 hover:text-violet-300">bountyhub-go</a> - Go client library</li>
                <li>• <a href="#" className="text-violet-400 hover:text-violet-300">bountyhub-ruby</a> - Ruby gem</li>
                <li>• <a href="#" className="text-violet-400 hover:text-violet-300">bountyhub-php</a> - PHP client</li>
                <li>• <a href="#" className="text-violet-400 hover:text-violet-300">bountyhub-dart</a> - Dart/Flutter package</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Documentation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Related Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/docs/developer-guide"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Developer Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Technical documentation for developers</p>
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
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Source code and examples</p>
            </a>
          </div>
        </section>

        {/* Download PDF */}
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Download API Reference</h3>
          <p className="text-neutral-600 dark:text-gray-400 mb-4">
            Get a PDF version of this API reference for offline reading
          </p>
          <a
            href="/api/docs/api-reference.pdf"
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