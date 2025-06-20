import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/node";
import { createDb } from "~/utils/db.server";
import { getUser } from "~/utils/auth.server";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // For now, we'll allow public access to terms of service
  // You can change this to requireUserId if you want it to be private
  return json({});
};

export default function TermsOfService() {
  return (
    <Layout showNav={false}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <div className="flex gap-3">
            <a
              href="/api/terms.pdf"
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>

        <div className="bg-white text-gray-900 rounded-lg shadow-lg p-8 print:shadow-none">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-3">
                  By accessing and using portal.ask ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="text-gray-700">
                  These Terms of Service ("Terms") govern your use of our decentralized platform for knowledge sharing, community building, and reputation-based interactions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
                <p className="text-gray-700 mb-3">
                  portal.ask is a decentralized platform that provides:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Knowledge sharing and Q&A functionality</li>
                  <li>Community building and interaction tools</li>
                  <li>Reputation and integrity scoring systems</li>
                  <li>Virtual wallet and token management</li>
                  <li>Bounty and reward mechanisms</li>
                  <li>Blockchain-based transaction processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts and Registration</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Account Creation</h3>
                <p className="text-gray-700 mb-3">
                  To access certain features of the Platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your account credentials secure</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Account Eligibility</h3>
                <p className="text-gray-700">
                  You must be at least 13 years old to create an account. By creating an account, you represent and warrant that you meet this age requirement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Conduct and Responsibilities</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 Acceptable Use</h3>
                <p className="text-gray-700 mb-3">
                  You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Attempt to gain unauthorized access to the Platform</li>
                  <li>Interfere with the Platform's operation or security</li>
                  <li>Use automated systems to access the Platform</li>
                  <li>Engage in spam or unsolicited communications</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Content Standards</h3>
                <p className="text-gray-700 mb-3">
                  All content you post must:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Be accurate and truthful</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not contain harmful, offensive, or inappropriate material</li>
                  <li>Comply with community guidelines</li>
                  <li>Not violate any third-party rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Virtual Currency and Transactions</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 PORTAL Tokens</h3>
                <p className="text-gray-700 mb-3">
                  The Platform uses PORTAL tokens as virtual currency for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Creating bounties and rewards</li>
                  <li>Community transactions</li>
                  <li>Platform governance</li>
                  <li>Reputation and integrity systems</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Transaction Terms</h3>
                <p className="text-gray-700 mb-3">
                  By using the Platform's transaction features, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Understand that transactions are irreversible</li>
                  <li>Accept responsibility for all transactions initiated from your account</li>
                  <li>Comply with applicable financial regulations</li>
                  <li>Not engage in fraudulent or manipulative trading</li>
                  <li>Pay any applicable fees or charges</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">5.3 No Financial Advice</h3>
                <p className="text-gray-700">
                  The Platform does not provide financial, investment, or legal advice. All transactions are at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property Rights</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">6.1 Platform Rights</h3>
                <p className="text-gray-700 mb-3">
                  The Platform and its original content, features, and functionality are owned by portal.ask and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>

                <h3 className="text-lg font-medium text-gray-900 mb-2">6.2 User Content</h3>
                <p className="text-gray-700 mb-3">
                  You retain ownership of content you post, but grant us a license to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Display and distribute your content on the Platform</li>
                  <li>Use your content for Platform improvement</li>
                  <li>Store and backup your content</li>
                  <li>Share your content as required by law</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">6.3 License Terms</h3>
                <p className="text-gray-700">
                  This license is worldwide, non-exclusive, royalty-free, and transferable. It terminates when you delete your content or account, except where your content has been shared with others.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy and Data Protection</h2>
                <p className="text-gray-700 mb-3">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                <p className="text-gray-700">
                  By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimers and Limitations</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">8.1 Service Availability</h3>
                <p className="text-gray-700 mb-3">
                  We strive to maintain Platform availability but do not guarantee uninterrupted access. The Platform may be temporarily unavailable due to maintenance, updates, or technical issues.
                </p>

                <h3 className="text-lg font-medium text-gray-900 mb-2">8.2 Content Accuracy</h3>
                <p className="text-gray-700 mb-3">
                  We do not guarantee the accuracy, completeness, or usefulness of any content on the Platform. Users are responsible for verifying information and making their own decisions.
                </p>

                <h3 className="text-lg font-medium text-gray-900 mb-2">8.3 Limitation of Liability</h3>
                <p className="text-gray-700 mb-3">
                  To the maximum extent permitted by law, portal.ask shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Loss of profits, data, or use</li>
                  <li>Business interruption</li>
                  <li>Personal injury or property damage</li>
                  <li>Emotional distress</li>
                  <li>Any other damages arising from your use of the Platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Indemnification</h2>
                <p className="text-gray-700 mb-3">
                  You agree to defend, indemnify, and hold harmless portal.ask and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your content posted on the Platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">10.1 Termination by You</h3>
                <p className="text-gray-700 mb-3">
                  You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Your account will be deactivated</li>
                  <li>Your public content may remain visible</li>
                  <li>Blockchain transactions cannot be reversed</li>
                  <li>Some data may be retained for legal compliance</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">10.2 Termination by Us</h3>
                <p className="text-gray-700">
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law and Disputes</h2>
                <h3 className="text-lg font-medium text-gray-900 mb-2">11.1 Governing Law</h3>
                <p className="text-gray-700 mb-3">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates, without regard to its conflict of law provisions.
                </p>

                <h3 className="text-lg font-medium text-gray-900 mb-2">11.2 Dispute Resolution</h3>
                <p className="text-gray-700 mb-3">
                  Any disputes arising from these Terms or your use of the Platform shall be resolved through:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Good faith negotiations between parties</li>
                  <li>Mediation if negotiations fail</li>
                  <li>Binding arbitration as a last resort</li>
                  <li>Court proceedings only if arbitration is not available</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
                <p className="text-gray-700 mb-3">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Posting updated Terms on the Platform</li>
                  <li>Sending email notifications to registered users</li>
                  <li>Displaying prominent notices on our website</li>
                </ul>
                <p className="text-gray-700">
                  Your continued use of the Platform after changes become effective constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Severability</h2>
                <p className="text-gray-700">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Entire Agreement</h2>
                <p className="text-gray-700">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and portal.ask regarding your use of the Platform and supersede all prior agreements and understandings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contact Information</h2>
                <p className="text-gray-700 mb-3">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> bountybucks524@gmail.com</p>
                  <p className="text-gray-700 mb-2"><strong>Platform:</strong> portal.ask</p>
                  <p className="text-gray-700">
                    We will respond to your inquiry within a reasonable timeframe.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 