import { logoUrl } from './logoUrl'

// Browser Notification Service
export const BROWSER_ALERTS_PREF_KEY = 'bountyhub-browser-alerts'

export class BrowserNotificationService {
  private permission: NotificationPermission = 'default'
  private enabled: boolean = false

  constructor() {
    this.checkPermission()
  }

  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    this.permission = Notification.permission
    return this.permission
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      this.enabled = true
      return true
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission()
      this.permission = permission
      this.enabled = permission === 'granted'
      return this.enabled
    }

    return false
  }

  /** True once the OS/browser permission is granted and the user hasn't switched alerts off in Settings. */
  isEnabled(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    this.permission = Notification.permission
    return this.permission === 'granted' && this.userPreference() !== 'off'
  }

  /** 'default' = never asked; lets the UI offer an explicit opt-in instead of prompting on login. */
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
    return Notification.permission
  }

  userPreference(): 'on' | 'off' {
    try {
      return localStorage.getItem(BROWSER_ALERTS_PREF_KEY) === 'off' ? 'off' : 'on'
    } catch {
      return 'on'
    }
  }

  setUserPreference(value: 'on' | 'off'): void {
    try {
      localStorage.setItem(BROWSER_ALERTS_PREF_KEY, value)
    } catch {
      /* storage unavailable */
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.isEnabled()) {
      return
    }

    const fullLogoUrl = typeof window !== 'undefined' ? `${window.location.origin}${logoUrl}` : logoUrl
    const defaultOptions: NotificationOptions = {
      icon: fullLogoUrl,
      badge: fullLogoUrl,
      tag: 'bountyhub-notification',
      requireInteraction: false,
      ...options
    }

    try {
      // Use Service Worker registration if available (e.g. when SW was previously registered)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.showNotification(title, defaultOptions)
          return
        }
      }
      new Notification(title, defaultOptions)
    } catch (_error) {
      new Notification(title, defaultOptions)
    }
  }

  async showBountyNotification(
    title: string,
    message: string,
    postId?: string,
    bountyAmount?: number
  ): Promise<void> {
    const notificationTitle = `💰 ${title}`
    const body = bountyAmount 
      ? `You received ${bountyAmount} BBUX bounty! ${message}`
      : message

    await this.showNotification(notificationTitle, {
      body,
      tag: `bounty-${postId || 'new'}`,
      data: {
        url: postId ? `/posts/${postId}` : '/community',
        type: 'bounty'
      },
      requireInteraction: true
    })
  }

  async showAnswerNotification(
    title: string,
    message: string,
    postId: string
  ): Promise<void> {
    await this.showNotification(title, {
      body: message,
      tag: `answer-${postId}`,
      data: {
        url: `/posts/${postId}`,
        type: 'answer'
      }
    })
  }

  async showCommentNotification(
    title: string,
    message: string,
    postId: string
  ): Promise<void> {
    await this.showNotification(title, {
      body: message,
      tag: `comment-${postId}`,
      data: {
        url: `/posts/${postId}`,
        type: 'comment'
      }
    })
  }
}

// Singleton instance
export const browserNotificationService = new BrowserNotificationService()

