import { Link } from 'react-router-dom'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'

export default function Legal() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Legal Documents</h1>
          <p className="text-gray-300 text-lg">
            Terms of service, privacy policy, and other legal information
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-neutral-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#terms" className="text-violet-400 hover:text-violet-300">Terms of Service</a></li>
            <li><a href="#privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</a></li>
            <li><a href="#cookies" className="text-violet-400 hover:text-violet-300">Cookie Policy</a></li>
            <li><a href="#disclaimer" className="text-violet-400 hover:text-violet-300">Disclaimer</a></li>
            <li><a href="#governance" className="text-violet-400 hover:text-violet-300">Governance Terms</a></li>
            <li><a href="#contact" className="text-violet-400 hover:text-violet-300">Legal Contact</a></li>
          </ul>
        </div>

        {/* Terms of Service */}
        <section id="terms" className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-white">Terms of Service</h2>
            <span className="text-sm text-gray-400">
              <strong>Last updated:</strong> June 23, 2025
            </span>
          </div>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-gray-300 mb-2">
                  By accessing and using bountyhub, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Description of Service</h3>
                <p className="text-gray-300 mb-2">
                  bountyhub is a decentralized Q&A platform that allows users to ask questions, provide answers, and earn BBUX tokens for quality contributions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. User Accounts</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• You must be at least 18 years old to use the Service</li>
                  <li>• You are responsible for maintaining the confidentiality of your account</li>
                  <li>• You are responsible for all activities that occur under your account</li>
                  <li>• You must provide accurate and complete information when creating an account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. User Conduct</h3>
                <p className="text-gray-300 mb-2">You agree not to:</p>
                <ul className="text-gray-300 space-y-1">
                  <li>• Post content that is illegal, harmful, threatening, abusive, or defamatory</li>
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Impersonate any person or entity</li>
                  <li>• Attempt to gain unauthorized access to the Service</li>
                  <li>• Interfere with or disrupt the Service</li>
                  <li>• Use the Service for commercial purposes without permission</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Content and Intellectual Property</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• You retain ownership of content you post</li>
                  <li>• You grant us a license to use, modify, and distribute your content</li>
                  <li>• We respect intellectual property rights and expect users to do the same</li>
                  <li>• Report copyright violations through our designated process</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. BBUX Tokens and Blockchain</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• BBUX tokens are utility tokens for platform features</li>
                  <li>• Token values may fluctuate and are not guaranteed</li>
                  <li>• We are not responsible for blockchain transaction failures</li>
                  <li>• Users are responsible for their wallet security</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">7. Termination</h3>
                <p className="text-gray-300 mb-2">
                  We may terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h3>
                <p className="text-gray-300 mb-2">
                  In no event shall bountyhub be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h3>
                <p className="text-gray-300 mb-2">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">10. Governing Law</h3>
                <p className="text-gray-300 mb-2">
                  These Terms shall be governed by and construed in accordance with the laws of the United States of America, without regard to its conflict of law provisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy" className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-white">Privacy Policy</h2>
            <span className="text-sm text-gray-400">
              <strong>Last updated:</strong> June 23, 2025
            </span>
          </div>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Personal Information</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Username and email address</li>
                      <li>• Solana wallet address</li>
                      <li>• Profile information and bio</li>
                      <li>• Communication preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Usage Information</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Posts, comments, and votes</li>
                      <li>• Transaction history</li>
                      <li>• Platform activity and interactions</li>
                      <li>• Device and browser information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Provide and maintain the Service</li>
                  <li>• Process transactions and manage BBUX tokens</li>
                  <li>• Send notifications and updates</li>
                  <li>• Improve and personalize the Service</li>
                  <li>• Ensure platform security and prevent fraud</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h3>
                <p className="text-gray-300 mb-2">We do not sell, trade, or rent your personal information. We may share information in the following circumstances:</p>
                <ul className="text-gray-300 space-y-1">
                  <li>• With your consent</li>
                  <li>• To comply with legal requirements</li>
                  <li>• To protect our rights and safety</li>
                  <li>• With service providers who assist in operating the platform</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Data Security</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• We implement appropriate security measures</li>
                  <li>• Data is encrypted in transit and at rest</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Access controls and authentication</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Data Retention</h3>
                <p className="text-gray-300 mb-2">
                  We retain your information for as long as necessary to provide the Service and comply with legal obligations. You may request deletion of your account and data.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Your Rights</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Access and review your personal information</li>
                  <li>• Update or correct your information</li>
                  <li>• Request deletion of your account</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Export your data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">7. Cookies and Tracking</h3>
                <p className="text-gray-300 mb-2">
                  We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">8. Third-Party Services</h3>
                <p className="text-gray-300 mb-2">
                  Our Service may integrate with third-party services. We are not responsible for the privacy practices of these services.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">9. International Transfers</h3>
                <p className="text-gray-300 mb-2">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">10. Changes to Privacy Policy</h3>
                <p className="text-gray-300 mb-2">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Policy */}
        <section id="cookies" className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-white">Cookie Policy</h2>
            <span className="text-sm text-gray-400">
              <strong>Last updated:</strong> June 23, 2025
            </span>
          </div>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">What Are Cookies?</h3>
                <p className="text-gray-300 mb-2">
                  Cookies are small text files stored on your device that help us provide and improve our Service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Types of Cookies We Use</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Essential Cookies</h4>
                    <p className="text-gray-300 mb-2">Required for basic functionality:</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Authentication and session management</li>
                      <li>• Security and fraud prevention</li>
                      <li>• Basic platform functionality</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Analytics Cookies</h4>
                    <p className="text-gray-300 mb-2">Help us understand usage patterns:</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Page views and user behavior</li>
                      <li>• Performance monitoring</li>
                      <li>• Service improvement insights</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Preference Cookies</h4>
                    <p className="text-gray-300 mb-2">Remember your settings:</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Language and region preferences</li>
                      <li>• Theme and display settings</li>
                      <li>• Notification preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Managing Cookies</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• You can control cookies through your browser settings</li>
                  <li>• Disabling cookies may affect Service functionality</li>
                  <li>• We respect Do Not Track signals</li>
                  <li>• Third-party cookies are subject to their own policies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section id="disclaimer" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Disclaimer</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">General Disclaimer</h3>
                <p className="text-gray-300 mb-2">
                  The information provided on bountyhub is for general informational purposes only. We make no representations or warranties about the accuracy, completeness, or reliability of any information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Financial Disclaimer</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• BBUX tokens are utility tokens, not investment vehicles</li>
                  <li>• Token values may fluctuate significantly</li>
                  <li>• We do not provide financial advice</li>
                  <li>• Users should conduct their own research</li>
                  <li>• Past performance does not guarantee future results</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Blockchain Disclaimer</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Blockchain transactions are irreversible</li>
                  <li>• We are not responsible for transaction failures</li>
                  <li>• Users are responsible for wallet security</li>
                  <li>• Network fees and delays may occur</li>
                  <li>• Regulatory changes may affect functionality</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Content Disclaimer</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• User-generated content reflects individual opinions</li>
                  <li>• We do not endorse user content</li>
                  <li>• Content may contain errors or inaccuracies</li>
                  <li>• Users should verify information independently</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Governance Terms */}
        <section id="governance" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Governance Terms</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Platform Governance</h3>
                <p className="text-gray-300 mb-2">
                  bountyhub operates as a decentralized platform with community governance mechanisms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Voting Rights</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• BBUX token holders can participate in governance</li>
                  <li>• Voting power is proportional to token holdings</li>
                  <li>• Minimum stake requirements apply</li>
                  <li>• Voting periods and quorum requirements vary</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Proposal Process</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Community members can submit proposals</li>
                  <li>• Proposals require community discussion</li>
                  <li>• Formal voting follows discussion period</li>
                  <li>• Successful proposals are implemented</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Emergency Powers</h3>
                <p className="text-gray-300 mb-2">
                  In emergency situations, the platform may implement temporary measures to ensure security and stability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Contact */}
        <section id="contact" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Legal Contact</h2>
          <div className="bg-neutral-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">General Inquiries</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Email: legal@bountyhub.tech</li>
                      <li>• Support: support@bountyhub.tech</li>
                      <li>• Business: business@bountyhub.tech</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-violet-400 mb-2">Legal Matters</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• DMCA: dmca@bountyhub.tech</li>
                      <li>• Privacy: privacy@bountyhub.tech</li>
                      <li>• Compliance: compliance@bountyhub.tech</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Response Times</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• General inquiries: 2-3 business days</li>
                  <li>• Legal matters: 5-7 business days</li>
                  <li>• Urgent issues: 24-48 hours</li>
                  <li>• Emergency situations: Immediate response</li>
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
              to="/docs/refund-system"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Refund System Guide</h3>
              <p className="text-gray-400 text-sm">Understanding the refund system</p>
            </Link>
            <a
              href="mailto:legal@bountyhub.tech"
              className="block p-6 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Contact Legal Team</h3>
              <p className="text-gray-400 text-sm">Get in touch with our legal team</p>
            </a>
          </div>
        </section>

        {/* Download PDF */}
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Download Legal Documents</h3>
          <p className="text-gray-400 mb-4">
            Get PDF versions of all legal documents for offline reading
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/api/docs/terms-of-service.pdf"
              className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Terms of Service
            </a>
            <a
              href="/api/docs/privacy-policy.pdf"
              className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Privacy Policy
            </a>
            <a
              href="/api/docs/cookie-policy.pdf"
              className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 