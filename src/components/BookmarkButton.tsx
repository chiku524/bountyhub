import React, { useState, useEffect } from 'react'
import { FaBookmark } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthProvider'
import { config } from '../utils/config'

interface BookmarkButtonProps {
  postId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  postId,
  className = '',
  size = 'md'
}) => {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check initial bookmark status
  useEffect(() => {
    if (!user) return

    const checkBookmarkStatus = async () => {
      try {
        const postIdsParam = encodeURIComponent(JSON.stringify([postId]))
        const response = await fetch(`${config.api.baseUrl}/api/bookmarks/status?postIds=${postIdsParam}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.status[postId] || false)
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      }
    }

    checkBookmarkStatus()
  }, [user, postId])

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling to parent Link
    if (!user || isLoading) return

    setIsLoading(true)
    
    // Optimistically update the UI
    setIsBookmarked(prev => !prev)

    try {
      const response = await fetch(`${config.api.baseUrl}/api/bookmarks/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ postId })
      })

      if (!response.ok) {
        // Revert the optimistic update if the API call failed
        setIsBookmarked(prev => !prev)
        console.error('Failed to toggle bookmark:', response.status)
      }
    } catch (error) {
      // Revert the optimistic update if there was an error
      setIsBookmarked(prev => !prev)
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
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isBookmarked 
          ? 'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400' 
          : 'bg-neutral-200 dark:bg-neutral-700/50 text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-400/20'
      } ${className}`}
      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
    >
      <FaBookmark className={`${sizeClasses[size]} ${isBookmarked ? 'fill-current' : 'stroke-current stroke-2 fill-none'}`} />
    </button>
  )
} 