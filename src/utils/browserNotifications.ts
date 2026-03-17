import { logoUrl } from './logoUrl'

// Browser Notification Service
export class BrowserNotificationService {
  private permission: NotificationPermission = 'default'
  private enabled: boolean = false

  constructor() {
    this.checkPermission()
  }

  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications')
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

  isEnabled(): boolean {
    return this.enabled && this.permission === 'granted'
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

