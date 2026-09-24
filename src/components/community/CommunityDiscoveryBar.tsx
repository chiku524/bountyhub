import { useCallback, useEffect, useRef, useState } from 'react'
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

const SCROLL_HIDE =
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

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
  const tabScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateTabOverflow = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(max > 2 && el.scrollLeft < max - 2)
  }, [])

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

  useEffect(() => {
    updateTabOverflow()
    const el = tabScrollRef.current
    if (!el) return
    const onScroll = () => updateTabOverflow()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateTabOverflow) : null
    ro?.observe(el)
    window.addEventListener('resize', updateTabOverflow)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro?.disconnect()
      window.removeEventListener('resize', updateTabOverflow)
    }
  }, [updateTabOverflow])

  // Keep the active tab visible when it changes (e.g. deep-link / arrow keys).
  useEffect(() => {
    const btn = document.getElementById(`community-tab-${activeTab}`)
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
    requestAnimationFrame(updateTabOverflow)
  }, [activeTab, updateTabOverflow])

  const selectedTags = filters.selectedTags || []

  const toggleTag = (tagName: string) => {
    const next = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName]
    onFiltersChange({ ...filters, selectedTags: next })
  }

  const focusAndSelectTab = (id: CommunityDiscoveryTab) => {
    onTabChange(id)
    requestAnimationFrame(() => {
      const el = document.getElementById(`community-tab-${id}`)
      el?.focus()
      el?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
    })
  }

  return (
    <div className="mb-5 space-y-3 @sm/main:mb-6">
      {/* Sticky discovery tabs — stay visible while scrolling the feed */}
      <div
        className={`${isDesktop ? 'sticky top-0' : 'sticky top-16'} z-20 -mx-1 border-b border-neutral-200/80 bg-white/90 px-1 py-2 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/90`}
      >
        <div className="relative">
          <div
            ref={tabScrollRef}
            role="tablist"
            aria-label="Discovery feed"
            className={`flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-0.5 ${SCROLL_HIDE}`}
          >
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
                  tabIndex={selected ? 0 : -1}
                  onClick={() => focusAndSelectTab(id)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') {
                      return
                    }
                    e.preventDefault()
                    const idx = COMMUNITY_DISCOVERY_TABS.findIndex((t) => t.id === id)
                    let nextIdx = idx
                    if (e.key === 'ArrowRight') {
                      nextIdx = (idx + 1) % COMMUNITY_DISCOVERY_TABS.length
                    } else if (e.key === 'ArrowLeft') {
                      nextIdx = (idx - 1 + COMMUNITY_DISCOVERY_TABS.length) % COMMUNITY_DISCOVERY_TABS.length
                    } else if (e.key === 'Home') {
                      nextIdx = 0
                    } else if (e.key === 'End') {
                      nextIdx = COMMUNITY_DISCOVERY_TABS.length - 1
                    }
                    focusAndSelectTab(COMMUNITY_DISCOVERY_TABS[nextIdx].id)
                  }}
                  className={`snap-start shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 @sm/main:px-3.5 ${
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
          {canScrollLeft && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80"
              aria-hidden
            />
          )}
          {canScrollRight && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80"
              aria-hidden
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 @xl/main:flex-row @xl/main:items-center">
        <SearchBar
          onSearch={onSearch}
          placeholder="Search questions by title, topic, or author…"
          className="min-w-0 w-full flex-1"
          debounceMs={300}
        />
        <div className="flex flex-wrap items-center gap-2">
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
          className={`flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-0.5 ${SCROLL_HIDE}`}
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
                className={`snap-start shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition @sm/main:text-sm ${
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
