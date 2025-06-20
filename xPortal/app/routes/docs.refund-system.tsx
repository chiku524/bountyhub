import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout";
import { FiArrowLeft, FiExternalLink, FiClock, FiUsers, FiShield, FiAward, FiAlertTriangle } from "react-icons/fi";

interface LoaderData {
  title: string;
  description: string;
}

export const loader = async (): Promise<Response> => {
  return json<LoaderData>({
    title: "Refund System Documentation",
    description: "Understanding the refund system and dispute resolution"
  });
};

export default function RefundSystemDocsPage() {
  const data = useLoaderData<typeof loader>();
  const { title, description } = data as LoaderData;

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
        <div className="prose prose-invert prose-violet max-w-none">
          <div className="bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8">
            <h2>Overview</h2>
            <p>
              The refund system in portal.ask is designed to prevent abuse while ensuring fair treatment for all users. 
              It combines time-based restrictions with community governance to create a balanced and transparent process 
              for handling bounty refunds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <div className="bg-violet-500/10 p-6 rounded-lg border border-violet-500/30">
                <div className="flex items-center mb-3">
                  <FiClock className="w-6 h-6 text-violet-400 mr-3" />
                  <h3 className="text-violet-300 font-semibold">Time-Based Restrictions</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Users must wait 24 hours after receiving the first answer before requesting a refund. 
                  This prevents users from getting free help and then immediately refunding.
                </p>
              </div>

              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <div className="flex items-center mb-3">
                  <FiUsers className="w-6 h-6 text-green-400 mr-3" />
                  <h3 className="text-green-300 font-semibold">Community Governance</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  All refund requests require community approval through voting. 
                  Community members earn rewards for participating in governance decisions.
                </p>
              </div>
            </div>

            <h2>How the Refund System Works</h2>

            <h3>1. Creating a Refund Request</h3>
            <div className="bg-neutral-700/40 p-6 rounded-lg mb-6">
              <h4>Prerequisites</h4>
              <ul>
                <li>You must be the original bounty creator</li>
                <li>Bounty must be in ACTIVE status</li>
                <li>24 hours must have passed since the first answer (if any answers exist)</li>
                <li>No existing refund request for this bounty</li>
              </ul>

              <h4>Process</h4>
              <ol>
                <li>Navigate to your bounty post</li>
                <li>Click "Request Refund" button</li>
                <li>Provide a detailed reason (minimum 10 characters)</li>
                <li>Submit the request</li>
              </ol>
            </div>

            <h2>Community Voting Process</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Community Voting Process</h3>
              <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <p className="text-gray-300 mb-3">
                  Refund requests are decided by community vote to ensure fairness and prevent abuse.
                </p>
                
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Voting Requirements</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• <strong>50+ reputation points</strong> and <strong>7+ days account age</strong></li>
                    <li>• Must have <strong>previously engaged</strong> with the post (voted on post/answers)</li>
                    <li>• <strong>Minimum 20 characters</strong> of reasoning required for each vote</li>
                    <li>• <strong>5-minute minimum review time</strong> after refund request creation</li>
                    <li>• <strong>Maximum 10 votes per 24 hours</strong> to prevent spam</li>
                    <li>• Cannot vote on your own refund request</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Voting Process</h4>
                  <ol className="text-gray-300 text-sm space-y-2">
                    <li><strong>Review:</strong> Read the refund reason and examine the post/answers</li>
                    <li><strong>Vote:</strong> Choose approve or reject with detailed reasoning</li>
                    <li><strong>Wait:</strong> Decision made when minimum votes reached or time expires</li>
                    <li><strong>Reward:</strong> Tokens distributed when final decision is reached</li>
                  </ol>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Anti-Gaming Measures</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    To prevent dishonest voting and ensure quality decisions:
                  </p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• <strong>Reputation thresholds</strong> ensure only established users vote</li>
                    <li>• <strong>Engagement requirements</strong> ensure voters understand the context</li>
                    <li>• <strong>Mandatory reasoning</strong> forces thoughtful consideration</li>
                    <li>• <strong>Time delays</strong> prevent impulsive voting</li>
                    <li>• <strong>Rate limiting</strong> prevents vote farming</li>
                    <li>• <strong>Delayed rewards</strong> align incentives with quality decisions</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Decision Criteria</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• <strong>Approved:</strong> 60%+ positive votes with minimum vote count</li>
                    <li>• <strong>Rejected:</strong> Less than 60% positive votes</li>
                    <li>• <strong>Expired:</strong> Not enough votes within 48 hours</li>
                    <li>• <strong>Required votes:</strong> 3 (no answers) or 7 (with answers)</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3>3. Reward Distribution</h3>
            <div className="bg-yellow-500/10 p-6 rounded-lg mb-6 border border-yellow-500/30">
              <h4>Governance Rewards</h4>
              <ul>
                <li><strong>Token Rewards</strong>: 5% of bounty amount distributed among voters when final decision is reached</li>
                <li><strong>Reputation Points</strong>: +5 points for each governance participation (awarded immediately)</li>
                <li><strong>Distribution</strong>: Equal share among all voters who participated</li>
                <li><strong>Timing</strong>: Rewards are paid when refund request is approved, rejected, or expires</li>
                <li><strong>Example</strong>: 1 SOL bounty with 5 voters = 0.01 SOL per voter (paid at decision time)</li>
              </ul>
            </div>

            <h3>4. Refund Processing</h3>
            <div className="bg-neutral-700/40 p-6 rounded-lg mb-6">
              <h4>If Approved</h4>
              <ul>
                <li><strong>Base Refund</strong>: Full bounty amount minus penalties</li>
                <li><strong>Penalty Calculation</strong>: 20% penalty if helpful answers exist (2+ votes)</li>
                <li><strong>Penalty Distribution</strong>: Penalty amount distributed to helpful answer authors</li>
                <li><strong>Integrity Impact</strong>: -1.0 integrity score if refunding with helpful answers</li>
              </ul>

              <h4>If Rejected</h4>
              <ul>
                <li>Bounty remains active for claiming</li>
                <li>No refund is processed</li>
                <li>Original bounty creator can still accept answers</li>
              </ul>
            </div>

            <h2>Anti-Abuse Measures</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <div className="flex items-center mb-3">
                  <FiAlertTriangle className="w-6 h-6 text-red-400 mr-3" />
                  <h3 className="text-red-300 font-semibold">Time Lock</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  24-hour waiting period prevents users from getting free help and immediately refunding.
                </p>
              </div>

              <div className="bg-orange-500/10 p-6 rounded-lg border border-orange-500/30">
                <div className="flex items-center mb-3">
                  <FiShield className="w-6 h-6 text-orange-400 mr-3" />
                  <h3 className="text-orange-300 font-semibold">Penalty System</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  20% penalty for refunding with helpful answers, distributed to answer authors.
                </p>
              </div>

              <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/30">
                <div className="flex items-center mb-3">
                  <FiAward className="w-6 h-6 text-blue-400 mr-3" />
                  <h3 className="text-blue-300 font-semibold">Integrity Impact</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Refunding with helpful answers reduces your integrity score, affecting community trust.
                </p>
              </div>
            </div>

            <h2>Best Practices</h2>

            <h3>For Bounty Creators</h3>
            <ul>
              <li><strong>Be Specific</strong>: Provide clear, detailed questions to get better answers</li>
              <li><strong>Set Appropriate Bounties</strong>: Offer fair rewards for the complexity of your question</li>
              <li><strong>Engage with Answers</strong>: Provide feedback and ask follow-up questions</li>
              <li><strong>Only Refund When Necessary</strong>: Use refunds for legitimate reasons, not to avoid payment</li>
            </ul>

            <h3>For Community Voters</h3>
            <ul>
              <li><strong>Review Thoroughly</strong>: Examine the bounty, answers, and refund reason carefully</li>
              <li><strong>Consider Context</strong>: Look at the quality and helpfulness of existing answers</li>
              <li><strong>Vote Fairly</strong>: Base your vote on the merits, not personal bias</li>
              <li><strong>Provide Reasoning</strong>: Explain your vote to help others understand your perspective</li>
            </ul>

            <h3>For Answer Authors</h3>
            <ul>
              <li><strong>Provide Quality Answers</strong>: Give detailed, helpful responses to earn votes</li>
              <li><strong>Engage with the Community</strong>: Vote on other content to build reputation</li>
              <li><strong>Understand the System</strong>: Know that helpful answers are protected from unfair refunds</li>
            </ul>

            <h2>Frequently Asked Questions</h2>

            <h3>Q: Can I refund a bounty immediately if no one has answered?</h3>
            <p>
              <strong>A:</strong> Yes! If no answers have been provided, you can request a refund immediately without waiting for the 24-hour period.
            </p>

            <h3>Q: What happens if my refund request expires without enough votes?</h3>
            <p>
              <strong>A:</strong> If the 48-hour voting period expires without reaching the minimum vote threshold, the request is marked as "EXPIRED" and no refund is processed. The bounty remains active.
            </p>

            <h3>Q: How are governance rewards calculated?</h3>
            <p>
              <strong>A:</strong> The 5% governance fee is divided equally among all voters when the final decision is reached. For example, if a 1 SOL bounty has 5 voters, each voter receives 0.01 SOL (0.05 ÷ 5) when the refund request is approved, rejected, or expires.
            </p>

            <h3>Q: When do I receive my governance rewards?</h3>
            <p>
              <strong>A:</strong> Governance rewards are paid when the refund request reaches a final decision (approved, rejected, or expired). Reputation points are awarded immediately when you vote, but token rewards are distributed at the end of the voting period.
            </p>

            <h3>Q: Can I vote on my own refund request?</h3>
            <p>
              <strong>A:</strong> No, you cannot vote on your own refund request. This prevents self-voting and ensures impartial community decisions.
            </p>

            <h3>Q: What constitutes a "helpful answer" for penalty calculation?</h3>
            <p>
              <strong>A:</strong> An answer is considered helpful if it has received 2 or more votes. These answers are protected by the penalty system.
            </p>

            <h2>Getting Help</h2>

            <p>
              If you have questions about the refund system or need assistance with a specific case, 
              you can reach out to the community through our Discord server or contact support directly.
            </p>

            <div className="mt-8 p-6 bg-violet-500/10 rounded-lg border border-violet-500/30">
              <h3 className="text-violet-300 mb-4">Community Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://discord.gg/zvB9gwhq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4 mr-2" />
                  Join Discord Community
                </a>
                <a
                  href="/refund-requests"
                  className="inline-flex items-center px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <FiUsers className="w-4 h-4 mr-2" />
                  View Active Refund Requests
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 