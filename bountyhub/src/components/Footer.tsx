import { Link } from 'react-router-dom'
import { FaDiscord, FaTwitter } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border-t border-neutral-200/50 dark:border-neutral-700/50 py-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
              <span className="text-lg font-bold">bountyhub</span>
            </Link>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Bounty Platform</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://discord.gg/9uwHxMP9mz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 dark:text-gray-400 hover:text-[#5865F2] transition-colors"
                title="Join our Discord"
              >
                <FaDiscord className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/bountyhub_tech" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 dark:text-gray-400 hover:text-[#1DA1F2] transition-colors"
                title="Follow us on X (Twitter)"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
            
            {/* Documentation Links */}
            <div className="flex space-x-6">
              <a href="/docs" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm">
                Documentation
              </a>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm">
                Privacy
              </a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-sm">
                Terms
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-gray-500 dark:text-gray-500 text-sm text-center">
            © 2025 bountyhub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 