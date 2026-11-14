/**
 * Plain-language wallet / payout / bounty status for user-facing UI.
 * Raw technical values stay available as secondary detail.
 */

export interface StatusPresentation {
  /** Short plain-language label shown first. */
  label: string
  /** One-line explanation for tooltips / expanders. */
  detail: string
  /** Original status string (normalized). */
  raw: string
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info'
}

const TRANSACTION_STATUS: Record<string, Omit<StatusPresentation, 'raw'>> = {
  pending: {
    label: 'Waiting to confirm',
    detail: 'We have not finished confirming this payment yet.',
    tone: 'warning',
  },
  processing: {
    label: 'Sending payout',
    detail: 'Funds are being sent on-chain. This usually finishes within a minute.',
    tone: 'info',
  },
  completed: {
    label: 'Paid',
    detail: 'This transaction completed successfully.',
    tone: 'success',
  },
  complete: {
    label: 'Paid',
    detail: 'This transaction completed successfully.',
    tone: 'success',
  },
  failed: {
    label: "Didn't go through",
    detail: 'The transfer failed. If BBUX was held, it should return to your balance.',
    tone: 'danger',
  },
  cancelled: {
    label: 'Cancelled',
    detail: 'This transaction was cancelled before it finished.',
    tone: 'neutral',
  },
  refunded: {
    label: 'Refunded',
    detail: 'The amount was returned to your BBUX balance.',
    tone: 'info',
  },
  funded: {
    label: 'Funded',
    detail: 'Bounty funds are locked and ready to pay out when an answer is accepted.',
    tone: 'success',
  },
  paid: {
    label: 'Paid',
    detail: 'The bounty was paid to the accepted answer.',
    tone: 'success',
  },
}

const POST_STATUS: Record<string, Omit<StatusPresentation, 'raw'>> = {
  open: {
    label: 'Open',
    detail: 'This bounty is accepting answers.',
    tone: 'success',
  },
  completed: {
    label: 'Bounty paid',
    detail: 'An answer was accepted and the bounty was paid out.',
    tone: 'warning',
  },
  closed: {
    label: 'Closed',
    detail: 'This post is closed and no longer accepting answers.',
    tone: 'neutral',
  },
}

const BOUNTY_ESCROW_STATUS: Record<string, Omit<StatusPresentation, 'raw'>> = {
  active: {
    label: 'Funded',
    detail: 'Bounty reward is held until an answer is accepted or the bounty expires.',
    tone: 'success',
  },
  claimed: {
    label: 'Paid out',
    detail: 'The bounty was claimed by the accepted answer.',
    tone: 'success',
  },
  refunded: {
    label: 'Refunded',
    detail: 'The bounty amount was returned to the author.',
    tone: 'info',
  },
  expired: {
    label: 'Expired',
    detail: 'The bounty window ended without a payout.',
    tone: 'neutral',
  },
}

function lookup(
  map: Record<string, Omit<StatusPresentation, 'raw'>>,
  status: string,
  fallbackLabel?: string,
): StatusPresentation {
  const raw = (status || '').trim()
  const key = raw.toLowerCase()
  const hit = map[key]
  if (hit) return { ...hit, raw: raw || key }
  const pretty =
    fallbackLabel ||
    (raw
      ? raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Unknown')
  return {
    label: pretty,
    detail: raw ? `Technical status: ${raw}` : 'Status unavailable.',
    raw: raw || 'unknown',
    tone: 'neutral',
  }
}

/** Wallet deposit / withdrawal / payout transaction status. */
export function formatTransactionStatus(status: string): StatusPresentation {
  return lookup(TRANSACTION_STATUS, status)
}

/** Post / Q&A bounty lifecycle status (OPEN / COMPLETED / CLOSED). */
export function formatPostStatus(status: string): StatusPresentation {
  return lookup(POST_STATUS, status)
}

/** Escrow row status when shown to users (ACTIVE / CLAIMED / …). */
export function formatBountyEscrowStatus(status: string): StatusPresentation {
  return lookup(BOUNTY_ESCROW_STATUS, status)
}

export function statusToneClass(tone: StatusPresentation['tone']): string {
  switch (tone) {
    case 'success':
      return 'text-green-600 dark:text-green-400'
    case 'warning':
      return 'text-amber-600 dark:text-amber-400'
    case 'danger':
      return 'text-red-600 dark:text-red-400'
    case 'info':
      return 'text-sky-600 dark:text-sky-400'
    default:
      return 'text-neutral-600 dark:text-neutral-400'
  }
}
