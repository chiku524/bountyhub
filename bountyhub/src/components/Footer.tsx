import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-neutral-800 border-t border-neutral-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link to="/" className="text-gray-300 hover:text-indigo-300 transition-colors">
              <span className="text-lg font-bold">portal.ask</span>
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-sm">Bounty Platform</span>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/docs" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm">
              Documentation
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-indigo-300 transition-colors text-sm">
              Terms
            </Link>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <p className="text-gray-500 text-sm text-center">
            © 2024 Portal.ask. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 