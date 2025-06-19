import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createSimplePDF } from "~/utils/pdf.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const privacyPolicyContent = `
      <div class="section">
        <h2>1. Introduction</h2>
        <p>Welcome to portal.ask ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized platform for knowledge sharing and community building.</p>
        <p>By using portal.ask, you consent to the data practices described in this policy.</p>
      </div>

      <div class="section">
        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Personal Information</h3>
        <p>We may collect the following personal information:</p>
        <ul>
          <li>Email address</li>
          <li>Username</li>
          <li>Profile information (bio, location, website)</li>
          <li>Social media links</li>
          <li>Profile picture</li>
          <li>Solana wallet addresses</li>
        </ul>

        <h3>2.2 Usage Information</h3>
        <p>We automatically collect certain information about your use of our platform:</p>
        <ul>
          <li>Posts, comments, and interactions</li>
          <li>Voting and reputation data</li>
          <li>Transaction history</li>
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
        </ul>

        <h3>2.3 Blockchain Data</h3>
        <p>As a decentralized platform, some information may be stored on the Solana blockchain, which is publicly accessible and immutable.</p>
      </div>

      <div class="section">
        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li>Provide and maintain our platform services</li>
          <li>Process transactions and manage virtual wallets</li>
          <li>Calculate and display reputation scores</li>
          <li>Facilitate community interactions</li>
          <li>Send important notifications and updates</li>
          <li>Improve our platform and user experience</li>
          <li>Comply with legal obligations</li>
          <li>Prevent fraud and abuse</li>
        </ul>
      </div>

      <div class="section">
        <h2>4. Information Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Public Content:</strong> Posts, comments, and public profile information are visible to all users</li>
          <li><strong>Blockchain Transactions:</strong> Transaction data is publicly visible on the Solana blockchain</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in platform operations</li>
          <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
        </ul>
      </div>

      <div class="section">
        <h2>5. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information:</p>
        <ul>
          <li>Encryption of sensitive data</li>
          <li>Secure authentication systems</li>
          <li>Regular security audits</li>
          <li>Access controls and monitoring</li>
          <li>Secure hosting infrastructure</li>
        </ul>
        <p>However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
      </div>

      <div class="section">
        <h2>6. Your Rights and Choices</h2>
        <p>You have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request access to your personal information</li>
          <li><strong>Correction:</strong> Update or correct your information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
          <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
        </ul>
        <p>Note: Some data stored on the blockchain may be immutable and cannot be deleted.</p>
      </div>

      <div class="section">
        <h2>7. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Maintain your session and preferences</li>
          <li>Analyze platform usage and performance</li>
          <li>Provide personalized content</li>
          <li>Improve user experience</li>
        </ul>
        <p>You can control cookie settings through your browser preferences.</p>
      </div>

      <div class="section">
        <h2>8. Third-Party Services</h2>
        <p>Our platform may integrate with third-party services:</p>
        <ul>
          <li>Solana blockchain network</li>
          <li>Cloudinary for media storage</li>
          <li>Authentication providers</li>
          <li>Analytics services</li>
        </ul>
        <p>These services have their own privacy policies, and we encourage you to review them.</p>
      </div>

      <div class="section">
        <h2>9. Children's Privacy</h2>
        <p>Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
      </div>

      <div class="section">
        <h2>10. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.</p>
      </div>

      <div class="section">
        <h2>11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
        <ul>
          <li>Posting the updated policy on our platform</li>
          <li>Sending email notifications to registered users</li>
          <li>Displaying prominent notices on our website</li>
        </ul>
        <p>Your continued use of the platform after changes become effective constitutes acceptance of the updated policy.</p>
      </div>

      <div class="section">
        <h2>12. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> bountybucks524@gmail.com</p>
          <p><strong>Platform:</strong> portal.ask</p>
          <p>We will respond to your inquiry within a reasonable timeframe.</p>
        </div>
      </div>

      <div class="section">
        <h2>13. Governing Law</h2>
        <p>This Privacy Policy is governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates. Any disputes arising from this policy will be resolved in the appropriate courts of that jurisdiction.</p>
      </div>
    `;

    const pdfBuffer = await createSimplePDF(
      "Privacy Policy - portal.ask",
      privacyPolicyContent,
      {
        format: 'A4',
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        }
      }
    );

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="portal-ask-privacy-policy.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating privacy policy PDF:', error);
    return json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}; 