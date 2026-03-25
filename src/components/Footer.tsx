import { Link } from 'react-router-dom'
import { FaDiscord, FaTwitter } from 'react-icons/fa'
import { logoUrl } from '../utils/logoUrl'
import { isDesktopApp } from '../utils/desktop'

export function Footer() {
  const isDesktop = isDesktopApp()
  return (
    <footer className={`bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xs border-t border-neutral-200/50 dark:border-neutral-700/50 transition-colors duration-200 ${isDesktop ? 'py-4' : 'py-6'}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDesktop ? 'max-w-6xl' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-semibold" aria-label="bountyhub home">
              <img src={logoUrl} alt="" className="w-6 h-6 object-contain" aria-hidden />
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
              <Link to="/download" className="text-neutral-600 dark:text-neutral-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm">
                Download
              </Link>
              <Link to="/docs" className="text-neutral-600 dark:text-neutral-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm">
                Documentation
              </Link>
              <Link to="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm">
                Terms
              </Link>
            </nav>
          </div>
        </div>

        <div className={`border-t border-neutral-200 dark:border-neutral-700 ${isDesktop ? 'mt-3 pt-3' : 'mt-4 pt-4'}`}>
          <p className={`text-neutral-500 dark:text-neutral-500 text-center ${isDesktop ? 'text-xs' : 'text-sm'}`}>
            © {new Date().getFullYear()} bountyhub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 