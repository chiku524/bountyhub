import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { Layout } from '~/components/Layout';
import { FiArrowLeft, FiDownload, FiShield, FiFileText } from 'react-icons/fi';

export const loader: LoaderFunction = async () => {
  return json({
    title: "Legal Documents",
    description: "Privacy policy and terms of service with PDF download options"
  });
};

export default function LegalDocsPage() {
  const { title, description } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="w-auto max-w-6xl mx-auto mt-4 px-4 ml-24 pb-16">
        {/* Header */}
        <div className="mb-8 mt-16">
          <Link 
            to="/docs" 
            className="inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-gray-400 text-lg max-w-3xl">{description}</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Privacy Policy */}
          <div className="bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8">
            <div className="flex items-center mb-6">
              <FiShield className="w-8 h-8 text-violet-400 mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-white">Privacy Policy</h2>
                <p className="text-gray-400">How we collect, use, and protect your personal information</p>
              </div>
            </div>
            
            <div className="prose prose-invert prose-violet max-w-none mb-6">
              <p>
                Our privacy policy explains how portal.ask collects, uses, and protects your personal information. 
                We are committed to transparency and protecting your privacy while providing our services.
              </p>
              
              <h3>What We Collect</h3>
              <ul>
                <li>Account information (email, username, profile data)</li>
                <li>Content you create (posts, answers, comments)</li>
                <li>Usage data and analytics</li>
                <li>Blockchain transaction data</li>
                <li>Media files you upload</li>
              </ul>

              <h3>How We Use Your Data</h3>
              <ul>
                <li>Provide and improve our services</li>
                <li>Process transactions and bounties</li>
                <li>Maintain community standards</li>
                <li>Send important notifications</li>
                <li>Analyze platform usage</li>
              </ul>

              <h3>Your Rights</h3>
              <ul>
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Export your data</li>
                <li>Opt out of communications</li>
                <li>Control privacy settings</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/privacy"
                className="inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                <FiFileText className="w-4 h-4 mr-2" />
                View Privacy Policy
              </Link>
              <a
                href="/api/privacy.pdf"
                className="inline-flex items-center justify-center px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8">
            <div className="flex items-center mb-6">
              <FiFileText className="w-8 h-8 text-violet-400 mr-4" />
              <div>
                <h2 className="text-2xl font-semibold text-white">Terms of Service</h2>
                <p className="text-gray-400">Rules and guidelines for using portal.ask</p>
              </div>
            </div>
            
            <div className="prose prose-invert prose-violet max-w-none mb-6">
              <p>
                Our terms of service outline the rules and guidelines for using portal.ask. 
                By using our platform, you agree to these terms and our community standards.
              </p>
              
              <h3>Acceptable Use</h3>
              <ul>
                <li>Respect other users and their contributions</li>
                <li>Provide accurate and helpful information</li>
                <li>Follow community guidelines</li>
                <li>Respect intellectual property rights</li>
                <li>Maintain account security</li>
              </ul>

              <h3>Prohibited Activities</h3>
              <ul>
                <li>Harassment or bullying</li>
                <li>Spam or promotional content</li>
                <li>Plagiarism or copyright violation</li>
                <li>Impersonation of others</li>
                <li>Sharing personal information without consent</li>
              </ul>

              <h3>Bounty System Rules</h3>
              <ul>
                <li>Bounties must be for legitimate questions</li>
                <li>Answers must be original and helpful</li>
                <li>Disputes will be resolved fairly</li>
                <li>Platform fees apply to transactions</li>
                <li>Refunds available under certain conditions</li>
              </ul>

              <h3>Intellectual Property</h3>
              <ul>
                <li>You retain rights to your content</li>
                <li>You grant us license to display your content</li>
                <li>Respect others' intellectual property</li>
                <li>Report copyright violations</li>
                <li>DMCA compliance procedures</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/terms"
                className="inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                <FiFileText className="w-4 h-4 mr-2" />
                View Terms of Service
              </Link>
              <a
                href="/api/terms.pdf"
                className="inline-flex items-center justify-center px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </div>
          </div>

          {/* Additional Legal Information */}
          <div className="bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Additional Legal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-700/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Data Protection</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We implement industry-standard security measures to protect your data and comply with 
                  relevant data protection regulations.
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Encryption in transit and at rest</li>
                  <li>• Regular security audits</li>
                  <li>• GDPR compliance</li>
                  <li>• Data breach notification</li>
                </ul>
              </div>

              <div className="bg-neutral-700/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Blockchain & Cryptocurrency</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Our platform uses blockchain technology and cryptocurrency. Please understand the risks 
                  and regulatory considerations.
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Cryptocurrency volatility</li>
                  <li>• Regulatory compliance</li>
                  <li>• Transaction fees</li>
                  <li>• Wallet security</li>
                </ul>
              </div>

              <div className="bg-neutral-700/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Dispute Resolution</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We provide fair and transparent dispute resolution processes for bounty claims and 
                  community issues.
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Community moderation</li>
                  <li>• Appeal process</li>
                  <li>• Arbitration options</li>
                  <li>• Legal recourse</li>
                </ul>
              </div>

              <div className="bg-neutral-700/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Updates & Changes</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We may update our legal documents from time to time. Users will be notified of 
                  significant changes.
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• 30-day notice for changes</li>
                  <li>• Continued use acceptance</li>
                  <li>• Version history tracking</li>
                  <li>• Opt-out options</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg border border-violet-500/30 p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Legal Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">General Inquiries</h3>
                <p className="text-gray-400 mb-2">
                  For general legal questions about portal.ask:
                </p>
                <a 
                  href="mailto:bountybucks524@gmail.com"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  bountybucks524@gmail.com
                </a>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Legal Notices</h3>
                <p className="text-gray-400 mb-2">
                  For legal notices, DMCA takedowns, or other legal matters:
                </p>
                <a 
                  href="mailto:legal@portal.ask"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  legal@portal.ask
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-neutral-800/60 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Important Notes</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• These documents are for informational purposes only</li>
                <li>• Consult with legal professionals for specific advice</li>
                <li>• Laws may vary by jurisdiction</li>
                <li>• We reserve the right to modify these terms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 