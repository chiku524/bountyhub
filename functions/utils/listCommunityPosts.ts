import { and, asc, desc, eq, gte, inArray, or, sql, type SQL } from 'drizzle-orm'
import {
  bounties,
  comments,
  postTags,
  posts,
  profiles,
  tags,
  users,
  votes,
} from '../../drizzle/schema'

type Db = ReturnType<typeof import('../../src/utils/db').createDb>

export interface ListCommunityPostsParams {
  page: number
  limit: number
  q?: string
  status?: string
  dateRange?: string
  hasBounty?: boolean
  tags?: string[]
  sortBy?: string
}

export interface ListCommunityPostsResult {
  posts: Array<Record<string, unknown>>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

function formatDate(dateValue: unknown): string {
  if (!dateValue) return new Date().toISOString()

  try {
    if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
      return dateValue
    }

    let date: Date
    if (typeof dateValue === 'number') {
      date = new Date(dateValue < 10_000_000_000 ? dateValue * 1000 : dateValue)
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue)
    } else {
      date = dateValue as Date
    }

    if (isNaN(date.getTime())) return new Date().toISOString()
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function buildWhereConditions(params: ListCommunityPostsParams, db: Db): SQL | undefined {
  const conditions: SQL[] = []

  const search = params.q?.trim().toLowerCase()
  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      or(
        sql`lower(${posts.title}) LIKE ${pattern}`,
        sql`lower(${posts.content}) LIKE ${pattern}`,
        sql`lower(${users.username}) LIKE ${pattern}`
      )!
    )
  }

  if (params.status) {
    const normalized = params.status.toUpperCase()
    if (normalized === 'OPEN' || normalized === 'CLOSED' || normalized === 'COMPLETED') {
      conditions.push(eq(posts.status, normalized))
    }
  }

  if (params.dateRange) {
    const now = new Date()
    let cutoff: Date | null = null

    switch (params.dateRange) {
      case 'today':
        cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    if (cutoff) {
      conditions.push(gte(posts.createdAt, cutoff))
    }
  }

  if (params.hasBounty) {
    conditions.push(eq(posts.hasBounty, true))
  }

  if (params.tags && params.tags.length > 0) {
    const taggedPostIds = db
      .select({ id: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(inArray(tags.name, params.tags))

    conditions.push(inArray(posts.id, taggedPostIds))
  }

  if (conditions.length === 0) return undefined
  return and(...conditions)
}

function buildOrderBy(sortBy?: string) {
  switch (sortBy) {
    case 'oldest':
      return asc(posts.createdAt)
    case 'mostVoted':
      return desc(posts.qualityUpvotes)
    case 'mostCommented':
      return desc(
        sql`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.postId} = ${posts.id})`
      )
    default:
      return desc(posts.createdAt)
  }
}

export async function listCommunityPosts(
  db: Db,
  params: ListCommunityPostsParams,
  userId: string | null
): Promise<ListCommunityPostsResult> {
  const validPage = Math.max(1, params.page)
  const validLimit = Math.min(Math.max(1, params.limit), 100)
  const offset = (validPage - 1) * validLimit
  const whereClause = buildWhereConditions(params, db)
  const orderBy = buildOrderBy(params.sortBy)

  const commentCountSql = sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.postId} = ${posts.id})`.as(
    'commentCount'
  )

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))

  const totalPosts = Number(
    (whereClause ? await countQuery.where(whereClause) : await countQuery)[0]?.count || 0
  )

  const basePostsQuery = db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      visibilityVotes: posts.visibilityVotes,
      qualityUpvotes: posts.qualityUpvotes,
      qualityDownvotes: posts.qualityDownvotes,
      hasBounty: posts.hasBounty,
      status: posts.status,
      reward: bounties.amount,
      commentCount: commentCountSql,
      author: {
        id: users.id,
        username: users.username,
        email: users.email,
        profilePicture: profiles.profilePicture,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .leftJoin(bounties, eq(posts.id, bounties.postId))

  const postsWithAuthors = await (whereClause ? basePostsQuery.where(whereClause) : basePostsQuery)
    .orderBy(orderBy)
    .limit(validLimit)
    .offset(offset)

  const postIds = postsWithAuthors.map((post) => post.id)

  const tagsByPostId: Record<string, string[]> = {}
  if (postIds.length > 0) {
    const postTagsData = await db
      .select({
        postId: postTags.postId,
        tagName: tags.name,
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(inArray(postTags.postId, postIds))

    for (const item of postTagsData) {
      if (!item.postId || !item.tagName) continue
      if (!tagsByPostId[item.postId]) tagsByPostId[item.postId] = []
      tagsByPostId[item.postId].push(item.tagName)
    }
  }

  let userVotes: Record<string, number> = {}
  if (userId && postIds.length > 0) {
    const userVotesData = await db
      .select({
        postId: votes.postId,
        value: votes.value,
      })
      .from(votes)
      .where(and(eq(votes.userId, userId), inArray(votes.postId, postIds)))

    userVotes = userVotesData.reduce<Record<string, number>>((acc, vote) => {
      if (vote.postId) acc[vote.postId] = vote.value
      return acc
    }, {})
  }

  const postsWithVotes = postsWithAuthors.map((post) => ({
    ...post,
    userVote: userVotes[post.id] || 0,
    tags: tagsByPostId[post.id] || [],
    commentCount: Number(post.commentCount || 0),
    createdAt: formatDate(post.createdAt),
    updatedAt: formatDate(post.updatedAt),
  }))

  const totalPages = totalPosts === 0 ? 0 : Math.ceil(totalPosts / validLimit)

  return {
    posts: postsWithVotes,
    pagination: {
      page: validPage,
      limit: validLimit,
      total: totalPosts,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    },
  }
}
