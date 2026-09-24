/**
 * Community discovery feed tabs (URL-linkable via ?tab=).
 * Each tab maps to server-supported query params in listCommunityPosts.
 */

import type { CommunityFilterOptions } from './communityPosts'

export type CommunityDiscoveryTab = 'trending' | 'new' | 'bounties' | 'unanswered'

export const COMMUNITY_DISCOVERY_TABS: Array<{
  id: CommunityDiscoveryTab
  label: string
  hint: string
}> = [
  { id: 'trending', label: 'Trending', hint: 'High engagement recently' },
  { id: 'new', label: 'New', hint: 'Newest questions first' },
  { id: 'bounties', label: 'Top Bounties', hint: 'Open questions with the highest BBUX rewards' },
  { id: 'unanswered', label: 'Unanswered', hint: 'Open questions with no answers yet' },
]

export const DEFAULT_DISCOVERY_TAB: CommunityDiscoveryTab = 'trending'

export function isCommunityDiscoveryTab(value: string | null | undefined): value is CommunityDiscoveryTab {
  return value === 'trending' || value === 'new' || value === 'bounties' || value === 'unanswered'
}

export function parseDiscoveryTab(value: string | null | undefined): CommunityDiscoveryTab {
  return isCommunityDiscoveryTab(value) ? value : DEFAULT_DISCOVERY_TAB
}

/** Map a discovery tab to server filter/sort params (preserves tags/search elsewhere). */
export function filtersForDiscoveryTab(
  tab: CommunityDiscoveryTab,
  filters: CommunityFilterOptions
): CommunityFilterOptions {
  const next: CommunityFilterOptions = {
    ...filters,
    status: '',
    dateRange: '',
    hasBounty: false,
    unanswered: false,
    sortBy: 'newest',
  }

  switch (tab) {
    case 'trending':
      next.status = 'open'
      next.dateRange = 'month'
      next.sortBy = 'trending'
      break
    case 'new':
      next.sortBy = 'newest'
      break
    case 'bounties':
      next.status = 'open'
      next.hasBounty = true
      next.sortBy = 'highestBounty'
      break
    case 'unanswered':
      next.status = 'open'
      next.unanswered = true
      next.sortBy = 'newest'
      break
  }

  return next
}

/** Infer active tab from filters (null when advanced filters diverge from a preset). */
export function getDiscoveryTab(filters: CommunityFilterOptions): CommunityDiscoveryTab | null {
  const { status, dateRange, hasBounty, unanswered, sortBy } = filters

  if (
    unanswered &&
    status === 'open' &&
    !hasBounty &&
    !dateRange &&
    (sortBy === 'newest' || !sortBy)
  ) {
    return 'unanswered'
  }

  if (
    hasBounty &&
    status === 'open' &&
    !unanswered &&
    !dateRange &&
    sortBy === 'highestBounty'
  ) {
    return 'bounties'
  }

  if (
    status === 'open' &&
    dateRange === 'month' &&
    !hasBounty &&
    !unanswered &&
    sortBy === 'trending'
  ) {
    return 'trending'
  }

  if (
    !status &&
    !dateRange &&
    !hasBounty &&
    !unanswered &&
    (sortBy === 'newest' || !sortBy)
  ) {
    return 'new'
  }

  return null
}

export function discoveryTabFromSearchParam(tabParam: string | null): CommunityDiscoveryTab {
  return parseDiscoveryTab(tabParam)
}

const TAB_LABEL: Record<CommunityDiscoveryTab, string> = {
  trending: 'Trending',
  new: 'New',
  bounties: 'Top Bounties',
  unanswered: 'Unanswered',
}

export function discoveryTabLabel(tab: CommunityDiscoveryTab): string {
  return TAB_LABEL[tab]
}

/** Sort applied by filtersForDiscoveryTab for each tab. */
export function defaultSortForTab(tab: CommunityDiscoveryTab): string {
  switch (tab) {
    case 'trending':
      return 'trending'
    case 'bounties':
      return 'highestBounty'
    case 'new':
    case 'unanswered':
    default:
      return 'newest'
  }
}

function humanSortLabel(sortBy: string): string {
  switch (sortBy) {
    case 'oldest':
      return 'oldest first'
    case 'mostVoted':
      return 'most voted'
    case 'mostCommented':
      return 'most discussed'
    case 'trending':
      return 'trending'
    case 'highestBounty':
      return 'highest bounty'
    case 'newest':
      return 'newest first'
    default:
      return sortBy
  }
}

/**
 * Single clean summary line: "4 questions · Trending".
 * Adds sort/tag extras only when they differ from the tab defaults.
 */
export function formatFeedSummary(
  totalPosts: number,
  activeTab: CommunityDiscoveryTab,
  filters: CommunityFilterOptions
): string {
  if (totalPosts === 0) return 'No questions'

  const parts: string[] = [
    `${totalPosts} question${totalPosts === 1 ? '' : 's'}`,
    discoveryTabLabel(activeTab),
  ]

  const defaultSort = defaultSortForTab(activeTab)
  if (filters.sortBy && filters.sortBy !== defaultSort) {
    parts.push(humanSortLabel(filters.sortBy))
  }

  const tags = filters.selectedTags || []
  if (tags.length === 1) {
    parts.push(tags[0])
  } else if (tags.length > 1) {
    parts.push(`${tags.length} tags`)
  }

  return parts.join(' · ')
}

