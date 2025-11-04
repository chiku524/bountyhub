import { Link } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiUser, FiDollarSign, FiMessageSquare, FiStar, FiMessageCircle, FiImage } from 'react-icons/fi'

export default function UserGuide() {
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
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">User Guide</h1>
          <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 text-lg">
            Step-by-step guide for using all platform features and getting the most out of bountyhub
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-600 dark:text-gray-300">
            <li><a href="#getting-started" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Getting Started</a></li>
            <li><a href="#account-setup" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Account Setup</a></li>
            <li><a href="#virtual-tokens" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Virtual Token System</a></li>
            <li><a href="#asking-questions" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Asking Questions</a></li>
            <li><a href="#answering-questions" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Answering Questions</a></li>
            <li><a href="#bounty-system" className="text-violet-400 hover:text-violet-300">Bounty System</a></li>
            <li><a href="#global-chat" className="text-violet-400 hover:text-violet-300">Global Chat</a></li>
            <li><a href="#refund-system" className="text-violet-400 hover:text-violet-300">Refund Request System</a></li>
            <li><a href="#reputation-system" className="text-violet-400 hover:text-violet-300">Reputation System</a></li>
            <li><a href="#governance" className="text-violet-400 hover:text-violet-300">Governance & Staking</a></li>
            <li><a href="#notification-system" className="text-violet-400 hover:text-violet-300">Notification System</a></li>
            <li><a href="#best-practices" className="text-violet-400 hover:text-violet-300">Best Practices</a></li>
            <li><a href="#troubleshooting" className="text-violet-400 hover:text-violet-300">Troubleshooting</a></li>
          </ul>
        </div>

        {/* Getting Started */}
        <section id="getting-started" className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Getting Started</h2>
          <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Welcome to bountyhub</h3>
            <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 mb-4">
              bountyhub is a decentralized Q&A platform where you can earn virtual BBUX tokens for sharing knowledge 
              and helping others. This guide will walk you through everything you need to know to get started.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <FiUser className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                <h4 className="text-neutral-900 dark:text-white font-semibold">Create Account</h4>
                <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 text-sm">Sign up and verify your account</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <FiDollarSign className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                <h4 className="text-neutral-900 dark:text-white font-semibold">Virtual Wallet</h4>
                <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 text-sm">Start earning BBUX tokens</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <FiMessageSquare className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                <h4 className="text-neutral-900 dark:text-white font-semibold">Start Contributing</h4>
                <p className="text-neutral-600 dark:text-neutral-600 dark:text-gray-400 text-sm">Ask questions and provide answers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Setup */}
        <section id="account-setup" className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Account Setup</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">Creating Your Account</h3>
              <ol className="text-neutral-600 dark:text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Visit the bountyhub homepage and click "Sign Up"</li>
                <li>2. Enter your desired username, email, and password</li>
                <li>3. Verify your email address</li>
                <li>4. Complete your profile with a bio and profile picture</li>
                <li>5. Your virtual BBUX wallet is automatically created</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Virtual Wallet Setup</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Every user automatically gets a virtual BBUX wallet when they create an account. No external wallet setup required!
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Virtual BBUX tokens with unlimited supply</li>
                <li>• Earn tokens through quality contributions</li>
                <li>• Spend tokens on bounties and governance</li>
                <li>• Transparent transaction history</li>
                <li>• No external wallet required for basic usage</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Profile Customization</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Customize your profile to build credibility and connect with the community.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Add a professional profile picture</li>
                <li>• Write a compelling bio highlighting your expertise</li>
                <li>• Add relevant tags for your areas of knowledge</li>
                <li>• Link to your social media or portfolio</li>
                <li>• Set your preferred notification settings</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Virtual Token System */}
        <section id="virtual-tokens" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Virtual Token System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Understanding BBUX Tokens</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                BBUX tokens are virtual platform currency that you earn through various activities and can spend 
                on bounties and governance participation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">How to Earn BBUX</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Provide quality answers to bountied questions</li>
                    <li>• Participate in governance voting</li>
                    <li>• Vote on refund requests</li>
                    <li>• Stake tokens for daily rewards</li>
                    <li>• Platform activity bonuses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">How to Spend BBUX</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Create bounties for questions</li>
                    <li>• Stake for governance participation</li>
                    <li>• Platform fee payments</li>
                    <li>• Community treasury funding</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Dynamic Reward System</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The platform features a dynamic reward system that adjusts based on platform activity and your participation.
              </p>
              <div className="bg-neutral-700 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-violet-400 mb-2">Staking Rewards</h4>
                <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                  <li>• <strong>Base Rate:</strong> 0.05% daily (18.25% APY)</li>
                  <li>• <strong>Activity Bonus:</strong> +0.02% for high platform volume</li>
                  <li>• <strong>Treasury Bonus:</strong> +0.01% when treasury is healthy</li>
                  <li>• <strong>Governance Bonus:</strong> +0.02% for active governance participation</li>
                  <li>• <strong>Maximum Rate:</strong> 0.12% daily (43.8% APY)</li>
                </ul>
              </div>
              <p className="text-neutral-600 dark:text-gray-300 text-sm">
                Your personalized reward rate is calculated based on platform metrics and your governance participation level.
              </p>
            </div>
          </div>
        </section>

        {/* Asking Questions */}
        <section id="asking-questions" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Asking Questions</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Creating a Good Question</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Well-crafted questions are more likely to receive quality answers and attract bounties.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Do's</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Be specific and clear</li>
                    <li>• Provide context and background</li>
                    <li>• Include relevant code or examples</li>
                    <li>• Use appropriate tags</li>
                    <li>• Set a reasonable bounty amount</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Don'ts</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Ask vague or overly broad questions</li>
                    <li>• Post homework or assignment questions</li>
                    <li>• Ask for opinions without context</li>
                    <li>• Use inappropriate or offensive language</li>
                    <li>• Set unrealistic bounty amounts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Adding Bounties</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Bounties incentivize quality answers and help you get responses faster.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. When creating a question, check "Add Bounty"</li>
                <li>2. Enter the amount of BBUX tokens you want to offer</li>
                <li>3. Set an expiration date for the bounty</li>
                <li>4. Ensure you have sufficient BBUX balance in your wallet</li>
                <li>5. The bounty will be locked until you accept an answer</li>
              </ol>
              <div className="mt-4 p-4 bg-violet-900/20 border border-violet-500/30 rounded-lg">
                <h4 className="text-violet-400 font-semibold mb-2">💡 Bounty Tips</h4>
                <ul className="text-neutral-600 dark:text-gray-300 text-sm space-y-1">
                  <li>• Higher bounties attract more attention</li>
                  <li>• Complex questions may need higher bounties</li>
                  <li>• Set reasonable expiration dates (7-30 days)</li>
                  <li>• You can increase bounties after posting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Answering Questions */}
        <section id="answering-questions" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Answering Questions</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Writing Quality Answers</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Quality answers are more likely to be accepted and earn you BBUX tokens.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Answer Structure</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Start with a clear, concise response</li>
                    <li>• Provide step-by-step explanations</li>
                    <li>• Include relevant code examples</li>
                    <li>• Add supporting references</li>
                    <li>• End with a summary or conclusion</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Quality Indicators</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Accurate and up-to-date information</li>
                    <li>• Well-formatted and readable</li>
                    <li>• Addresses the question completely</li>
                    <li>• Provides additional value</li>
                    <li>• Professional and respectful tone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Answering Process</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Browse questions in your areas of expertise</li>
                <li>2. Read the question carefully and understand the requirements</li>
                <li>3. Research if needed to provide accurate information</li>
                <li>4. Write a comprehensive, well-structured answer</li>
                <li>5. Review and edit your answer before submitting</li>
                <li>6. Monitor for feedback and questions from the asker</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Bounty System */}
        <section id="bounty-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Bounty System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">How Bounties Work</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The bounty system incentivizes quality answers by offering BBUX tokens as rewards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiDollarSign className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Set Bounty</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Attach BBUX tokens to your question</p>
                </div>
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiMessageSquare className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Get Answers</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Receive quality responses</p>
                </div>
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiStar className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Reward Winner</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Automatically pay the best answer</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Bounty Lifecycle</h3>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. <strong>Creation:</strong> User creates question with bounty</li>
                <li>2. <strong>Locking:</strong> BBUX tokens are locked in smart contract</li>
                <li>3. <strong>Answering:</strong> Community provides answers</li>
                <li>4. <strong>Selection:</strong> Question asker selects best answer</li>
                <li>5. <strong>Distribution:</strong> Bounty is automatically paid to winner</li>
                <li>6. <strong>Completion:</strong> Question is marked as resolved</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Global Chat */}
        <section id="global-chat" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Global Chat</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Community Chat</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Connect with the bountyhub community in real-time through our global chat feature. Share ideas, 
                ask quick questions, and build relationships with other users.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiMessageSquare className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Global Chat</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Community-wide conversation</p>
                </div>
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiMessageCircle className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Real-Time</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Instant messaging</p>
                </div>
                <div className="text-center p-4 bg-neutral-700 rounded-lg">
                  <FiImage className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">GIFs & Emojis</h4>
                  <p className="text-neutral-600 dark:text-gray-400 text-sm">Express yourself</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Accessing the Chat</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The global chat is easily accessible from any page on the platform.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. <strong>Chat Button:</strong> Look for the message icon in the bottom-right corner of any page</li>
                <li>2. <strong>Auto-Join:</strong> You'll automatically join the global chat room when you click the button</li>
                <li>3. <strong>Persistent:</strong> The chat sidebar stays open as you navigate between pages</li>
                <li>4. <strong>Close:</strong> Click the X button to minimize the chat sidebar</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Chat Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Text Messages</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Type and send text messages</li>
                    <li>• Real-time message delivery</li>
                    <li>• Message history preserved</li>
                    <li>• Username display for each message</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Rich Content</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Emoji picker with popular emojis</li>
                    <li>• GIF search powered by GIPHY</li>
                    <li>• Send GIFs to express reactions</li>
                    <li>• Visual message content</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Using GIFs and Emojis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Emoji Picker</h4>
                  <ol className="text-neutral-600 dark:text-gray-300 space-y-1">
                    <li>1. Click the smiley face icon in the chat input</li>
                    <li>2. Browse through the emoji grid</li>
                    <li>3. Click any emoji to add it to your message</li>
                    <li>4. Continue typing or send the message</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">GIF Search</h4>
                  <ol className="text-neutral-600 dark:text-gray-300 space-y-1">
                    <li>1. Click the image icon in the chat input</li>
                    <li>2. Type a search term (e.g., "cat", "hello", "congratulations")</li>
                    <li>3. Browse through the GIF results</li>
                    <li>4. Click any GIF to send it immediately</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Chat Etiquette</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Do's</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Be respectful and friendly</li>
                    <li>• Ask questions about the platform</li>
                    <li>• Share relevant knowledge and tips</li>
                    <li>• Use GIFs and emojis appropriately</li>
                    <li>• Help new users get started</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Don'ts</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Spam or send excessive messages</li>
                    <li>• Use inappropriate language or content</li>
                    <li>• Share personal information</li>
                    <li>• Promote external services aggressively</li>
                    <li>• Engage in arguments or conflicts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Chat Tips</h3>
              <div className="space-y-4">
                <div className="p-4 bg-violet-900/20 border border-violet-500/30 rounded-lg">
                  <h4 className="text-violet-400 font-semibold mb-2">💡 Pro Tips</h4>
                  <ul className="text-neutral-600 dark:text-gray-300 text-sm space-y-1">
                    <li>• Use the chat to ask quick questions before creating formal posts</li>
                    <li>• Share interesting bounty questions you've seen</li>
                    <li>• Celebrate when you win bounties or reach reputation milestones</li>
                    <li>• Use GIFs to react to others' messages and make conversations more engaging</li>
                    <li>• The chat is perfect for getting feedback on question ideas</li>
                  </ul>
                </div>
                <div className="p-4 bg-neutral-700 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">�� Technical Notes</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 text-sm space-y-1">
                    <li>• Messages are stored and persist between sessions</li>
                    <li>• GIF search is powered by GIPHY API</li>
                    <li>• Chat works on all devices and screen sizes</li>
                    <li>• You can minimize the chat to focus on other tasks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Refund System */}
        <section id="refund-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Refund Request System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Requesting a Refund</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                If you're not satisfied with a bounty or answer, you can request a refund.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Navigate to the question page</li>
                <li>2. Click "Request Refund"</li>
                <li>3. Provide a clear and concise reason for the refund request</li>
                <li>4. Wait for the community to review and vote on the request</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Refund Process</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The refund process involves a community vote to determine the validity of the refund request.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Voting Criteria</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• The reason for the refund request must be valid and supported</li>
                    <li>• The answer provided must be unsatisfactory</li>
                    <li>• The refund request must be made within a reasonable time frame</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Refund Distribution</h4>
                  <p className="text-neutral-600 dark:text-gray-300 text-sm">
                    If the refund request is approved, the BBUX tokens will be distributed back to the community treasury.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reputation System */}
        <section id="reputation-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Reputation System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Building Reputation</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Your reputation reflects your contributions and expertise on the platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Earning Reputation</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• +10 points for accepted answers</li>
                    <li>• +5 points for upvoted answers</li>
                    <li>• +2 points for upvoted questions</li>
                    <li>• +1 point for daily login</li>
                    <li>• +50 points for bounty wins</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Losing Reputation</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• -2 points for downvoted content</li>
                    <li>• -10 points for flagged content</li>
                    <li>• -50 points for spam or abuse</li>
                    <li>• -100 points for account suspension</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Reputation Levels</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div>
                    <h4 className="text-white font-semibold">Newcomer (0-99 points)</h4>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">Basic platform access</p>
                  </div>
                  <span className="text-violet-400 font-semibold">0-99</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div>
                    <h4 className="text-white font-semibold">Contributor (100-499 points)</h4>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">Can create bounties, vote on answers</p>
                  </div>
                  <span className="text-violet-400 font-semibold">100-499</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div>
                    <h4 className="text-white font-semibold">Expert (500-999 points)</h4>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">Moderation privileges, higher voting weight</p>
                  </div>
                  <span className="text-violet-400 font-semibold">500-999</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                  <div>
                    <h4 className="text-white font-semibold">Master (1000+ points)</h4>
                    <p className="text-neutral-600 dark:text-gray-400 text-sm">Full platform privileges, governance participation</p>
                  </div>
                  <span className="text-violet-400 font-semibold">1000+</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governance */}
        <section id="governance" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Governance & Staking</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Participating in Governance</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                As a BBUX token holder, you can participate in platform governance decisions.
              </p>
              <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                <li>1. Navigate to the Governance page</li>
                <li>2. Stake your BBUX tokens for voting power</li>
                <li>3. Browse active proposals</li>
                <li>4. Read proposal details and discussions</li>
                <li>5. Cast your vote on proposals</li>
                <li>6. Monitor proposal outcomes</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Creating Proposals</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Minimum stake requirement (varies by proposal type)</li>
                <li>• Clear proposal description and rationale</li>
                <li>• Implementation timeline and resources</li>
                <li>• Community discussion period</li>
                <li>• Voting period and quorum requirements</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Voting Power</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Your voting power is determined by the amount of BBUX tokens you have staked.
              </p>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• 1 BBUX = 1 voting power</li>
                <li>• Staked tokens are locked during voting</li>
                <li>• Higher reputation provides bonus voting weight</li>
                <li>• Delegation allows sharing voting power</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Notification System */}
        <section id="notification-system" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Notification System</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Notifications</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Stay updated with real-time notifications about your content and community activity. 
                The notification system automatically creates alerts for important events.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Notification Types</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Comments:</strong> When someone comments on your posts</li>
                    <li>• <strong>Votes:</strong> When your content receives upvotes/downvotes</li>
                    <li>• <strong>Answers:</strong> When someone answers your questions</li>
                    <li>• <strong>Bounties:</strong> When you receive bounty rewards</li>
                    <li>• <strong>System:</strong> Platform updates and announcements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Features</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Real-time notification creation</li>
                    <li>• Direct navigation to relevant content</li>
                    <li>• Mark as read functionality</li>
                    <li>• Unread count tracking</li>
                    <li>• Notification preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Managing Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Accessing Notifications</h4>
                  <ol className="text-neutral-600 dark:text-gray-300 space-y-2">
                    <li>1. Click the bell icon in the top navigation bar</li>
                    <li>2. View your recent notifications in the popup</li>
                    <li>3. Click on any notification to navigate to the content</li>
                    <li>4. Use "Mark all read" to clear all notifications</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Notification Actions</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Click:</strong> Navigate to the related content</li>
                    <li>• <strong>Mark as read:</strong> Remove from unread count</li>
                    <li>• <strong>Mark all read:</strong> Clear all notifications</li>
                    <li>• <strong>Delete:</strong> Remove individual notifications</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Recent Improvements</h3>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                The notification system has been recently updated for better performance and reliability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Performance Fixes</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Removed unnecessary API polling</li>
                    <li>• Real-time notification creation</li>
                    <li>• Improved error handling</li>
                    <li>• Enhanced data structure compatibility</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">User Experience</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Faster notification loading</li>
                    <li>• Reduced server load</li>
                    <li>• Better error messages</li>
                    <li>• Improved navigation accuracy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Best Practices</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">General Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Community Etiquette</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Be respectful and professional</li>
                    <li>• Help others learn and grow</li>
                    <li>• Provide constructive feedback</li>
                    <li>• Report inappropriate content</li>
                    <li>• Follow platform guidelines</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Content Quality</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Write clear, well-structured content</li>
                    <li>• Use proper formatting and code blocks</li>
                    <li>• Include relevant examples</li>
                    <li>• Cite sources when appropriate</li>
                    <li>• Keep content up-to-date</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Security Best Practices</h3>
              <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                <li>• Never share your private keys or seed phrases</li>
                <li>• Use hardware wallets for large amounts</li>
                <li>• Enable two-factor authentication</li>
                <li>• Regularly update your wallet software</li>
                <li>• Verify transaction details before confirming</li>
                <li>• Be cautious of phishing attempts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Troubleshooting</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Common Issues</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Wallet Connection Issues</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Ensure your wallet is unlocked</li>
                    <li>• Check if you're on the correct network (Solana mainnet)</li>
                    <li>• Try refreshing the page and reconnecting</li>
                    <li>• Update your wallet to the latest version</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Transaction Failures</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Ensure sufficient SOL for transaction fees</li>
                    <li>• Check your internet connection</li>
                    <li>• Verify transaction parameters</li>
                    <li>• Wait for network congestion to clear</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Account Issues</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Clear browser cache and cookies</li>
                    <li>• Try logging out and back in</li>
                    <li>• Check if your account is suspended</li>
                    <li>• Contact support for persistent issues</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Getting Help</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Community Support</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Ask questions in the community</li>
                    <li>• Search existing discussions</li>
                    <li>• Check the FAQ section</li>
                    <li>• Join community Discord/Telegram</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-violet-400 mb-2">Official Support</h4>
                  <ul className="text-neutral-600 dark:text-gray-400 space-y-1">
                    <li>• Email: support@bountyhub.tech</li>
                    <li>• Submit bug reports</li>
                    <li>• Request feature suggestions</li>
                    <li>• Report security issues</li>
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
              to="/docs/platform"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Platform Documentation</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Complete platform overview and architecture</p>
            </Link>
            <Link
              to="/docs/refund-system"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Refund System Guide</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Understanding the refund and governance system</p>
            </Link>
            <Link
              to="/docs/legal"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Legal Documents</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Terms of service and privacy policy</p>
            </Link>
            <Link
              to="/community"
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 border border-neutral-700 hover:border-violet-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm">Connect with other users and get help</p>
            </Link>
          </div>
        </section>

        {/* Download PDF */}
        <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Download User Guide</h3>
          <p className="text-neutral-600 dark:text-gray-400 mb-4">
            Get a PDF version of this user guide for offline reading
          </p>
          <a
            href="/api/docs/user-guide.pdf"
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