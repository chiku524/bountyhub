import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'
import { getDesktopSessionId } from '../utils/authSession'

export interface AppNotification {
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

async function fetchNotificationsList(): Promise<AppNotification[]> {
  // Prefer typed ApiClient (cookies + desktop bearer)
  try {
    return await api.request<AppNotification[]>('/api/notifications')
  } catch {
    // Fallback for older response shapes
    const headers: Record<string, string> = {}
    if (isDesktopApp()) {
      const sid = getDesktopSessionId()
      if (sid) headers.Authorization = `Bearer ${sid}`
    }
    const base = import.meta.env.VITE_API_URL || ''
    const response = await fetch(`${base}/api/notifications`, {
      credentials: 'include',
      headers,
    })
    if (!response.ok) throw new Error('Failed to fetch notifications')
    return response.json()
  }
}

export function useNotificationsQuery(enabled = true) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id ?? ''

  const query = useQuery({
    queryKey: queryKeys.notifications(userId),
    queryFn: fetchNotificationsList,
    enabled: Boolean(user) && enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

  const markRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.request(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      return notificationId
    },
    onSuccess: (notificationId) => {
      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications(userId),
        (prev) => prev?.map((n) => (n.id === notificationId ? { ...n, read: true } : n)) ?? []
      )
    },
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.request('/api/notifications/read-all', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications(userId),
        (prev) => prev?.map((n) => ({ ...n, read: true })) ?? []
      )
    },
  })

  return {
    notifications: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
    markAsRead: (id: string) => markRead.mutateAsync(id),
    markAllAsRead: () => markAllRead.mutateAsync(),
  }
}
