import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createSimplePDF } from "~/utils/pdf.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const termsOfServiceContent = `
      <div class="section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using portal.ask ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        <p>These Terms of Service ("Terms") govern your use of our decentralized platform for knowledge sharing, community building, and reputation-based interactions.</p>
      </div>

      <div class="section">
        <h2>2. Description of Service</h2>
        <p>portal.ask is a decentralized platform that provides:</p>
        <ul>
          <li>Knowledge sharing and Q&A functionality</li>
          <li>Community building and interaction tools</li>
          <li>Reputation and integrity scoring systems</li>
          <li>Virtual wallet and token management</li>
          <li>Bounty and reward mechanisms</li>
          <li>Blockchain-based transaction processing</li>
        </ul>
      </div>

      <div class="section">
        <h2>3. User Accounts and Registration</h2>
        
        <h3>3.1 Account Creation</h3>
        <p>To access certain features of the Platform, you must create an account. You agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your account information</li>
          <li>Keep your account credentials secure</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>

        <h3>3.2 Account Eligibility</h3>
        <p>You must be at least 13 years old to create an account. By creating an account, you represent and warrant that you meet this age requirement.</p>
      </div>

      <div class="section">
        <h2>4. User Conduct and Responsibilities</h2>
        
        <h3>4.1 Acceptable Use</h3>
        <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Post false, misleading, or fraudulent content</li>
          <li>Attempt to gain unauthorized access to the Platform</li>
          <li>Interfere with the Platform's operation or security</li>
          <li>Use automated systems to access the Platform</li>
          <li>Engage in spam or unsolicited communications</li>
        </ul>

        <h3>4.2 Content Standards</h3>
        <p>All content you post must:</p>
        <ul>
          <li>Be accurate and truthful</li>
          <li>Respect intellectual property rights</li>
          <li>Not contain harmful, offensive, or inappropriate material</li>
          <li>Comply with community guidelines</li>
          <li>Not violate any third-party rights</li>
        </ul>
      </div>

      <div class="section">
        <h2>5. Virtual Currency and Transactions</h2>
        
        <h3>5.1 PORTAL Tokens</h3>
        <p>The Platform uses PORTAL tokens as virtual currency for:</p>
        <ul>
          <li>Creating bounties and rewards</li>
          <li>Community transactions</li>
          <li>Platform governance</li>
          <li>Reputation and integrity systems</li>
        </ul>

        <h3>5.2 Transaction Terms</h3>
        <p>By using the Platform's transaction features, you agree to:</p>
        <ul>
          <li>Understand that transactions are irreversible</li>
          <li>Accept responsibility for all transactions initiated from your account</li>
          <li>Comply with applicable financial regulations</li>
          <li>Not engage in fraudulent or manipulative trading</li>
          <li>Pay any applicable fees or charges</li>
        </ul>

        <h3>5.3 No Financial Advice</h3>
        <p>The Platform does not provide financial, investment, or legal advice. All transactions are at your own risk.</p>
      </div>

      <div class="section">
        <h2>6. Intellectual Property Rights</h2>
        
        <h3>6.1 Platform Rights</h3>
        <p>The Platform and its original content, features, and functionality are owned by portal.ask and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

        <h3>6.2 User Content</h3>
        <p>You retain ownership of content you post, but grant us a license to:</p>
        <ul>
          <li>Display and distribute your content on the Platform</li>
          <li>Use your content for Platform improvement</li>
          <li>Store and backup your content</li>
          <li>Share your content as required by law</li>
        </ul>

        <h3>6.3 License Terms</h3>
        <p>This license is worldwide, non-exclusive, royalty-free, and transferable. It terminates when you delete your content or account, except where your content has been shared with others.</p>
      </div>

      <div class="section">
        <h2>7. Privacy and Data Protection</h2>
        <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
        <p>By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.</p>
      </div>

      <div class="section">
        <h2>8. Disclaimers and Limitations</h2>
        
        <h3>8.1 Service Availability</h3>
        <p>We strive to maintain Platform availability but do not guarantee uninterrupted access. The Platform may be temporarily unavailable due to maintenance, updates, or technical issues.</p>

        <h3>8.2 Content Accuracy</h3>
        <p>We do not guarantee the accuracy, completeness, or usefulness of any content on the Platform. Users are responsible for verifying information and making their own decisions.</p>

        <h3>8.3 Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, portal.ask shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
        <ul>
          <li>Loss of profits, data, or use</li>
          <li>Business interruption</li>
          <li>Personal injury or property damage</li>
          <li>Emotional distress</li>
          <li>Any other damages arising from your use of the Platform</li>
        </ul>
      </div>

      <div class="section">
        <h2>9. Indemnification</h2>
        <p>You agree to defend, indemnify, and hold harmless portal.ask and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:</p>
        <ul>
          <li>Your use of the Platform</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Your content posted on the Platform</li>
        </ul>
      </div>

      <div class="section">
        <h2>10. Termination</h2>
        
        <h3>10.1 Termination by You</h3>
        <p>You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination:</p>
        <ul>
          <li>Your account will be deactivated</li>
          <li>Your public content may remain visible</li>
          <li>Blockchain transactions cannot be reversed</li>
          <li>Some data may be retained for legal compliance</li>
        </ul>

        <h3>10.2 Termination by Us</h3>
        <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Platform.</p>
      </div>

      <div class="section">
        <h2>11. Governing Law and Disputes</h2>
        
        <h3>11.1 Governing Law</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates, without regard to its conflict of law provisions.</p>

        <h3>11.2 Dispute Resolution</h3>
        <p>Any disputes arising from these Terms or your use of the Platform shall be resolved through:</p>
        <ul>
          <li>Good faith negotiations between parties</li>
          <li>Mediation if negotiations fail</li>
          <li>Binding arbitration as a last resort</li>
          <li>Court proceedings only if arbitration is not available</li>
        </ul>
      </div>

      <div class="section">
        <h2>12. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes by:</p>
        <ul>
          <li>Posting updated Terms on the Platform</li>
          <li>Sending email notifications to registered users</li>
          <li>Displaying prominent notices on our website</li>
        </ul>
        <p>Your continued use of the Platform after changes become effective constitutes acceptance of the updated Terms.</p>
      </div>

      <div class="section">
        <h2>13. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.</p>
      </div>

      <div class="section">
        <h2>14. Entire Agreement</h2>
        <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and portal.ask regarding your use of the Platform and supersede all prior agreements and understandings.</p>
      </div>

      <div class="section">
        <h2>15. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> bountybucks524@gmail.com</p>
          <p><strong>Platform:</strong> portal.ask</p>
          <p>We will respond to your inquiry within a reasonable timeframe.</p>
        </div>
      </div>
    `;

    const pdfBuffer = await createSimplePDF(
      "Terms of Service - portal.ask",
      termsOfServiceContent,
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
        'Content-Disposition': 'attachment; filename="portal-ask-terms-of-service.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating terms of service PDF:', error);
    return json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}; 