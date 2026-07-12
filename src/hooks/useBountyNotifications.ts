import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { browserNotificationService } from '../utils/browserNotifications'
import { api } from '../utils/api'
import { useVisibilityAwareInterval } from './useVisibilityAwareInterval'

interface BountyStatus {
  id: string
  postId: string
  status: 'ACTIVE' | 'COMPLETED' | 'REFUNDED'
  amount: number
  winnerId?: string
}

export function useBountyNotifications() {
  const { user } = useAuth()
  const lastCheckedRef = useRef<Date>(new Date())
  const knownBountiesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    void browserNotificationService.requestPermission()
  }, [user])

  const checkBountyUpdates = useCallback(async () => {
    if (!user) return
    try {
      const response = await api.request<{
        posts: Array<{ id: string; bounties?: BountyStatus[] }>
      }>('/api/posts?hasBounty=true&limit=50')

      if (!response || !response.posts) return

      const posts = Array.isArray(response) ? response : response.posts
      const currentTime = new Date()

      for (const post of posts) {
        if (!post.bounties || !Array.isArray(post.bounties)) continue

        for (const bounty of post.bounties) {
          const bountyKey = `${bounty.postId}-${bounty.id}`

          if (knownBountiesRef.current.has(bountyKey)) {
            if (bounty.status === 'COMPLETED' && bounty.winnerId) {
              const timeSinceLastCheck =
                currentTime.getTime() - lastCheckedRef.current.getTime()

              if (timeSinceLastCheck < 60000) {
                await browserNotificationService.showBountyNotification(
                  'Bounty Completed!',
                  `Your bounty on "${post.id}" has been completed`,
                  bounty.postId,
                  bounty.amount
                )
              }
            }
            continue
          }

          knownBountiesRef.current.add(bountyKey)

          if (bounty.status === 'ACTIVE') {
            await browserNotificationService.showBountyNotification(
              'New Active Bounty',
              `A bounty of ${bounty.amount} BBUX is active on your post`,
              bounty.postId,
              bounty.amount
            )
          }
        }
      }

      lastCheckedRef.current = currentTime
    } catch (error) {
      console.error('Error checking bounty updates:', error)
    }
  }, [user])

  useVisibilityAwareInterval(
    () => {
      void checkBountyUpdates()
    },
    30000,
    Boolean(user)
  )

  return {
    checkPermission: () => browserNotificationService.requestPermission(),
    isEnabled: browserNotificationService.isEnabled(),
  }
}
