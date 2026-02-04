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

  const hasActiveFilters =
    filters.status !== '' ||
    filters.dateRange !== '' ||
    filters.sortBy !== 'newest' ||
    filters.hasBounty ||
    (filters.selectedTags && filters.selectedTags.length > 0)
  const activeCount = [filters.status, filters.dateRange, filters.hasBounty].filter(Boolean).length + (filters.selectedTags?.length || 0)

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={handleToggleClick}
        className="flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isOpen ? 'Close filters' : 'Open filters'}
      >
        <svg className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="min-w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
        <svg className={`w-4 h-4 shrink-0 transition-transform text-neutral-500 dark:text-neutral-400 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] max-h-[min(85vh,32rem)] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 p-4 shadow-lg right-0 left-auto sm:right-0 sm:left-auto"
          role="dialog"
          aria-label="Filter options"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-full text-sm"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="input w-full text-sm"
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
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input w-full text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostVoted">Most Voted</option>
                <option value="mostCommented">Most Commented</option>
              </select>
            </div>

            {/* Bounty Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Bounty
              </label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasBounty"
                  checked={filters.hasBounty}
                  onChange={(e) => handleFilterChange('hasBounty', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-700"
                />
                <label htmlFor="hasBounty" className="text-sm text-neutral-600 dark:text-neutral-400">
                  Has Bounty
                </label>
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tags</label>
            {loadingTags ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading tags...</p>
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
          <div className="mt-4 flex justify-end border-t border-neutral-200 dark:border-neutral-600 pt-3">
            <button
              type="button"
              onClick={() => onFiltersChange({
                status: '',
                dateRange: '',
                sortBy: 'newest',
                hasBounty: false,
                selectedTags: []
              })}
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 