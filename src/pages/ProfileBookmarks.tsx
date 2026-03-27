import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import type { Bookmark } from '../types'
import { FiArrowLeft, FiBookmark } from 'react-icons/fi'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function ProfileBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBookmarksData()
  }, [])

  const loadBookmarksData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = await api.getProfile()
      setBookmarks(userData.bookmarks || [])
      
    } catch (err: any) {
      console.error('Bookmarks error:', err)
      setError(err.message || 'Failed to load bookmarks data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">All Bookmarks</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-300">Loading bookmarks...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">All Bookmarks</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <Link to="/profile" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <div className="flex items-center gap-4">
            <Link 
              to="/profile" 
              className="p-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors border border-violet-500/50"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">All Bookmarks</h1>
          </div>
        </div>

        <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-3">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="bg-neutral-700/50 rounded-lg p-4 border border-yellow-400/40 transition-all duration-300 hover:bg-neutral-600/50 hover:border-yellow-300/60 hover:shadow-lg hover:shadow-yellow-400/20 hover:scale-[1.02] group">
                  <Link to={`/posts/${bookmark.post.id}`} className="block">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <FiBookmark className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-300 transition-colors duration-300 line-clamp-2">
                        {bookmark.post.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-3 line-clamp-3 group-hover:text-gray-200 transition-colors duration-300">
                      {bookmark.post.content.length > 120 ? bookmark.post.content.substring(0, 120) + '...' : bookmark.post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(bookmark.post.createdAt).toLocaleDateString()}</span>
                      <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                        Read post →
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-yellow-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiBookmark className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-lg">No bookmarked posts yet</p>
              <p className="text-sm text-gray-500 mt-2">Bookmark posts from the community to see them here</p>
              <Link 
                to="/community" 
                className="mt-4 inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Explore Community
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 