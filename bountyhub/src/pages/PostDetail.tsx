import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Comments } from '../components/Comments'
import type { Post } from '../types'

export default function PostDetail() {
  const { postId } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) return
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedPost = await api.getPost(postId!)
      setPost(fetchedPost)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link to="/community" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Community
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-8">Post Detail</h1>
        <div className="card bg-neutral-800 border-neutral-700 p-6">
          {loading && (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-300">Loading post...</p>
            </div>
          )}
          
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={fetchPost}
            />
          )}
          
          {!loading && !error && post && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">{post.title}</h2>
              <p className="text-gray-400 mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>By: <Link to={`/${post.authorId}`} className="text-indigo-400 hover:text-indigo-300">User {post.authorId}</Link></span>
                <span>Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'open' ? 'bg-green-600 text-white' :
                  post.status === 'claimed' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>{post.status}</span></span>
                <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(post.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {!loading && !error && post && postId && (
          <div className="mt-8">
            <Comments postId={postId} />
          </div>
        )}
      </div>
    </div>
  )
} 