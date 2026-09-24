/**
 * Community feed layout preference (list / grid / gallery).
 * Migrates legacy localStorage values: card -> grid, compact -> list.
 */

export type CommunityPostView = 'list' | 'grid' | 'gallery'

export const COMMUNITY_POST_VIEW_KEY = 'bountyhub:community-post-view'

/** Normalize a raw stored value (or UI id) to a current CommunityPostView. */
export function normalizeCommunityPostView(raw: string | null | undefined): CommunityPostView {
  if (raw === 'card' || raw === 'grid') return 'grid'
  if (raw === 'list' || raw === 'compact') return 'list'
  if (raw === 'gallery') return 'gallery'
  return 'list'
}

export function readStoredPostView(): CommunityPostView {
  try {
    return normalizeCommunityPostView(localStorage.getItem(COMMUNITY_POST_VIEW_KEY))
  } catch {
    return 'list'
  }
}

export function persistPostView(view: CommunityPostView): void {
  try {
    localStorage.setItem(COMMUNITY_POST_VIEW_KEY, view)
  } catch {
    /* ignore quota / private mode */
  }
}