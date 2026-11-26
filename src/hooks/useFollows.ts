import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type FollowedTag } from '../utils/api'
import { queryKeys } from '../lib/queryClient'
import { useAuth } from '../contexts/AuthProvider'

/** Tags the signed-in user follows, with an optimistic follow/unfollow toggle. */
export function useFollowedTags() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()
  const key = queryKeys.followedTags(userId)

  const query = useQuery({
    queryKey: key,
    queryFn: () => api.getFollowedTags(),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationFn: (tagName: string) => api.toggleTagFollow(tagName),
    onMutate: async (tagName: string) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FollowedTag[]>(key)
      queryClient.setQueryData<FollowedTag[]>(key, (old = []) =>
        old.some((t) => t.name === tagName)
          ? old.filter((t) => t.name !== tagName)
          : [...old, { id: `pending-${tagName}`, name: tagName, color: '#8B5CF6' }].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
      )
      return { previous }
    },
    onError: (_err, _tagName, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
      // The Following feed depends on followed tags.
      void queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })

  const followedTags = query.data ?? []
  const isFollowing = useCallback(
    (tagName: string) => followedTags.some((t) => t.name === tagName),
    [followedTags]
  )

  return {
    signedIn: Boolean(userId),
    followedTags,
    isLoading: query.isLoading,
    isFollowing,
    toggleFollow: mutation.mutate,
    isToggling: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

/** Whether the signed-in user watches one question, with a toggle. */
export function useWatchStatus(postId: string | undefined) {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()
  const key = queryKeys.watchStatus(userId, postId ?? '')

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const status = await api.getWatchStatus([postId as string])
      return Boolean(status[postId as string])
    },
    enabled: Boolean(userId && postId),
  })

  const mutation = useMutation({
    mutationFn: () => api.toggleWatch(postId as string),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<boolean>(key)
      queryClient.setQueryData<boolean>(key, !previous)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(key, context?.previous ?? false)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(key, data.watching)
      void queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })

  return {
    signedIn: Boolean(userId),
    watching: query.data ?? false,
    isLoading: query.isLoading,
    toggleWatch: () => mutation.mutate(),
    isToggling: mutation.isPending,
  }
}
