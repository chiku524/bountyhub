import type { Post } from '../types'

export interface CommunityFilterOptions {
  status: string
  dateRange: string
  sortBy: string
  hasBounty: boolean
  selectedTags: string[]
}

export function filterCommunityPosts(
  posts: Post[],
  searchQuery: string,
  filters: CommunityFilterOptions
): Post[] {
  let filtered = posts

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.author?.username && post.author.username.toLowerCase().includes(query))
    )
  }

  if (filters.status) {
    filtered = filtered.filter(
      (post) => post.status.toLowerCase() === filters.status.toLowerCase()
    )
  }

  if (filters.dateRange) {
    const now = new Date()
    const postDate = new Date()

    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter((post) => {
          postDate.setTime(new Date(post.createdAt).getTime())
          return postDate.toDateString() === now.toDateString()
        })
        break
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((post) => new Date(post.createdAt) >= weekAgo)
        break
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((post) => new Date(post.createdAt) >= monthAgo)
        break
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((post) => new Date(post.createdAt) >= yearAgo)
        break
      }
    }
  }

  if (filters.selectedTags.length > 0) {
    filtered = filtered.filter((post) => {
      const postTags = post.tags || []
      return filters.selectedTags.some((selectedTag) => postTags.includes(selectedTag))
    })
  }

  if (filters.hasBounty) {
    filtered = filtered.filter((post) => post.reward && post.reward > 0)
  }

  const sorted = [...filtered]
  sorted.sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'mostVoted':
        return (b.qualityUpvotes || 0) - (a.qualityUpvotes || 0)
      case 'mostCommented':
        return (b.commentCount || 0) - (a.commentCount || 0)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return sorted
}
