import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import TagSelector from '../components/TagSelector'
import CodeBlockEditor from '../components/CodeBlockEditor'
import { MediaUpload } from '../components/MediaUpload'
import { FaDollarSign, FaGift, FaClock as FaClockIcon } from 'react-icons/fa'
import { FiInfo } from 'react-icons/fi'
import type { CodeBlock, Media } from '../types'

interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

const TOKEN_SYMBOL = 'SOL'

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [hasBounty, setHasBounty] = useState(false)
  const [bountyAmount, setBountyAmount] = useState('')
  const [bountyDuration, setBountyDuration] = useState(7)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await api.getTags()
        setAvailableTags(tags)
      } catch (err) {
        console.error('Failed to fetch tags:', err)
      }
    }
    fetchTags()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to create a post</h1>
        </div>
      </div>
    )
  }

  const handleMediaUpload = (newMedia: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => {
    const mediaItem: Media = {
      type: newMedia.type as 'image' | 'video' | 'file',
      url: newMedia.url,
      thumbnailUrl: newMedia.thumbnailUrl,
      isScreenRecording: newMedia.isScreenRecording
    }
    setMedia(prev => [...prev, mediaItem])
  }

  const handleMediaRemove = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const postData = {
        title,
        content,
        selectedTags,
        codeBlocks,
        media: media.map(m => ({
          type: m.type,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl,
          isScreenRecording: m.isScreenRecording || false
        })),
        hasBounty,
        bountyAmount: hasBounty ? parseFloat(bountyAmount) : 0,
        bountyDuration
      }

      const response = await api.createPost(postData)
      if (response.success) {
        navigate('/community')
      } else {
        setError('Failed to create post')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-2xl font-bold text-white">Create New Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          <div>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={availableTags}
              error={error?.includes('tag') ? error : undefined}
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-violet-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-violet-300 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label htmlFor="media" className="block text-sm font-medium text-violet-300 mb-2">
              Media
            </label>
            <MediaUpload
              onMediaUpload={handleMediaUpload}
              onMediaRemove={handleMediaRemove}
              uploadedMedia={media}
            />
          </div>

          <div>
            <label htmlFor="codeBlocks" className="block text-sm font-medium text-violet-300 mb-2">
              Code Blocks
            </label>
            <CodeBlockEditor
              codeBlocks={codeBlocks}
              onCodeBlocksChange={setCodeBlocks}
            />
          </div>

          <div>
            <h3 className="block text-sm font-medium text-violet-300 mb-3">
              <div className="flex items-center gap-2">
                <FaGift className="w-4 h-4" />
                Bounty Settings
              </div>
            </h3>
            
            <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-violet-500/20 rounded-xl p-6 backdrop-blur-sm">
              {/* Bounty Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <label htmlFor="hasBounty" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${hasBounty ? 'bg-violet-500' : 'bg-neutral-600'}`}>
                      <input
                        type="checkbox"
                        id="hasBounty"
                        checked={hasBounty}
                        onChange={(e) => setHasBounty(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${hasBounty ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </label>
                  </div>
                  <div>
                    <span className="text-white font-medium cursor-pointer">
                      Add Crypto Bounty
                    </span>
                    <p className="text-gray-400 text-sm">Reward the best answer with tokens</p>
                  </div>
                </div>
                
                {hasBounty && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full">
                    <FaGift className="w-4 h-4 text-violet-300" />
                    <span className="text-violet-300 text-sm font-medium">Active</span>
                  </div>
                )}
              </div>

              {/* Bounty Configuration */}
              {hasBounty && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Amount Section */}
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaDollarSign className="w-4 h-4 text-yellow-400" />
                    </div>
                    <label htmlFor="bountyAmount" className="text-white font-medium mb-1 block">Bounty Amount</label>
                    <div className="relative">
                      <input
                        id="bountyAmount"
                        type="number"
                        value={bountyAmount}
                        onChange={(e) => setBountyAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        {TOKEN_SYMBOL}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <FiInfo className="w-3 h-3" />
                      <span>5% goes to community governance rewards</span>
                    </div>
                  </div>

                  {/* Duration Section */}
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaClockIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <label htmlFor="bountyDuration" className="text-white font-medium mb-1 block">Bounty Duration</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        id="bountyDuration"
                        type="number"
                        value={bountyDuration}
                        onChange={(e) => setBountyDuration(Number(e.target.value))}
                        min="1"
                        max="30"
                        required
                        className="px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                      />
                      <div className="flex items-center justify-center px-4 py-3 bg-neutral-800/30 border border-neutral-600/30 rounded-lg text-gray-300 text-sm">
                        days
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <FiInfo className="w-3 h-3" />
                      <span>Bounty expires after {bountyDuration} days</span>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg p-4">
                    <h4 className="text-violet-300 font-medium mb-2">Bounty Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-medium">
                          {bountyAmount ? `${parseFloat(bountyAmount).toFixed(2)} ${TOKEN_SYMBOL}` : '0.00 SOL'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-medium">{bountyDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Governance Fee:</span>
                        <span className="text-yellow-400 font-medium">
                          {bountyAmount ? `${(parseFloat(bountyAmount) * 0.05).toFixed(3)} ${TOKEN_SYMBOL}` : '0.000 SOL'}
                        </span>
                      </div>
                      <div className="border-t border-violet-500/20 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Cost:</span>
                          <span className="text-violet-300 font-semibold">
                            {bountyAmount ? `${(parseFloat(bountyAmount) * 1.05).toFixed(3)} ${TOKEN_SYMBOL}` : '0.000 SOL'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Card when bounty is disabled */}
              {!hasBounty && (
                <div className="bg-neutral-700/20 rounded-lg p-4 border border-neutral-600/30">
                  <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-gray-300 font-medium mb-1">No Bounty Selected</h4>
                      <p className="text-gray-400 text-sm">
                        Enable bounty to reward the best answer with tokens. This will attract more attention to your question and incentivize quality responses.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:bg-violet-500/50 disabled:cursor-not-allowed disabled:hover:bg-violet-500/50 transition-colors"
            >
              {loading ? "Creating Post..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 