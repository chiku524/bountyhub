import React, { useState, useEffect, useRef } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'
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

  useEscapeKey(isOpen, () => setIsOpen(false))

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
          className="absolute top-full z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] max-h-[min(90vh,36rem)] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-xl right-0 left-auto sm:right-0 sm:left-auto"
          role="dialog"
          aria-label="Filter options"
        >
          <div className="p-5 sm:p-6 space-y-6">
            {/* Quick filters: single column for comfortable dropdown space */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Quick filters
              </h3>
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input w-full text-sm py-2.5 min-h-11"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="claimed">Claimed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="input w-full text-sm py-2.5 min-h-11"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="input w-full text-sm py-2.5 min-h-11"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mostVoted">Most Voted</option>
                    <option value="mostCommented">Most Commented</option>
                  </select>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Bounty
                  </label>
                  <label className="flex items-center gap-3 py-2.5 cursor-pointer rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors -ml-1 pl-1">
                    <input
                      type="checkbox"
                      id="hasBounty"
                      checked={filters.hasBounty}
                      onChange={(e) => handleFilterChange('hasBounty', e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-700"
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Has Bounty only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tags: no duplicate label — TagSelector shows its own "Tags" header */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
              {loadingTags ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">Loading tags...</p>
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
                  hideHelpText
                />
              )}
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => onFiltersChange({
                  status: '',
                  dateRange: '',
                  sortBy: 'newest',
                  hasBounty: false,
                  selectedTags: []
                })}
                className="text-sm font-medium px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 