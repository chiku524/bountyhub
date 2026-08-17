import { FiGrid, FiList } from 'react-icons/fi'
import { SearchBar } from '../SearchBar'
import { AdvancedFilters } from '../AdvancedFilters'
import { ExportButton } from '../ExportButton'
import type { CommunityFilterOptions } from '../../utils/communityPosts'
import type { Post } from '../../types'

export type CommunityPostView = 'list' | 'card'
export type CommunityDiscoveryPreset = 'all' | 'new' | 'open' | 'unanswered' | 'bounties'

const PRESETS: Array<{ id: CommunityDiscoveryPreset; label: string; hint: string }> = [
  { id: 'all', label: 'All', hint: 'Every question' },
  { id: 'new', label: 'New this week', hint: 'Posted in the last 7 days' },
  { id: 'open', label: 'Open', hint: 'Still accepting answers' },
  { id: 'unanswered', label: 'Unanswered', hint: 'No answers yet' },
  { id: 'bounties', label: 'Bounties', hint: 'Questions with BBUX rewards' },
]

export function getDiscoveryPreset(filters: CommunityFilterOptions): CommunityDiscoveryPreset | null {
  const { status, dateRange, hasBounty, unanswered } = filters
  if (unanswered) return 'unanswered'
  if (hasBounty && !dateRange) return 'bounties'
  if (status === 'open' && !hasBounty && !dateRange) return 'open'
  if (dateRange === 'week' && !hasBounty && !status) return 'new'
  if (!status && !dateRange && !hasBounty && !unanswered) return 'all'
  return null
}

export function filtersForPreset(
  preset: CommunityDiscoveryPreset,
  filters: CommunityFilterOptions
): CommunityFilterOptions {
  const next: CommunityFilterOptions = {
    ...filters,
    status: '',
    dateRange: '',
    hasBounty: false,
    unanswered: false,
  }

  switch (preset) {
    case 'new':
      next.dateRange = 'week'
      next.sortBy = 'newest'
      break
    case 'open':
      next.status = 'open'
      break
    case 'unanswered':
      next.status = 'open'
      next.unanswered = true
      break
    case 'bounties':
      next.status = 'open'
      next.hasBounty = true
      break
    default:
      break
  }

  return next
}

interface CommunityDiscoveryBarProps {
  filters: CommunityFilterOptions
  postView: CommunityPostView
  exportPosts: Post[]
  onSearch: (query: string) => void
  onFiltersChange: (filters: CommunityFilterOptions) => void
  onPostViewChange: (view: CommunityPostView) => void
}

export function CommunityDiscoveryBar({
  filters,
  postView,
  exportPosts,
  onSearch,
  onFiltersChange,
  onPostViewChange,
}: CommunityDiscoveryBarProps) {
  const activePreset = getDiscoveryPreset(filters)

  return (
    <div className="mb-5 space-y-3 @sm/main:mb-6">
      <div className="flex flex-col gap-2 @xl/main:flex-row @xl/main:items-center">
        <SearchBar
          onSearch={onSearch}
          placeholder="Search questions by title, topic, or author…"
          className="min-w-0 flex-1"
          debounceMs={300}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="community-sort">
            Sort questions
          </label>
          <select
            id="community-sort"
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostVoted">Most voted</option>
            <option value="mostCommented">Most discussed</option>
          </select>
          <AdvancedFilters filters={filters} onFiltersChange={onFiltersChange} />
          <ExportButton data={exportPosts} filename="community-posts" />
          <div
            className="inline-flex shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-600 dark:bg-neutral-900/60"
            role="group"
            aria-label="Post layout"
          >
            {(
              [
                { id: 'list' as const, label: 'List', icon: FiList },
                { id: 'card' as const, label: 'Cards', icon: FiGrid },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onPostViewChange(id)}
                title={label}
                aria-pressed={postView === id}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition @sm/main:px-3 @sm/main:text-sm ${
                  postView === id
                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                <span className="hidden @sm/main:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRESETS.map(({ id, label, hint }) => {
          const selected = activePreset === id
          return (
            <button
              key={id}
              type="button"
              title={hint}
              aria-pressed={selected}
              onClick={() => onFiltersChange(filtersForPreset(id, filters))}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition @sm/main:text-sm ${
                selected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
