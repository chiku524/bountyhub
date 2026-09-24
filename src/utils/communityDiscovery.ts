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
