import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-neutral-800 border-t border-neutral-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link to="/" className="text-gray-300 hover:text-indigo-300 transition-colors">
              <span className="text-lg font-bold">bountyhub</span>
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-sm">Bounty Platform</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="/docs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm">
              Documentation
            </a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm">
              Privacy
            </a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm">
              Terms
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <p className="text-gray-500 text-sm text-center">
            © 2024 bountyhub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 