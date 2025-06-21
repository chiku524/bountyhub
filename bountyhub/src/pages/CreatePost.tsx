import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to create a post</h1>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.createPost({ title, content, authorId: user.id })
      navigate('/community')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Create Post</h1>
        <div className="card bg-neutral-800 border-neutral-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Title</label>
              <input
                type="text"
                className="input w-full"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Content</label>
              <textarea
                className="input w-full min-h-[120px]"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <button
              type="submit"
              className="btn-primary px-8 py-3 text-lg"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 