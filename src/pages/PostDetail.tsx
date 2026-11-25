import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { isDesktopApp } from '../utils/desktop'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CodeBlockView } from '../components/CodeBlockView'
import { Markdown } from '../components/Markdown'
import { ImageLightbox } from '../components/ImageLightbox'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { VoteButton } from '../components/VoteButton'
import { formatBountyTimeLeft, isBountyEndingSoon } from '../utils/bountyTime'
import { FiLink } from 'react-icons/fi'
import { PostChatRoom } from '../components/PostChatRoom'
import { Answers } from '../components/Answers'
import { BookmarkButton } from '../components/BookmarkButton'
import { CodeBlockEditor } from '../components/CodeBlockEditor'
import TagSelector from '../components/TagSelector'
import { MediaUpload } from '../components/MediaUpload'
import { ProfilePicture } from '../components/ProfilePicture'
import { useAuth } from '../contexts/AuthProvider'
import { useToast } from '../contexts/ToastContext'
import type { Post, CodeBlock, Media } from '../types'
import { formatPostStatus } from '../utils/walletStatus'

export default function PostDetail() {
  const { postId } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
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
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // Memoize formatted dates to prevent them from changing on re-renders
  const formattedCreatedAt = useMemo(() => {
    if (!post?.createdAt) return ''
    try {
      const date = new Date(post.createdAt)
      return date.toLocaleString()
    } catch (error) {
      console.error('Error formatting createdAt date:', error)
      return 'Invalid date'
    }
  }, [post?.createdAt])

  const formattedEditedAt = useMemo(() => {
    if (!post?.editedAt) return ''
    try {
      const date = new Date(post.editedAt)
      return date.toLocaleString()
    } catch (error) {
      console.error('Error formatting editedAt date:', error)
      return 'Invalid date'
    }
  }, [post?.editedAt])

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

  const refreshPost = async () => {
    if (!postId) return
    setRefreshing(true)
    setError(null)
    try {
      const fetchedPost = await api.getPost(postId)
      setPost(fetchedPost)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRefreshing(false)
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

  const isAuthor = Boolean(user && post && user.id === post.authorId)
  // The API allows one edit per 24 hours; show when editing unlocks instead of hiding the button.
  const editUnlocksAt = post?.editedAt ? new Date(post.editedAt).getTime() + 24 * 60 * 60 * 1000 : 0
  const editLockedHours = editUnlocksAt > Date.now() ? Math.ceil((editUnlocksAt - Date.now()) / 3_600_000) : 0
  const canEdit = isAuthor && editLockedHours === 0

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: post?.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error('Could not copy the link')
    }
  }

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
      const updated = await api.editPost(postId, {
        title: editTitle.trim(),
        content: editContent.trim(),
        tags: editTags,
        codeBlocks: editCodeBlocks,
        media: editMedia,
      })
      
      setPost(updated)
      setEditing(false)
      
      await refreshPost()
    } catch (err: any) {
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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const handleDeleteConfirm = async () => {
    if (!postId) return
    
    setDeleteLoading(true)
    try {
      const response = await api.deletePost(postId)
      if (response.success) {
        toast.success('Post deleted')
        navigate('/community', { replace: true })
      } else {
        toast.error('Failed to delete post. Please try again.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete post. Please try again.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const renderCodeBlock = (block: any, index: number) => (
    <CodeBlockView key={index} code={block.code} language={block.language} description={block.description} />
  )

  const renderMedia = (item: any, index: number) => (
    <div key={index} className="relative group">
      {item.type === 'IMAGE' ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800">
          <button
            type="button"
            className="block w-full"
            onClick={() => setLightboxIndex(imageMedia.findIndex((m) => m.url === item.url))}
            aria-label={`View image ${index + 1} full size`}
          >
            <img
              src={item.url}
              alt={`Media ${index + 1}`}
              loading="lazy"
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in relative z-10"
            />
          </button>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded-sm">
                Click to view full size
              </span>
            </div>
          </div>
        </div>
      ) : item.type === 'VIDEO' ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800">
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
        <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg h-64 flex items-center justify-center">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex flex-col items-center gap-2"
          >
            <span className="text-2xl">📎</span>
            <span className="text-sm">Download File</span>
          </a>
        </div>
      )}
    </div>
  )

  const isDesktop = isDesktopApp()
  const imageMedia = (post?.media ?? []).filter((m) => String(m.type).toUpperCase() === 'IMAGE')
  return (
    <div className="p-4 @sm/main:p-6 @3xl/main:p-8">
      <div className={`mx-auto min-w-0 w-full ${isDesktop ? 'max-w-6xl' : 'max-w-7xl'}`}>
        <div className="mb-4 space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Community', to: '/community' },
              {
                label: post?.title ? (post.title.length > 56 ? `${post.title.slice(0, 56)}…` : post.title) : 'Post',
              },
            ]}
          />
          {/* Desktop-only back link — breadcrumbs cover navigation on small screens */}
          <Link
            to="/community"
            className="hidden @xl/main:inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            ← Back to Community
          </Link>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 @xl/main:mb-6">
          {/* Redundant page chrome — post title is the real heading on mobile */}
          <h1 className="hidden text-2xl font-bold text-neutral-900 @xl/main:block @sm/main:text-3xl dark:text-white">
            Post Detail
          </h1>
          {refreshing && (
            <span className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400" role="status">
              <LoadingSpinner size="sm" label={false} />
              Updating…
            </span>
          )}
        </div>
        <div className={`card bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 ${post?.reward && post.reward > 0 ? 'border-2 border-cyan-500/60 dark:border-cyan-400/60 bg-linear-to-br from-cyan-50 to-blue-50 dark:from-neutral-800 dark:to-cyan-500/5' : ''}`}>
          {loading && (
            <div className="animate-pulse space-y-4 p-2">
              <div className="h-8 bg-neutral-200 dark:bg-neutral-600 rounded w-3/4 max-w-md" />
              <div className="flex gap-2 flex-wrap">
                <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-600 rounded" />
                <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-600 rounded" />
                <div className="h-6 w-14 bg-neutral-200 dark:bg-neutral-600 rounded" />
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-full" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-full" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-5/6" />
              </div>
              <div className="flex justify-center pt-6">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          
          {error && (
            <ErrorMessage message={error} onRetry={post ? refreshPost : fetchPost} />
          )}
          
          {!loading && !error && post && (
            <div>
              <div className="mb-4 flex flex-col justify-between gap-4 @xl/main:flex-row @xl/main:items-start">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-start gap-2 @sm/main:gap-3">
                    <h2 className="min-w-0 flex-1 text-xl @sm/main:text-2xl font-semibold text-neutral-900 dark:text-white">{post.title}</h2>
                    {post.reward && post.reward > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 border border-cyan-300 dark:border-cyan-400/40 rounded-full">
                        <span className="text-cyan-600 dark:text-cyan-300 text-lg">💰</span>
                        <span className="text-cyan-700 dark:text-cyan-200 font-semibold">{post.reward} BBUX Bounty</span>
                        {post.bountyStatus === 'ACTIVE' && formatBountyTimeLeft(post.bountyExpiresAt) && (
                          <span
                            className={`text-xs ${isBountyEndingSoon(post.bountyExpiresAt) ? 'font-semibold text-red-600 dark:text-red-400' : 'text-cyan-700/80 dark:text-cyan-200/80'}`}
                          >
                            · {formatBountyTimeLeft(post.bountyExpiresAt)}
                          </span>
                        )}
                        {post.bountyStatus === 'EXPIRED' && (
                          <span
                            className="text-xs text-amber-700 dark:text-amber-300"
                            title="The asker has 3 days to accept an answer. After that the top-voted answer wins, or the bounty is returned if no answer has positive votes."
                          >
                            · Ended, awaiting accept (top-voted answer wins after 3 days)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mr-2">
                      {post.tags.map((tagName, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-sm text-xs font-medium border border-violet-300 dark:border-violet-500/30 whitespace-nowrap"
                        >
                          {tagName}
                        </span>
                      ))}
                    </div>
                  )}
                  <VoteButton
                    itemId={post.id}
                    itemType="post"
                    voteType="quality"
                    orientation="horizontal"
                    initialVotes={post.qualityUpvotes || 0}
                    userVote={post.userVote || 0}
                  />
                  <BookmarkButton postId={post.id} size="lg" />
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1 text-sm text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    aria-label="Copy link to this post"
                  >
                    <FiLink className="h-4 w-4" aria-hidden />
                    Share
                  </button>
                  {isAuthor && !editing && (
                    <button
                      type="button"
                      className="ml-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleEditClick}
                      disabled={!canEdit}
                      title={canEdit ? undefined : `Posts can be edited once a day. You can edit again in ${editLockedHours} ${editLockedHours === 1 ? 'hour' : 'hours'}.`}
                    >
                      {canEdit ? 'Edit Post' : `Edit in ${editLockedHours}h`}
                    </button>
                  )}
                  {isAuthor && !editing && (
                    <button
                      type="button"
                      className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-sm transition-colors"
                      onClick={handleDeleteClick}
                    >
                      Delete Post
                    </button>
                  )}
                </div>
              </div>
              {editing ? (
                <form onSubmit={handleEditSubmit} className="mb-4 space-y-4">
                  <input
                    id="post-edit-title"
                    name="postEditTitle"
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full p-2 rounded-sm border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="Title"
                    disabled={editLoading}
                  />
                  <MarkdownEditor
                    id="post-edit-content"
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Content"
                    rows={8}
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">Code Blocks</label>
                    <CodeBlockEditor 
                      onAdd={handleAddCodeBlock}
                      onCancel={() => {}}
                    />
                    {editCodeBlocks.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-neutral-700 dark:text-gray-300">Added Code Blocks:</h4>
                        {editCodeBlocks.map((block, index) => (
                          <CodeBlockView
                            key={index}
                            code={block.code}
                            language={block.language}
                            description={block.description}
                            action={
                              <button
                                type="button"
                                onClick={() => handleRemoveCodeBlock(index)}
                                className="text-xs text-neutral-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                              >
                                Remove
                              </button>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Media */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">Media</label>
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
                      className="px-3 py-1 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700 text-sm rounded-sm"
                      onClick={handleEditCancel}
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-sm"
                      disabled={editLoading || !editTitle.trim() || !editContent.trim()}
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <Markdown className="mb-4">{post.content}</Markdown>
                  {/* Code Blocks */}
                  {post.codeBlocks && post.codeBlocks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Code Blocks</h3>
                      {post.codeBlocks.map((block, index) => renderCodeBlock(block, index))}
                    </div>
                  )}
                  {/* Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Media ({post.media.length})</h3>
                      <div className={`grid gap-4 ${
                        post.media.length === 1 ? 'grid-cols-1 max-w-2xl' :
                        post.media.length === 2 ? 'grid-cols-1 @xl/main:grid-cols-2' :
                        post.media.length === 3 ? 'grid-cols-1 @xl/main:grid-cols-2 @3xl/main:grid-cols-3' :
                        'grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 @7xl/main:grid-cols-4'
                      }`}>
                        {post.media.map((item, index) => renderMedia(item, index))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 dark:text-gray-500">
                <span className="flex items-center space-x-2">
                  <ProfilePicture user={post.author} size="sm" />
                  <span>By: <Link 
                    to={`/users/${post.author?.username || post.authorId}`} 
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                  >
                    {post.author?.username || `User ${post.authorId}`}
                  </Link></span>
                </span>
                {(() => {
                  const postStatus = formatPostStatus(post.status)
                  return (
                    <span className="inline-flex items-center gap-1.5" title={postStatus.detail}>
                      Status:
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          postStatus.tone === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white'
                            : postStatus.tone === 'warning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-600 dark:text-white'
                              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-600 dark:text-white'
                        }`}
                      >
                        {postStatus.label}
                      </span>
                    </span>
                  )
                })()}
                <span className="hidden @sm/main:inline">Created: {formattedCreatedAt}</span>
                {post.editedAt && (
                  <span className="hidden @xl/main:inline">Last Edited: {formattedEditedAt}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Answers Section */}
        {!loading && !error && post && postId && (
          <div className="mt-8">
            <Answers postId={postId} post={post} onPostChanged={refreshPost} />
          </div>
        )}

        {/* Post Chat Room (replaces comments; history saved, active while post is open) */}
        {!loading && !error && post && postId && (
          <PostChatRoom postId={postId} postTitle={post.title} />
        )}

        <ImageLightbox
          images={imageMedia.map((m, i) => ({ url: m.url, alt: `Image ${i + 1} from ${post?.title ?? 'post'}` }))}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete this post?"
          confirmLabel="Delete post"
          tone="danger"
          busy={deleteLoading}
          onCancel={handleDeleteCancel}
          onConfirm={() => void handleDeleteConfirm()}
        >
          <p>This removes the post, its answers and its chat. It can't be undone.</p>
          {post?.reward && post.reward > 0 && post.bountyStatus === 'ACTIVE' ? (
            <p className="mt-2 text-amber-700 dark:text-amber-300">The {post.reward} BBUX bounty will be refunded to your wallet.</p>
          ) : null}
        </ConfirmDialog>
      </div>
    </div>
  )
} 