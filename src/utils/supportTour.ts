export type TourAudience = 'guest' | 'signed-in'

export interface TourStep {
  id: string
  title: string
  body: string
  /** CSS selector for the highlighted element. Omit for a centered intro card. */
  selector?: string
  /** Navigate here before highlighting (so the target exists). */
  route?: string
  /** Skip this step unless the audience matches. */
  audience?: TourAudience
  /** Skip on web or desktop. */
  surface?: 'web' | 'desktop'
}

export const TOUR_STORAGE_KEY = 'bountyhub-tour-completed'
export const GUIDE_WELCOMED_KEY = 'bountyhub-guide-welcomed'

/**
 * First-run onboarding: bounty → wallet → Guide (3 steps per audience).
 * Skip / dismiss / complete all persist TOUR_STORAGE_KEY so it never re-shows.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'bounty',
    title: 'Post or answer a bounty',
    body: 'Community is where questions live. Create a bounty with an optional BBUX reward, or answer one to earn. Authors accept the best answer to pay it out.',
    selector: '[data-tour="create-bounty"], [data-tour="community"]',
    route: '/community',
  },
  {
    id: 'wallet',
    title: 'Your BBUX wallet',
    body: 'Track balance, deposits, and withdrawals here. Connect Solana only when you are ready to move funds — everyday bounties use your virtual balance.',
    selector: '[data-tour="wallet"]',
    audience: 'signed-in',
    route: '/wallet',
  },
  {
    id: 'wallet-guest',
    title: 'Your BBUX wallet',
    body: 'Every account gets a virtual BBUX wallet automatically. Sign up to earn from bounties; connect Solana later only if you want to deposit or withdraw.',
    audience: 'guest',
  },
  {
    id: 'guide',
    title: 'Ask Guide anytime',
    body: 'This help button stays with you. Ask how bounties, wallet, or chat work — or say “give me a tour” to replay this walkthrough.',
    selector: '[data-tour="guide"]',
  },
]

export function filterTourSteps(options: {
  isDesktop: boolean
  isAuthenticated: boolean
}): TourStep[] {
  const audience: TourAudience = options.isAuthenticated ? 'signed-in' : 'guest'
  const surface = options.isDesktop ? 'desktop' : 'web'
  return TOUR_STEPS.filter((step) => {
    if (step.audience && step.audience !== audience) return false
    if (step.surface && step.surface !== surface) return false
    return true
  })
}

export function readStorageFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return true
  }
}

export function writeStorageFlag(key: string, value: boolean): void {
  try {
    if (value) localStorage.setItem(key, '1')
    else localStorage.removeItem(key)
  } catch {
    /* ignore quota / private mode */
  }
}
