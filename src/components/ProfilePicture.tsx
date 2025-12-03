import React from 'react'
import type { User } from '../types'

interface ProfilePictureProps {
  user?: User | null
  username?: string
  profilePicture?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({ 
  user, 
  username, 
  profilePicture, 
  size = 'md',
  className = ''
}) => {
  // Determine the source of data (user object takes precedence)
  const displayUsername = user?.username || username || 'User'
  const displayPicture = user?.profilePicture || profilePicture

  // Size classes
  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  }

  const sizeClass = sizeClasses[size]

  if (displayPicture) {
    return (
      <img 
        src={displayPicture} 
        alt={`${displayUsername}'s profile`}
        className={`${sizeClass} rounded-full object-cover border border-indigo-500/30 ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white ${className}`}>
      {displayUsername.charAt(0).toUpperCase()}
    </div>
  )
} 