import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'
import { browserNotificationService } from '../utils/browserNotifications'
import { useNotificationsQuery, type AppNotification } from '../hooks/useNotificationsQuery'

export type Notification = AppNotification

export interface NotificationsRef {
  toggle: () => void
}

interface NotificationsProps {
  onUnreadCountChange?: (count: number) => void
}

export const Notifications = forwardRef<NotificationsRef, NotificationsProps>(({ onUnreadCountChange }, ref) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notifications, loading, refetch, markAsRead, markAllAsRead } = useNotificationsQuery(Boolean(user))
  const [isOpen, setIsOpen] = useState(false)
  const [popupStyle, setPopupStyle] = useState<{ left?: string; right?: string; top: string }>({ top: '0px' })
  const popupRef = useRef<HTMLDivElement>(null)
  const notifWasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      notifWasOpenRef.current = true
      return
    }
    if (notifWasOpenRef.current) {
      notifWasOpenRef.current = false
      const btn = document.querySelector<HTMLElement>(
        '[data-notifications-button-topnav], [data-notifications-button]',
      )
      btn?.focus()
    }
  }, [isOpen])

  useImperativeHandle(ref, () => ({
    toggle: handleToggle
  }))

  useEffect(() => {
    if (user) {
      void browserNotificationService.requestPermission()
    }
  }, [user])

  useEffect(() => {
    if (user && isOpen) {
      void refetch()
    }
  }, [user, isOpen, refetch])

  useEffect(() => {
    if (!user || notifications.length === 0) return

    const unreadNotifications = notifications.filter((n) => !n.read)

    if (unreadNotifications.length > 0 && browserNotificationService.isEnabled()) {
      const latest = unreadNotifications[0]
      const isRecent = new Date(latest.createdAt).getTime() > Date.now() - 60000

      if (latest.type === 'bounty' || isRecent) {
        if (latest.type === 'bounty') {
          browserNotificationService.showBountyNotification(
            latest.title,
            latest.message,
            latest.navigation?.id,
            undefined
          )
        } else if (latest.type === 'answer') {
          browserNotificationService.showAnswerNotification(
            latest.title,
            latest.message,
            latest.navigation?.id || ''
          )
        } else if (latest.type === 'comment') {
          browserNotificationService.showCommentNotification(
            latest.title,
            latest.message,
            latest.navigation?.id || ''
          )
        } else {
          browserNotificationService.showNotification(latest.title, {
            body: latest.message,
            data: {
              url: latest.navigation?.url || '/',
              type: latest.type,
            },
          })
        }
      }
    }
  }, [notifications, user])

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    onUnreadCountChange?.(unreadCount)
  }, [unreadCount, onUnreadCountChange])

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id)
    setIsOpen(false)
    if (notification.navigation) {
      navigate(notification.navigation.url)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      const sidebarButton = document.querySelector('[data-notifications-button]') as HTMLElement
      const topNavButton = document.querySelector('[data-notifications-button-topnav]') as HTMLElement
      const notificationsButton = sidebarButton || topNavButton

      if (notificationsButton) {
        const buttonRect = notificationsButton.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const popupWidth = 320
        const popupHeight = 400
        const margin = 16
        const isTopNav = !!topNavButton
        let newPopupStyle: { left?: string; right?: string; top: string }

        if (isTopNav) {
          let topPosition = buttonRect.bottom + margin
          if (topPosition + popupHeight > viewportHeight - margin) {
            topPosition = buttonRect.top - popupHeight - margin
            if (topPosition < margin) topPosition = margin
          }
          newPopupStyle = {
            right: `${viewportWidth - buttonRect.right}px`,
            top: `${topPosition}px`,
          }
        } else {
          let topPosition = buttonRect.top + buttonRect.height / 2 - popupHeight / 2
          if (topPosition < margin) topPosition = margin
          if (topPosition + popupHeight > viewportHeight - margin) {
            topPosition = viewportHeight - popupHeight - margin
          }
          const leftPosition = buttonRect.right + margin
          if (leftPosition + popupWidth > viewportWidth - margin) {
            newPopupStyle = { right: `${margin}px`, top: `${topPosition}px` }
          } else {
            newPopupStyle = { left: `${leftPosition}px`, top: `${topPosition}px` }
          }
        }

        setPopupStyle(newPopupStyle)
      }
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && popupRef.current && !popupRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        const sidebarButton = document.querySelector('[data-notifications-button]')
        const topNavButton = document.querySelector('[data-notifications-button-topnav]')
        const notificationsButton = sidebarButton || topNavButton
        if (notificationsButton && (notificationsButton.contains(target) || notificationsButton === target)) {
          return
        }
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10000 text-neutral-900 dark:text-white"
          style={popupStyle}
        >
          {!user ? (
            <div className="p-6 text-center text-neutral-500 dark:text-gray-400">
              <div className="mb-2">
                <svg className="w-8 h-8 mx-auto text-neutral-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-neutral-900 dark:text-white">Sign in to view notifications</div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        void markAllAsRead()
                      }}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500 dark:text-gray-400">No notifications</div>
                ) : (
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-500/10 dark:bg-blue-500/10' : ''
                        }`}
                        onClick={() => {
                          void handleNotificationClick(notification)
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-neutral-400 dark:bg-gray-500' : 'bg-blue-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                                {notification.title}
                              </h4>
                              {notification.navigation && (
                                <svg className="w-4 h-4 text-neutral-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-neutral-400 dark:text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
})
