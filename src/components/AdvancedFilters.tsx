import React, { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import TagSelector from './TagSelector'

interface FilterOptions {
  status: string
  dateRange: string
  sortBy: string
  hasBounty: boolean
  selectedTags: string[]
}

interface Tag {
  id: string
  name: string
  description: string | null
  color: string
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  className?: string
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && availableTags.length === 0) {
      fetchTags()
    }
  }, [isOpen])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        event.target !== toggleButtonRef.current
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchTags = async () => {
    setLoadingTags(true)
    try {
      const tags = await api.getTags()
      setAvailableTags(tags)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoadingTags(false)
    }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleTagsChange = (tagIds: string[]) => {
    const selectedTagNames = availableTags
      .filter(tag => tagIds.includes(tag.id))
      .map(tag => tag.name)
    handleFilterChange('selectedTags', selectedTagNames)
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className={className} ref={dropdownRef}>
      <button
        ref={toggleButtonRef}
        onClick={handleToggleClick}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span>Filters</span>
        <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 left-auto top-full z-50 min-w-[280px] sm:min-w-xl w-full max-w-[calc(100vw-2rem)] ml-0 p-3 sm:p-4 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-sm text-white text-sm"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-sm text-white text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-sm text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostVoted">Most Voted</option>
                <option value="mostCommented">Most Commented</option>
              </select>
            </div>

            {/* Bounty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bounty
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasBounty"
                  checked={filters.hasBounty}
                  onChange={(e) => handleFilterChange('hasBounty', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-neutral-700 border-neutral-600 rounded-sm focus:ring-indigo-500"
                />
                <label htmlFor="hasBounty" className="ml-2 text-sm text-gray-300">
                  Has Bounty
                </label>
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            {loadingTags ? (
              <div className="text-gray-400 text-sm">Loading tags...</div>
            ) : (
              <TagSelector
                selectedTags={availableTags
                  .filter(tag => filters.selectedTags.includes(tag.name))
                  .map(tag => tag.id)
                }
                onTagsChange={handleTagsChange}
                availableTags={availableTags}
                required={false}
                disableClickOutside={true}
              />
            )}
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onFiltersChange({
                status: '',
                dateRange: '',
                sortBy: 'mostVoted',
                hasBounty: false,
                selectedTags: []
              })}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 