import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { useNotificationsQuery, type AppNotification } from './useNotificationsQuery'
import { browserNotificationService } from '../utils/browserNotifications'
import { pickAlerts } from '../utils/notificationAlerts'
import { setDesktopUnreadCount } from '../utils/desktopNative'

const WATERMARK_KEY_PREFIX = 'bountyhub-alerts-watermark:'

function readWatermark(userId: string): number | null {
  try {
    const raw = localStorage.getItem(WATERMARK_KEY_PREFIX + userId)
    const value = raw ? Number(raw) : NaN
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeWatermark(userId: string, value: number): void {
  try {
    localStorage.setItem(WATERMARK_KEY_PREFIX + userId, String(value))
  } catch {
    /* storage unavailable */
  }
}

function showAlert(n: AppNotification): void {
  const postId = n.navigation?.id
  if (n.type === 'bounty') {
    void browserNotificationService.showBountyNotification(n.title, n.message, postId)
  } else if (n.type === 'answer' && postId) {
    void browserNotificationService.showAnswerNotification(n.title, n.message, postId)
  } else if (n.type === 'comment' && postId) {
    void browserNotificationService.showCommentNotification(n.title, n.message, postId)
  } else {
    void browserNotificationService.showNotification(n.title, {
      body: n.message,
      tag: `notification-${n.id}`,
      data: { url: n.navigation?.url || '/', type: n.type },
    })
  }
}

/**
 * Mounted once at the app root, so alerts keep working on every route and while the desktop window is
 * hidden in the tray. After each poll (every 30s; desktop keeps polling in the background):
 * - pops an OS/browser alert for each new answer, accepted answer/bounty, comment or system message,
 *   or one summary if several arrived at once (see `pickAlerts`);
 * - mirrors the unread count onto the desktop tray icon, dock/taskbar badge and tray tooltip.
 *
 * The watermark is stored per user, so restarting the app never replays alerts already shown.
 */
export function useNotificationAlerts(): void {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const { notifications, dataUpdatedAt } = useNotificationsQuery(Boolean(user))

  const unreadCount = userId ? notifications.filter((n) => !n.read).length : 0
  useEffect(() => {
    void setDesktopUnreadCount(unreadCount)
  }, [unreadCount])

  useEffect(() => {
    if (!userId || !dataUpdatedAt) return
    const decision = pickAlerts(notifications, readWatermark(userId))
    // Advance the watermark even when alerts are off, so switching them on later doesn't replay a backlog.
    writeWatermark(userId, decision.watermark)
    if (!browserNotificationService.isEnabled()) return
    if (decision.summary) {
      void browserNotificationService.showNotification(decision.summary.title, {
        body: decision.summary.body,
        tag: 'bountyhub-summary',
        data: { url: '/', type: 'system' },
      })
      return
    }
    decision.individual.forEach(showAlert)
    // Re-run only when a poll lands, not when the list identity changes for other reasons.
  }, [userId, dataUpdatedAt])
}
