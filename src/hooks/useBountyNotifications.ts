import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { browserNotificationService } from '../utils/browserNotifications'
import { api } from '../utils/api'

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const knownBountiesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      // Clean up polling when user logs out
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    // Request notification permission
    browserNotificationService.requestPermission()

    // Function to check for bounty updates
    const checkBountyUpdates = async () => {
      try {
        // Fetch user's bounties (posts they created with bounties)
        const response = await api.request<{ posts: Array<{ id: string; bounties?: BountyStatus[] }> }>('/api/posts?hasBounty=true&limit=50')
        
        if (!response || !response.posts) return

        const posts = Array.isArray(response) ? response : response.posts
        const currentTime = new Date()

        // Check each post's bounties for status changes
        for (const post of posts) {
          if (!post.bounties || !Array.isArray(post.bounties)) continue

          for (const bounty of post.bounties) {
            const bountyKey = `${bounty.postId}-${bounty.id}`

            // Skip if we've already seen this bounty
            if (knownBountiesRef.current.has(bountyKey)) {
              // Check if status changed to COMPLETED
              if (bounty.status === 'COMPLETED' && bounty.winnerId) {
                // Check if this is a new completion (notified less than 5 minutes ago)
                const lastChecked = lastCheckedRef.current
                const timeSinceLastCheck = currentTime.getTime() - lastChecked.getTime()

                // Only notify if status changed recently (within last check interval)
                if (timeSinceLastCheck < 60000) { // 1 minute
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

            // Track this bounty
            knownBountiesRef.current.add(bountyKey)

            // Notify about new active bounties (if user is watching)
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
    }

    // Initial check
    checkBountyUpdates()

    // Poll every 30 seconds for bounty updates
    pollingIntervalRef.current = setInterval(checkBountyUpdates, 30000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [user])

  return {
    checkPermission: () => browserNotificationService.requestPermission(),
    isEnabled: browserNotificationService.isEnabled()
  }
}

