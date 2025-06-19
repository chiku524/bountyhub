import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/Layout";
import { requireUserId } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // For now, we'll allow public access to privacy policy
  // You can change this to requireUserId if you want it to be private
  return json({});
};

export default function PrivacyPolicy() {
  return (
    <Layout showNav={false}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <div className="flex gap-3">
            <a
              href="/api/privacy.pdf"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                <p className="text-gray-700 mb-3">
                  Welcome to portal.ask ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized platform for knowledge sharing and community building.
                </p>
                <p className="text-gray-700">
                  By using portal.ask, you consent to the data practices described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.1 Personal Information</h3>
                <p className="text-gray-700 mb-3">
                  We may collect the following personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Email address</li>
                  <li>Username</li>
                  <li>Profile information (bio, location, website)</li>
                  <li>Social media links</li>
                  <li>Profile picture</li>
                  <li>Solana wallet addresses</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">2.2 Usage Information</h3>
                <p className="text-gray-700 mb-3">
                  We automatically collect certain information about your use of our platform:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Posts, comments, and interactions</li>
                  <li>Voting and reputation data</li>
                  <li>Transaction history</li>
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-2">2.3 Blockchain Data</h3>
                <p className="text-gray-700">
                  As a decentralized platform, some information may be stored on the Solana blockchain, which is publicly accessible and immutable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-3">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Provide and maintain our platform services</li>
                  <li>Process transactions and manage virtual wallets</li>
                  <li>Calculate and display reputation scores</li>
                  <li>Facilitate community interactions</li>
                  <li>Send important notifications and updates</li>
                  <li>Improve our platform and user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-3">
                  We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Public Content:</strong> Posts, comments, and public profile information are visible to all users</li>
                  <li><strong>Blockchain Transactions:</strong> Transaction data is publicly visible on the Solana blockchain</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in platform operations</li>
                  <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
                <p className="text-gray-700 mb-3">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Encryption of sensitive data</li>
                  <li>Secure authentication systems</li>
                  <li>Regular security audits</li>
                  <li>Access controls and monitoring</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
                <p className="text-gray-700">
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-3">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Update or correct your information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
                </ul>
                <p className="text-gray-700">
                  Note: Some data stored on the blockchain may be immutable and cannot be deleted.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
                <p className="text-gray-700 mb-3">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Maintain your session and preferences</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content</li>
                  <li>Improve user experience</li>
                </ul>
                <p className="text-gray-700">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Services</h2>
                <p className="text-gray-700 mb-3">
                  Our platform may integrate with third-party services:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Solana blockchain network</li>
                  <li>Cloudinary for media storage</li>
                  <li>Authentication providers</li>
                  <li>Analytics services</li>
                </ul>
                <p className="text-gray-700">
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
                <p className="text-gray-700">
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. International Data Transfers</h2>
                <p className="text-gray-700">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
                <p className="text-gray-700 mb-3">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Posting the updated policy on our platform</li>
                  <li>Sending email notifications to registered users</li>
                  <li>Displaying prominent notices on our website</li>
                </ul>
                <p className="text-gray-700">
                  Your continued use of the platform after changes become effective constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
                <p className="text-gray-700 mb-3">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> bountybucks524@gmail.com</p>
                  <p className="text-gray-700 mb-2"><strong>Platform:</strong> portal.ask</p>
                  <p className="text-gray-700">
                    We will respond to your inquiry within a reasonable timeframe.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
                <p className="text-gray-700">
                  This Privacy Policy is governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates. Any disputes arising from this policy will be resolved in the appropriate courts of that jurisdiction.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 