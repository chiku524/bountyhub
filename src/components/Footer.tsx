import { Link } from 'react-router-dom'
import { FaDiscord, FaTwitter } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xs border-t border-neutral-200/50 dark:border-neutral-700/50 py-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors font-semibold">
              bountyhub
            </Link>
            <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>|</span>
            <span className="text-neutral-600 dark:text-neutral-400 text-sm">Bounty Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg/9uwHxMP9mz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 dark:text-neutral-400 hover:text-[#5865F2] transition-colors"
                title="Join our Discord"
              >
                <FaDiscord className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/bountyhub_tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 dark:text-neutral-400 hover:text-[#1DA1F2] transition-colors"
                title="Follow us on X (Twitter)"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
            <nav className="flex items-center gap-6" aria-label="Footer navigation">
              <Link to="/docs" className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm">
                Documentation
              </Link>
              <Link to="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm">
                Terms
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-500 text-sm text-center">
            © 2025 bountyhub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 