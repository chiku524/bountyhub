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

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BountyHub',
    body: 'This short tour points out the main parts of the app. You can skip anytime and ask Guide later from the help button.',
  },
  {
    id: 'home-nav',
    title: 'Find your way around',
    body: 'Use the top bar to jump between features, sign in, and switch light/dark theme.',
    selector: '[data-tour="home-nav"]',
    audience: 'guest',
    surface: 'web',
  },
  {
    id: 'get-started',
    title: 'Create an account',
    body: 'Sign up with email or GitHub. Your BBUX wallet is created automatically — no crypto wallet required to start.',
    selector: '[data-tour="get-started"]',
    audience: 'guest',
    route: '/',
  },
  {
    id: 'top-nav',
    title: 'Your workspace bar',
    body: 'Create a bounty, open Explore, jump with the command palette, and check notifications from here.',
    selector: '[data-tour="top-nav"]',
    audience: 'signed-in',
    surface: 'web',
  },
  {
    id: 'desktop-sidebar',
    title: 'Desktop sidebar',
    body: 'Every main area lives in this sidebar. Collapse it for more space, or press ⌘K / Ctrl+K to jump anywhere.',
    selector: '[data-tour="desktop-sidebar"]',
    audience: 'signed-in',
    surface: 'desktop',
  },
  {
    id: 'create-bounty',
    title: 'Create a bounty',
    body: 'Post a question with an optional BBUX reward. Accept the best answer to pay it out.',
    selector: '[data-tour="create-bounty"]',
    audience: 'signed-in',
    route: '/community',
  },
  {
    id: 'command-palette',
    title: 'Command palette',
    body: 'Press ⌘K or Ctrl+K (or / when you are not typing) to search pages like Wallet, Docs, and Chat.',
    selector: '[data-tour="command-palette"]',
    audience: 'signed-in',
  },
  {
    id: 'community',
    title: 'Community feed',
    body: 'Browse open questions, filter by bounties or unanswered posts, and join the discussion.',
    selector: '[data-tour="community"]',
    route: '/community',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    body: 'Track BBUX, deposits, and withdrawals. Connect Solana only when you are ready to move funds.',
    selector: '[data-tour="wallet"]',
    audience: 'signed-in',
    route: '/wallet',
  },
  {
    id: 'chat',
    title: 'Live chat',
    body: 'The purple bubble opens community chat and team hubs. Each bounty post also has its own room.',
    selector: '[data-tour="chat"]',
    audience: 'signed-in',
  },
  {
    id: 'guide',
    title: 'Guide stays with you',
    body: 'This button is always here. Ask how something works, or say “give me a tour” to replay this walkthrough.',
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
