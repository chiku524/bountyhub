import { useEffect, useState } from 'react'
import { FiGrid, FiImage, FiList } from 'react-icons/fi'
import { isDesktopApp } from '../../utils/desktop'
import { SearchBar } from '../SearchBar'
import { AdvancedFilters } from '../AdvancedFilters'
import { ExportButton } from '../ExportButton'
import { api } from '../../utils/api'
import type { CommunityFilterOptions } from '../../utils/communityPosts'
import type { Post } from '../../types'
import type { CommunityPostView } from '../../utils/communityPostView'
import {
  COMMUNITY_DISCOVERY_TABS,
  filtersForDiscoveryTab,
  getDiscoveryTab,
  type CommunityDiscoveryTab,
} from '../../utils/communityDiscovery'

export type { CommunityPostView, CommunityDiscoveryTab }
export {
  filtersForDiscoveryTab,
  getDiscoveryTab,
  COMMUNITY_DISCOVERY_TABS,
}

/** @deprecated Use CommunityDiscoveryTab / filtersForDiscoveryTab */
export type CommunityDiscoveryPreset = CommunityDiscoveryTab | 'all' | 'open'

/** @deprecated Prefer getDiscoveryTab */
export function getDiscoveryPreset(filters: CommunityFilterOptions): CommunityDiscoveryPreset | null {
  const tab = getDiscoveryTab(filters)
  if (tab) return tab
  const { status, dateRange, hasBounty, unanswered } = filters
  if (status === 'open' && !hasBounty && !dateRange && !unanswered) return 'open'
  if (!status && !dateRange && !hasBounty && !unanswered) return 'all'
  return null
}

/** @deprecated Prefer filtersForDiscoveryTab */
export function filtersForPreset(
  preset: CommunityDiscoveryPreset,
  filters: CommunityFilterOptions
): CommunityFilterOptions {
  if (preset === 'all') {
    return {
      ...filters,
      status: '',
      dateRange: '',
      hasBounty: false,
      unanswered: false,
      sortBy: 'newest',
    }
  }
  if (preset === 'open') {
    return {
      ...filters,
      status: 'open',
      dateRange: '',
      hasBounty: false,
      unanswered: false,
    }
  }
  if (preset === 'new') {
    return filtersForDiscoveryTab('new', filters)
  }
  return filtersForDiscoveryTab(preset, filters)
}

interface TagOption {
  id: string
  name: string
}

interface CommunityDiscoveryBarProps {
  filters: CommunityFilterOptions
  postView: CommunityPostView
  activeTab: CommunityDiscoveryTab
  exportPosts: Post[]
  onSearch: (query: string) => void
  onFiltersChange: (filters: CommunityFilterOptions) => void
  onTabChange: (tab: CommunityDiscoveryTab) => void
  onPostViewChange: (view: CommunityPostView) => void
}

const QUICK_TAG_LIMIT = 8

export function CommunityDiscoveryBar({
  filters,
  postView,
  activeTab,
  exportPosts,
  onSearch,
  onFiltersChange,
  onTabChange,
  onPostViewChange,
}: CommunityDiscoveryBarProps) {
  const isDesktop = isDesktopApp()
  const [tags, setTags] = useState<TagOption[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const all = await api.getTags()
        if (cancelled) return
        const normalized = (all || [])
          .filter((t) => Boolean(t?.id && t?.name))
          .map((t) => ({ id: t.id, name: t.name }))
          .slice(0, QUICK_TAG_LIMIT)
        setTags(normalized)
      } catch {
        if (!cancelled) setTags([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedTags = filters.selectedTags || []

  const toggleTag = (tagName: string) => {
    const next = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName]
    onFiltersChange({ ...filters, selectedTags: next })
  }

  return (
    <div className="mb-5 space-y-3 @sm/main:mb-6">
      {/* Sticky discovery tabs — stay visible while scrolling the feed */}
      <div
        className={`${isDesktop ? 'sticky top-0' : 'sticky top-16'} z-20 -mx-1 border-b border-neutral-200/80 bg-white/90 px-1 py-2 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/90`}
        role="tablist"
        aria-label="Discovery feed"
      >
        <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {COMMUNITY_DISCOVERY_TABS.map(({ id, label, hint }) => {
            const selected = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`community-tab-${id}`}
                aria-selected={selected}
                aria-controls="community-feed"
                title={hint}
                onClick={() => onTabChange(id)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
                  e.preventDefault()
                  const idx = COMMUNITY_DISCOVERY_TABS.findIndex((t) => t.id === id)
                  const delta = e.key === 'ArrowRight' ? 1 : -1
                  const next =
                    COMMUNITY_DISCOVERY_TABS[
                      (idx + delta + COMMUNITY_DISCOVERY_TABS.length) % COMMUNITY_DISCOVERY_TABS.length
                    ]
                  onTabChange(next.id)
                  requestAnimationFrame(() => {
                    document.getElementById(`community-tab-${next.id}`)?.focus()
                  })
                }}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selected
                    ? 'bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

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
            <option value="trending">Trending</option>
            <option value="mostVoted">Most voted</option>
            <option value="mostCommented">Most discussed</option>
            <option value="highestBounty">Highest bounty</option>
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
                { id: 'grid' as const, label: 'Grid', icon: FiGrid },
                { id: 'gallery' as const, label: 'Gallery', icon: FiImage },
              ] as const
            ).map(({ id, label, icon: Icon }, index, all) => (
              <button
                key={id}
                type="button"
                onClick={() => onPostViewChange(id)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
                  e.preventDefault()
                  const delta = e.key === 'ArrowRight' ? 1 : -1
                  const next = all[(index + delta + all.length) % all.length]
                  onPostViewChange(next.id)
                  requestAnimationFrame(() => {
                    const buttons = (e.currentTarget.parentElement?.querySelectorAll('button') ??
                      []) as NodeListOf<HTMLButtonElement>
                    buttons[(index + delta + all.length) % all.length]?.focus()
                  })
                }}
                title={label}
                aria-label={`${label} layout${postView === id ? ' (selected)' : ''}`}
                aria-pressed={postView === id}
                className={`inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition @sm/main:px-3 @sm/main:text-sm ${
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

      {tags.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter by topic"
        >
          {tags.map((tag) => {
            const selected = selectedTags.includes(tag.name)
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTag(tag.name)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition @sm/main:text-sm ${
                  selected
                    ? 'bg-violet-600 text-white dark:bg-violet-500'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-violet-300 hover:text-violet-700 dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300'
                }`}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
