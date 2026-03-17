import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'
import { PageMetadata } from '../components/PageMetadata'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <PageMetadata
        title="Page not found - bountyhub"
        description="The page you're looking for doesn't exist or has been moved."
      />
      <div className="text-center max-w-md">
        <p className="text-6xl sm:text-7xl font-bold text-indigo-500/30 dark:text-indigo-400/20 select-none">
          404
        </p>
        <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            <FiHome className="w-5 h-5" />
            Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors font-medium"
          >
            <FiArrowLeft className="w-5 h-5" />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
