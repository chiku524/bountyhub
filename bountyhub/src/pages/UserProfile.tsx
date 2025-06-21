import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import type { User } from '../types'

export default function UserProfile() {
  const { username } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    api.getUserProfile(username)
      .then(setUser)
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
        </div>
        <h1 className="text-3xl font-bold text-white mb-8">User Profile</h1>
        <div className="card bg-neutral-800 border-neutral-700 p-6">
          {loading && <p className="text-gray-300">Loading user profile...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && user && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">{user.username}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
                <Link 
                  to={`/${user.username}/posts`} 
                  className="btn-secondary px-4 py-2"
                >
                  View Posts
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-neutral-700/50 p-4 rounded-lg">
                  <span className="text-gray-400 block">Reputation</span>
                  <span className="text-indigo-400 text-xl font-semibold">{user.reputation}</span>
                </div>
                <div className="bg-neutral-700/50 p-4 rounded-lg">
                  <span className="text-gray-400 block">Level</span>
                  <span className="text-white text-xl font-semibold">{user.reputationLevel}</span>
                </div>
                <div className="bg-neutral-700/50 p-4 rounded-lg">
                  <span className="text-gray-400 block">Joined</span>
                  <span className="text-white text-xl font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 