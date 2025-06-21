import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import type { Post } from '../types'

export default function UserPosts() {
  const { username } = useParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    api.getUserPosts(username)
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [username])

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link to="/community" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Community
          </Link>
          {username && (
            <>
              <span className="text-gray-500 mx-2">/</span>
              <Link to={`/${username}`} className="text-indigo-400 hover:text-indigo-300">
                {username}
              </Link>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-8">
          Posts by {username}
        </h1>
        <div className="card bg-neutral-800 border-neutral-700 p-6">
          {loading && <p className="text-gray-300">Loading posts...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="text-gray-300">No posts found for this user.</p>
          )}
          {!loading && !error && posts.length > 0 && (
            <ul className="divide-y divide-neutral-700">
              {posts.map((post) => (
                <li key={post.id} className="py-4">
                  <Link to={`/posts/${post.id}`} className="block hover:bg-neutral-700/40 rounded-lg p-2 transition">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                      <p className="text-gray-400 mt-1">{post.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Status: <span className="text-indigo-400">{post.status}</span></span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
} 