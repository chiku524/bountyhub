import { Link } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiServer, FiCloud, FiDatabase } from 'react-icons/fi'

export default function DeploymentGuide() {
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
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Deployment Guide</h1>
          <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 text-lg">
            Production deployment instructions and infrastructure setup
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-600 dark:text-gray-300">
            <li><a href="#overview" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Deployment Overview</a></li>
            <li><a href="#prerequisites" className="text-violet-400 hover:text-violet-300">Prerequisites</a></li>
            <li><a href="#cloudflare-setup" className="text-violet-400 hover:text-violet-300">Cloudflare Setup</a></li>
            <li><a href="#database-setup" className="text-violet-400 hover:text-violet-300">Database Setup</a></li>
            <li><a href="#environment" className="text-violet-400 hover:text-violet-300">Environment Configuration</a></li>
            <li><a href="#deployment" className="text-violet-400 hover:text-violet-300">Deployment Process</a></li>
            <li><a href="#monitoring" className="text-violet-400 hover:text-violet-300">Monitoring & Logging</a></li>
            <li><a href="#scaling" className="text-violet-400 hover:text-violet-300">Scaling & Performance</a></li>
            <li><a href="#security" className="text-violet-400 hover:text-violet-300">Security Considerations</a></li>
            <li><a href="#troubleshooting" className="text-violet-400 hover:text-violet-300">Troubleshooting</a></li>
          </ul>
        </div>

        {/* Deployment Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Deployment Overview</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Architecture</h3>
            <p className="text-neutral-600 dark:text-gray-300 mb-4">
              bountyhub is designed to run on Cloudflare's edge computing platform, providing global performance 
              and scalability with minimal infrastructure management.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <FiCloud className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold">Cloudflare Pages</h4>
                <p className="text-neutral-600 dark:text-gray-400 text-sm">Frontend hosting</p>
              </div>
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <FiServer className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold">Cloudflare Workers</h4>
                <p className="text-neutral-600 dark:text-gray-400 text-sm">Backend API</p>
              </div>
              <div className="text-center p-4 bg-neutral-700 rounded-lg">
                <FiDatabase className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold">D1 Database</h4>
                <p className="text-neutral-600 dark:text-gray-400 text-sm">Data storage</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-violet-400 mb-2">Benefits</h4>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                <li>• Global edge deployment with low latency</li>
                <li>• Automatic scaling and load balancing</li>
                <li>• Built-in DDoS protection</li>
                <li>• SSL/TLS encryption included</li>
                <li>• Minimal server management</li>
                <li>• Cost-effective for small to medium scale</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section id="prerequisites" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Prerequisites</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Required Accounts</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Cloudflare account</a> (free tier available)</li>
                <li>• <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">GitHub account</a> for source code hosting</li>
                <li>• <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Solana wallet</a> for blockchain operations</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Development Tools</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Node.js 18+ and npm</li>
                <li>• Git for version control</li>
                <li>• Cloudflare CLI (wrangler)</li>
                <li>• Solana CLI tools</li>
                <li>• Code editor (VS Code recommended)</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Installation</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Install Node.js from <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">nodejs.org</a></li>
                <li>2. Install Cloudflare CLI: <code className="bg-neutral-700 px-2 py-1 rounded">npm install -g wrangler</code></li>
                <li>3. Install Solana CLI: <code className="bg-neutral-700 px-2 py-1 rounded">sh -c "$(curl -sSfL https://release.solana.com/stable/install)"</code></li>
                <li>4. Clone the repository: <code className="bg-neutral-700 px-2 py-1 rounded">git clone https://github.com/bountyhub/bountyhub.git</code></li>
              </ol>
            </div>
          </div>
        </section>

        {/* Cloudflare Setup */}
        <section id="cloudflare-setup" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Cloudflare Setup</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Account Setup</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Create a Cloudflare account at <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">cloudflare.com</a></li>
                <li>2. Add your domain to Cloudflare (or use a subdomain)</li>
                <li>3. Configure DNS settings for your domain</li>
                <li>4. Enable Cloudflare Pages and Workers in your account</li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Authentication</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Authenticate with Cloudflare using the CLI tool.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Run authentication: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler login</code></li>
                <li>2. Follow the browser prompt to authorize</li>
                <li>3. Verify authentication: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler whoami</code></li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Project Configuration</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Configure your project for Cloudflare deployment.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">wrangler.toml</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`name = "bountyhub-api"
main = "functions/index.ts"
compatibility_date = "2025-01-01"

[env.production]
name = "bountyhub-api-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "bountyhub-prod"
database_id = "your-database-id"`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">package.json Scripts</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`{
  "scripts": {
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production",
    "dev": "wrangler dev",
    "db:migrate": "wrangler d1 migrations apply",
    "db:migrate:prod": "wrangler d1 migrations apply --env production"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Database Setup */}
        <section id="database-setup" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Database Setup</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">D1 Database Creation</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Create a new D1 database: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 create bountyhub-prod</code></li>
                <li>2. Note the database ID from the output</li>
                <li>3. Update your wrangler.toml with the database ID</li>
                <li>4. Create development database: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 create bountyhub-dev</code></li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Schema Migration</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Apply database migrations to set up the schema.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Generate migration: <code className="bg-neutral-700 px-2 py-1 rounded">npm run db:generate</code></li>
                <li>2. Apply to development: <code className="bg-neutral-700 px-2 py-1 rounded">npm run db:migrate</code></li>
                <li>3. Apply to production: <code className="bg-neutral-700 px-2 py-1 rounded">npm run db:migrate:prod</code></li>
                <li>4. Verify schema: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 execute bountyhub-prod --command=".schema"</code></li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Development</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Local SQLite for development</li>
                    <li>• Automatic schema updates</li>
                    <li>• Seed data for testing</li>
                    <li>• Reset capability</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Production</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• D1 database for production</li>
                    <li>• Automated backups</li>
                    <li>• Performance monitoring</li>
                    <li>• Read replicas (if needed)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Environment Configuration */}
        <section id="environment" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Environment Configuration</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Environment Variables</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Set up environment variables for different deployment environments.
              </p>
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
                      <td className="py-2 font-mono">JWT_SECRET</td>
                      <td className="py-2">Secret key for JWT tokens</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">SOLANA_RPC_URL</td>
                      <td className="py-2">Solana RPC endpoint</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">BBUX_TOKEN_ADDRESS</td>
                      <td className="py-2">BBUX token mint address</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">PLATFORM_WALLET_ADDRESS</td>
                      <td className="py-2">Platform wallet for fees</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-neutral-700">
                      <td className="py-2 font-mono">ENVIRONMENT</td>
                      <td className="py-2">Environment name (dev/prod)</td>
                      <td className="py-2">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Setting Variables</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Development</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`# .env file
JWT_SECRET=your-dev-secret-key
SOLANA_RPC_URL=https://proud-quick-haze.solana-mainnet.quiknode.pro/6ef6dbb1b21d654b4e164546f9c925d47e24dcc1/
BBUX_TOKEN_ADDRESS=your-dev-token-address
PLATFORM_WALLET_ADDRESS=your-dev-wallet
ENVIRONMENT=development`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Production</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`# Set via wrangler
wrangler secret put JWT_SECRET
wrangler secret put SOLANA_RPC_URL
wrangler secret put BBUX_TOKEN_ADDRESS
wrangler secret put PLATFORM_WALLET_ADDRESS

# Or via dashboard
# Go to Workers > your-worker > Settings > Variables`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Security Best Practices</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Use strong, unique secrets for each environment</li>
                <li>• Rotate secrets regularly</li>
                <li>• Never commit secrets to version control</li>
                <li>• Use environment-specific configurations</li>
                <li>• Limit access to production secrets</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Deployment Process */}
        <section id="deployment" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Deployment Process</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Frontend Deployment</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Deploy the React frontend to Cloudflare Pages.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Build the project: <code className="bg-neutral-700 px-2 py-1 rounded">npm run build</code></li>
                <li>2. Deploy to Pages: <code className="bg-neutral-700 px-2 py-1 rounded">npm run deploy</code></li>
                <li>3. Configure custom domain in Cloudflare dashboard</li>
                <li>4. Set up environment variables for frontend</li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Backend Deployment</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Deploy the API to Cloudflare Workers.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Build the worker: <code className="bg-neutral-700 px-2 py-1 rounded">npm run build:worker</code></li>
                <li>2. Deploy to Workers: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler deploy</code></li>
                <li>3. Deploy to production: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler deploy --env production</code></li>
                <li>4. Verify deployment: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler tail</code></li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Deployment</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Deploy database schema and initial data.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Apply migrations: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 migrations apply bountyhub-prod</code></li>
                <li>2. Seed initial data: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 execute bountyhub-prod --file=./seed.sql</code></li>
                <li>3. Verify data: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler d1 execute bountyhub-prod --command="SELECT COUNT(*) FROM users;"</code></li>
              </ol>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Automated Deployment</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Set up GitHub Actions for automated deployment.
              </p>
              <pre className="bg-neutral-700 p-4 rounded text-sm text-neutral-600 dark:text-gray-300">
{`.github/workflows/deploy.yml
name: Deploy to Cloudflare
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:prod
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Monitoring & Logging */}
        <section id="monitoring" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Monitoring & Logging</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Cloudflare Analytics</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Monitor your application performance using Cloudflare's built-in analytics.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Request volume and response times</li>
                <li>• Error rates and status codes</li>
                <li>• Geographic distribution of users</li>
                <li>• Cache hit rates</li>
                <li>• Bandwidth usage</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Logging</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Real-time Logs</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• View live logs: <code className="bg-neutral-700 px-2 py-1 rounded">wrangler tail</code></li>
                    <li>• Filter by environment</li>
                    <li>• Search and analyze logs</li>
                    <li>• Set up alerts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Structured Logging</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• JSON format logs</li>
                    <li>• Request correlation IDs</li>
                    <li>• Performance metrics</li>
                    <li>• Error tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Performance Monitoring</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Monitor API response times</li>
                <li>• Track database query performance</li>
                <li>• Monitor Solana transaction success rates</li>
                <li>• Set up performance alerts</li>
                <li>• Track user engagement metrics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Scaling & Performance */}
        <section id="scaling" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Scaling & Performance</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Automatic Scaling</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Cloudflare Workers automatically scale based on demand.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Instant scaling to handle traffic spikes</li>
                <li>• Global edge deployment</li>
                <li>• No server provisioning required</li>
                <li>• Pay-per-request pricing model</li>
                <li>• Built-in load balancing</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Performance Optimization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Frontend</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Code splitting and lazy loading</li>
                    <li>• Image optimization</li>
                    <li>• CDN caching</li>
                    <li>• Service worker caching</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Backend</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Database query optimization</li>
                    <li>• Response caching</li>
                    <li>• Connection pooling</li>
                    <li>• Rate limiting</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Database Scaling</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• D1 databases scale automatically</li>
                <li>• Consider read replicas for high traffic</li>
                <li>• Implement connection pooling</li>
                <li>• Optimize query patterns</li>
                <li>• Monitor query performance</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Considerations */}
        <section id="security" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Security Considerations</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Infrastructure Security</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Cloudflare's built-in DDoS protection</li>
                <li>• Automatic SSL/TLS encryption</li>
                <li>• Web Application Firewall (WAF)</li>
                <li>• Bot management and protection</li>
                <li>• Geographic access controls</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Application Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Authentication</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• JWT token validation</li>
                    <li>• Secure password hashing</li>
                    <li>• Rate limiting on auth endpoints</li>
                    <li>• Session management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Data Protection</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Input validation and sanitization</li>
                    <li>• SQL injection prevention</li>
                    <li>• XSS protection</li>
                    <li>• CSRF protection</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Blockchain Security</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Secure private key management</li>
                <li>• Transaction signature verification</li>
                <li>• Multi-signature wallets for platform funds</li>
                <li>• Regular security audits</li>
                <li>• Emergency pause mechanisms</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Troubleshooting</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Common Issues</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Deployment Failures</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Check wrangler.toml configuration</li>
                    <li>• Verify environment variables</li>
                    <li>• Check Cloudflare account permissions</li>
                    <li>• Review build logs for errors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Database Issues</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Verify database ID in wrangler.toml</li>
                    <li>• Check migration status</li>
                    <li>• Review database permissions</li>
                    <li>• Test database connectivity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Performance Issues</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Monitor request logs</li>
                    <li>• Check database query performance</li>
                    <li>• Review caching configuration</li>
                    <li>• Analyze error rates</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Debugging Commands</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Worker Debugging</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`# View real-time logs
wrangler tail

# Test worker locally
wrangler dev

# Check worker status
wrangler status

# View worker analytics
wrangler analytics`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Database Debugging</h4>
                  <pre className="bg-neutral-700 p-3 rounded text-sm text-neutral-600 dark:text-gray-300">
{`# Execute SQL query
wrangler d1 execute bountyhub-prod --command="SELECT * FROM users LIMIT 5;"

# View database info
wrangler d1 info bountyhub-prod

# Check migration status
wrangler d1 migrations list bountyhub-prod`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Getting Help</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Documentation</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <a href="https://developers.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Cloudflare Docs</a></li>
                    <li>• <a href="https://developers.cloudflare.com/workers" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Workers Documentation</a></li>
                    <li>• <a href="https://developers.cloudflare.com/d1" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">D1 Documentation</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Community</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <a href="https://community.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Cloudflare Community</a></li>
                    <li>• <a href="https://discord.gg/cloudflare" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Discord Server</a></li>
                    <li>• <a href="https://stackoverflow.com/questions/tagged/cloudflare-workers" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Stack Overflow</a></li>
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
              to="/docs/developer-guide"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Developer Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Technical documentation for developers</p>
            </Link>
            <Link
              to="/docs/api-reference"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">API Reference</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Complete API documentation</p>
            </Link>
            <Link
              to="/docs/platform"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Platform Documentation</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Platform overview and architecture</p>
            </Link>
            <a
              href="https://developers.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Cloudflare Docs</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Official Cloudflare documentation</p>
            </a>
          </div>
        </section>

        {/* Download PDF */}
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Download Deployment Guide</h3>
          <p className="text-neutral-600 dark:text-gray-400 mb-4">
            Get a PDF version of this deployment guide for offline reading
          </p>
          <a
            href="/api/docs/deployment-guide.pdf"
            className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Download PDF
          </a>
        </div>
    </div>
  )
} 