import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Comments } from '../components/Comments'
import { Answers } from '../components/Answers'
import { BookmarkButton } from '../components/BookmarkButton'
import { CodeBlockEditor } from '../components/CodeBlockEditor'
import TagSelector from '../components/TagSelector'
import { MediaUpload } from '../components/MediaUpload'
import { useAuth } from '../contexts/AuthProvider'
import type { Post, CodeBlock, Media } from '../types'

export default function PostDetail() {
  const { postId } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editCodeBlocks, setEditCodeBlocks] = useState<CodeBlock[]>([])
  const [editMedia, setEditMedia] = useState<Media[]>([])
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string; description: string | null }>>([])

  useEffect(() => {
    if (!postId) return
    fetchPost()
    fetchTags()
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

  const fetchTags = async () => {
    try {
      const tags = await api.getTags()
      setAvailableTags(tags)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const canEdit = user && post && user.id === post.authorId && (
    !post.editedAt || (Date.now() - new Date(post.editedAt).getTime() > 24 * 60 * 60 * 1000)
  )

  const handleEditClick = () => {
    setEditTitle(post?.title || '')
    setEditContent(post?.content || '')
    
    // Convert tag names to tag IDs for TagSelector
    const tagIds = post?.tags?.map(tagName => {
      const tag = availableTags.find(t => t.name === tagName)
      return tag?.id || ''
    }).filter(id => id) || []
    
    setEditTags(tagIds)
    setEditCodeBlocks(post?.codeBlocks || [])
    setEditMedia(post?.media || [])
    setEditing(true)
    setEditError(null)
  }

  const handleEditCancel = () => {
    setEditing(false)
    setEditError(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId || !editTitle.trim() || !editContent.trim()) return
    setEditLoading(true)
    setEditError(null)
    try {
      console.log('Submitting edit with data:', {
        title: editTitle.trim(),
        content: editContent.trim(),
        tags: editTags,
        codeBlocks: editCodeBlocks,
        media: editMedia,
      })
      
      const updated = await api.editPost(postId, {
        title: editTitle.trim(),
        content: editContent.trim(),
        tags: editTags,
        codeBlocks: editCodeBlocks,
        media: editMedia,
      })
      
      console.log('API response:', updated)
      setPost(updated)
      setEditing(false)
      
      // Refresh the post data to ensure we have the latest state
      await fetchPost()
    } catch (err: any) {
      console.error('Edit error:', err)
      setEditError(err.message || 'Failed to update post')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddCodeBlock = (codeBlock: CodeBlock) => {
    setEditCodeBlocks(prev => [...prev, codeBlock])
  }

  const handleRemoveCodeBlock = (index: number) => {
    setEditCodeBlocks(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddMedia = (mediaItem: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => {
    setEditMedia(prev => [...prev, {
      type: (mediaItem.type.toLowerCase() as 'image' | 'video' | 'file'),
      url: mediaItem.url,
      thumbnailUrl: mediaItem.thumbnailUrl,
      isScreenRecording: mediaItem.isScreenRecording
    }])
  }

  const handleRemoveMedia = (index: number) => {
    setEditMedia(prev => prev.filter((_, i) => i !== index))
  }

  const renderCodeBlock = (block: any, index: number) => (
    <div key={index} className="bg-neutral-900/80 rounded-lg p-4 border border-violet-500/30 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-sm">
          {block.language}
        </span>
      </div>
      <pre className="bg-neutral-900/80 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
        <code className="text-sm text-gray-300">{block.code}</code>
      </pre>
      {block.description && (
        <p className="mt-2 text-sm text-gray-400">{block.description}</p>
      )}
    </div>
  )

  const renderMedia = (item: any, index: number) => (
    <div key={index} className="relative group">
      {item.type === 'IMAGE' ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-600 bg-neutral-800">
          <img 
            src={item.url} 
            alt={`Media ${index + 1}`} 
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer relative z-10"
            onClick={() => window.open(item.url, '_blank')}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                Click to view full size
              </span>
            </div>
          </div>
        </div>
      ) : item.type === 'VIDEO' ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-600 bg-neutral-800">
          <video 
            controls 
            className="w-full h-64 object-cover"
            preload="metadata"
          >
            <source src={item.url} type="video/mp4" />
            <source src={item.url} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="p-4 bg-neutral-800 border border-neutral-600 rounded-lg h-64 flex items-center justify-center">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex flex-col items-center gap-2"
          >
            <span className="text-2xl">📎</span>
            <span className="text-sm">Download File</span>
          </a>
        </div>
      )}
    </div>
  )

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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                <h2 className="text-2xl font-semibold text-white flex-1">{post.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1 mr-2 flex-wrap max-w-xs">
                      {post.tags.map((tagName, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs font-medium border border-violet-500/30 whitespace-nowrap"
                        >
                          {tagName}
                        </span>
                      ))}
                    </div>
                  )}
                  <BookmarkButton postId={post.id} size="lg" />
                  {canEdit && !editing && (
                    <button
                      className="ml-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
                      onClick={handleEditClick}
                    >
                      Edit Post
                    </button>
                  )}
                </div>
              </div>
              {editing ? (
                <form onSubmit={handleEditSubmit} className="mb-4 space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-600 bg-neutral-900 text-white"
                    placeholder="Title"
                    disabled={editLoading}
                  />
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-600 bg-neutral-900 text-white"
                    placeholder="Content"
                    rows={6}
                    disabled={editLoading}
                  />
                  
                  {/* Tags */}
                  <div>
                    <TagSelector
                      selectedTags={editTags}
                      onTagsChange={setEditTags}
                      availableTags={availableTags}
                      required={false}
                    />
                  </div>

                  {/* Code Blocks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Code Blocks</label>
                    <CodeBlockEditor 
                      onAdd={handleAddCodeBlock}
                      onCancel={() => {}}
                    />
                    {editCodeBlocks.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-300">Added Code Blocks:</h4>
                        {editCodeBlocks.map((block, index) => (
                          <div key={index} className="bg-neutral-900/80 rounded-lg p-4 border border-violet-500/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-sm">
                                {block.language}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCodeBlock(index)}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                                title="Remove code block"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <pre className="bg-neutral-900/80 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                              <code className="text-sm text-gray-300">{block.code}</code>
                            </pre>
                            {block.description && (
                              <p className="mt-2 text-sm text-gray-400">{block.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Media */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Media</label>
                    <MediaUpload
                      onMediaUpload={handleAddMedia}
                      onMediaRemove={handleRemoveMedia}
                      uploadedMedia={editMedia.map(item => ({
                        type: item.type.toUpperCase(),
                        url: item.url,
                        thumbnailUrl: item.thumbnailUrl,
                        isScreenRecording: item.isScreenRecording
                      }))}
                    />
                  </div>

                  {editError && <ErrorMessage message={editError} />}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                      onClick={handleEditCancel}
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded"
                      disabled={editLoading || !editTitle.trim() || !editContent.trim()}
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-gray-400 mb-4 whitespace-pre-wrap">{post.content}</p>
                  {/* Code Blocks */}
                  {post.codeBlocks && post.codeBlocks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Code Blocks</h3>
                      {post.codeBlocks.map((block, index) => renderCodeBlock(block, index))}
                    </div>
                  )}
                  {/* Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Media ({post.media.length})</h3>
                      <div className={`grid gap-4 ${
                        post.media.length === 1 ? 'grid-cols-1 max-w-2xl' :
                        post.media.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        post.media.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      }`}>
                        {post.media.map((item, index) => renderMedia(item, index))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>By: <Link 
                  to={`/users/${post.author?.username || post.authorId}`} 
                  className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  {post.author?.username || `User ${post.authorId}`}
                </Link></span>
                <span>Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'open' ? 'bg-green-600 text-white' :
                  post.status === 'claimed' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>{post.status}</span></span>
                <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
                {post.editedAt && <span>Last Edited: {new Date(post.editedAt).toLocaleString()}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Answers Section */}
        {!loading && !error && post && postId && (
          <div className="mt-8">
            <Answers postId={postId} post={post} />
          </div>
        )}

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