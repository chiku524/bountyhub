import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'

interface Notification {
  id: string
  userId: string
  type: 'comment' | 'vote' | 'answer' | 'bounty' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  navigation?: {
    type: 'post' | 'home' | 'profile' | 'wallet'
    id?: string
    url: string
  }
}

export interface NotificationsRef {
  toggle: () => void
}

interface NotificationsProps {
  onUnreadCountChange?: (count: number) => void
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const Notifications = forwardRef<NotificationsRef, NotificationsProps>(({ onUnreadCountChange }, ref) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [popupStyle, setPopupStyle] = useState<{ left?: string; right?: string; top: string }>({ top: '0px' })

  useImperativeHandle(ref, () => ({
    toggle: handleToggle
  }))

  // Fetch notifications on mount and when popup opens
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications()
    }
  }, [user, isOpen])

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount)
    }
  }, [notifications, onUnreadCountChange])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/notifications`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, { 
        method: 'POST',
        credentials: 'include'
      })
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, { 
        method: 'POST',
        credentials: 'include'
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    await markAsRead(notification.id)
    
    // Close the notifications popup
    setIsOpen(false)
    
    // Navigate to the appropriate page
    if (notification.navigation) {
      navigate(notification.navigation.url)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleToggle = () => {
    if (!isOpen) {
      // Find the notifications button
      const notificationsButton = document.querySelector('[data-notifications-button]')
      if (notificationsButton) {
        const buttonRect = notificationsButton.getBoundingClientRect()
        
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const popupWidth = 320 // w-80 = 320px
        const popupHeight = 384 // max-h-96 = 384px (plus header height)
        const margin = 8 // ml-2 = 8px
        
        // Calculate available space on both sides
        const spaceOnRight = viewportWidth - buttonRect.right - margin
        const spaceOnLeft = buttonRect.left - margin
        
        // Calculate vertical positioning to prevent overflow
        let topPosition = buttonRect.top - 50 // Raise the popup by 50px
        const bottomSpace = viewportHeight - (topPosition + popupHeight)
        
        // If there's not enough space at the bottom, adjust the top position
        if (bottomSpace < 20) { // 20px minimum margin from bottom
          topPosition = viewportHeight - popupHeight - 20
        }
        
        // Ensure the popup doesn't go above the viewport
        if (topPosition < 20) {
          topPosition = 20
        }
        
        // Calculate popup position
        let newPopupStyle: { left?: string; right?: string; top: string }
        
        // Position on the side with more space, default to right
        if (spaceOnRight >= popupWidth) {
          newPopupStyle = {
            left: `${buttonRect.right + margin}px`,
            top: `${topPosition}px`
          }
        } else if (spaceOnLeft >= popupWidth) {
          newPopupStyle = {
            right: `${viewportWidth - buttonRect.left + margin}px`,
            top: `${topPosition}px`
          }
        } else {
          // If neither side has enough space, position on the side with more space
          if (spaceOnRight > spaceOnLeft) {
            newPopupStyle = {
              left: `${buttonRect.right + margin}px`,
              top: `${topPosition}px`
            }
          } else {
            newPopupStyle = {
              right: `${viewportWidth - buttonRect.left + margin}px`,
              top: `${topPosition}px`
            }
          }
        }
        
        setPopupStyle(newPopupStyle)
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed w-80 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-[10000]"
          style={popupStyle}
        >
          {!user ? (
            <div className="p-6 text-center text-gray-400">
              <div className="mb-2">
                <svg className="w-8 h-8 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-lg font-semibold">Sign in to view notifications</div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-neutral-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
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
                  <div className="p-4 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-500/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.read ? 'bg-gray-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-white">
                                {notification.title}
                              </h4>
                              {notification.navigation && (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
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