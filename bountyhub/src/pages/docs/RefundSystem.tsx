import { Link } from 'react-router-dom'
import { FiArrowLeft, FiShield } from 'react-icons/fi'

export default function RefundSystem() {
  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/docs"
            className="inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Refund System Guide</h1>
          <p className="text-gray-300 text-lg">
            Complete guide to the community governance refund system and time-based restrictions
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-neutral-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#overview" className="text-violet-400 hover:text-violet-300">Overview</a></li>
            <li><a href="#eligibility" className="text-violet-400 hover:text-violet-300">Eligibility</a></li>
            <li><a href="#process" className="text-violet-400 hover:text-violet-300">Refund Process</a></li>
            <li><a href="#governance" className="text-violet-400 hover:text-violet-300">Governance & Voting</a></li>
            <li><a href="#timelocks" className="text-violet-400 hover:text-violet-300">Time-based Restrictions</a></li>
            <li><a href="#faq" className="text-violet-400 hover:text-violet-300">FAQ</a></li>
          </ul>
        </div>

        {/* Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Overview</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              The refund system allows users to request a refund of bounties under certain conditions, governed by community voting and platform rules.
            </p>
            <div className="flex items-center gap-4">
              <FiShield className="w-8 h-8 text-violet-400" />
              <span className="text-lg text-white font-semibold">Community-driven, transparent, and fair</span>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section id="eligibility" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Eligibility</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <ul className="text-gray-300 space-y-2">
              <li>• Refunds can be requested for unresolved or unsatisfactory bounties</li>
              <li>• Only the original bounty creator can request a refund</li>
              <li>• Requests must be made within the allowed time window</li>
              <li>• Abuse of the refund system may result in penalties</li>
            </ul>
          </div>
        </section>

        {/* Refund Process */}
        <section id="process" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Refund Process</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Step-by-Step</h3>
              <ol className="text-gray-300 space-y-2">
                <li>1. Go to the bounty post and click "Request Refund"</li>
                <li>2. Fill out the refund request form with reason and details</li>
                <li>3. Submit the request for community review</li>
                <li>4. Community members vote to approve or deny the refund</li>
                <li>5. If approved, the bounty is refunded to your wallet</li>
                <li>6. If denied, the bounty remains locked or is distributed as per rules</li>
              </ol>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Refund Statuses</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Pending: Awaiting community vote</li>
                <li>• Approved: Refund granted</li>
                <li>• Denied: Refund rejected</li>
                <li>• Expired: Request not acted upon in time</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Governance & Voting */}
        <section id="governance" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Governance & Voting</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <ul className="text-gray-300 space-y-2">
              <li>• Refund requests are decided by community vote</li>
              <li>• Each user has one vote per request</li>
              <li>• Voting period is typically 48 hours</li>
              <li>• Quorum and majority rules apply</li>
              <li>• Results are transparent and auditable</li>
            </ul>
          </div>
        </section>

        {/* Time-based Restrictions */}
        <section id="timelocks" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Time-based Restrictions</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <ul className="text-gray-300 space-y-2">
              <li>• Refunds must be requested within 7 days of bounty expiration</li>
              <li>• Voting period is 48 hours from request submission</li>
              <li>• Late requests are automatically denied</li>
              <li>• Time windows are enforced by smart contracts</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">FAQ</h2>
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Can I request a refund for any bounty?</h3>
              <p className="text-gray-300">Refunds are only available for unresolved or unsatisfactory bounties and must meet eligibility criteria.</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">How long does the refund process take?</h3>
              <p className="text-gray-300">The process typically takes 2-3 days, depending on community voting and review.</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">What happens if my refund is denied?</h3>
              <p className="text-gray-300">If denied, the bounty remains locked or is distributed according to platform rules.</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Can I appeal a refund decision?</h3>
              <p className="text-gray-300">Appeals may be submitted for review by platform moderators in exceptional cases.</p>
            </div>
          </div>
        </section>

        {/* Related Documentation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Related Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/docs/user-guide"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">User Guide</h3>
              <p className="text-gray-400 text-sm">Complete user guide and tutorials</p>
            </Link>
            <Link
              to="/docs/platform"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Platform Documentation</h3>
              <p className="text-gray-400 text-sm">Platform overview and features</p>
            </Link>
            <Link
              to="/docs/legal"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Legal Documents</h3>
              <p className="text-gray-400 text-sm">Terms, privacy, and compliance</p>
            </Link>
            <Link
              to="/docs/developer-guide"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Developer Guide</h3>
              <p className="text-gray-400 text-sm">Technical documentation for developers</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
} 