import React, { useState, useEffect } from 'react'
import { FaBookmark } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthProvider'
import { config } from '../utils/config'
import { useBookmarkStatusContext } from '../contexts/BookmarkStatusContext'

interface BookmarkButtonProps {
  postId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  postId,
  className = '',
  size = 'md',
}) => {
  const { user } = useAuth()
  const batch = useBookmarkStatusContext()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sync from batched map when available (Community feeds).
  useEffect(() => {
    if (!user || !postId || !batch) return
    if (batch.hasStatus(postId)) {
      setIsBookmarked(batch.isBookmarked(postId))
    }
  }, [user, postId, batch, batch?.statusMap, batch?.isLoading])

  // Single-post fallback (detail pages, etc.) when no batch provider is mounted.
  useEffect(() => {
    if (!user || !postId || batch) return

    let cancelled = false

    const checkBookmarkStatus = async () => {
      try {
        const postIdsParam = encodeURIComponent(JSON.stringify([postId]))
        const response = await fetch(
          `${config.api.baseUrl}/api/bookmarks/status?postIds=${postIdsParam}`,
          { credentials: 'include' }
        )

        if (!response.ok || cancelled) return

        const data = await response.json().catch(() => null)
        const statusMap =
          data && typeof data === 'object'
            ? (data as { status?: Record<string, boolean> }).status
            : undefined
        if (statusMap && typeof statusMap === 'object') {
          setIsBookmarked(Boolean(statusMap[postId]))
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      }
    }

    void checkBookmarkStatus()
    return () => {
      cancelled = true
    }
  }, [user, postId, batch])

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || isLoading || !postId) return

    setIsLoading(true)
    const next = !isBookmarked
    setIsBookmarked(next)
    batch?.setBookmarked(postId, next)

    try {
      const response = await fetch(`${config.api.baseUrl}/api/bookmarks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        setIsBookmarked(!next)
        batch?.setBookmarked(postId, !next)
        console.error('Failed to toggle bookmark:', response.status)
      } else {
        const data = (await response.json().catch(() => null)) as { bookmarked?: boolean } | null
        if (data && typeof data.bookmarked === 'boolean') {
          setIsBookmarked(data.bookmarked)
          batch?.setBookmarked(postId, data.bookmarked)
        }
      }
    } catch (error) {
      setIsBookmarked(!next)
      batch?.setBookmarked(postId, !next)
      console.error('Error toggling bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      type="button"
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      className={`rounded-full p-2 transition-colors ${
        isBookmarked
          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-400'
          : 'bg-neutral-200 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-neutral-700/50 dark:text-yellow-400 dark:hover:bg-yellow-400/20 dark:hover:text-yellow-400'
      } ${className}`}
      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      aria-pressed={isBookmarked}
    >
      <FaBookmark
        className={`${sizeClasses[size]} ${isBookmarked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
      />
    </button>
  )
}
