import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500`}></div>
    </div>
  )
}

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-neutral-700 rounded-sm ${className}`}></div>
  )
}

export const PostSkeleton: React.FC = () => {
  return (
    <div className="py-4 animate-pulse">
      <div className="h-6 bg-neutral-700 rounded-sm mb-2 w-3/4"></div>
      <div className="h-4 bg-neutral-700 rounded-sm mb-2 w-full"></div>
      <div className="h-4 bg-neutral-700 rounded-sm mb-2 w-2/3"></div>
      <div className="flex space-x-4 mt-2">
        <div className="h-3 bg-neutral-700 rounded-sm w-20"></div>
        <div className="h-3 bg-neutral-700 rounded-sm w-24"></div>
      </div>
    </div>
  )
} 