import { notifications } from '../../drizzle/schema'

export type NotificationType = 'comment' | 'vote' | 'answer' | 'bounty' | 'system'

export interface CreateNotificationParams {
  db: any
  userId: string
  type: NotificationType
  title: string
  message: string
  navigationType?: 'post' | 'home' | 'profile' | 'wallet'
  navigationId?: string
  navigationUrl?: string
}

/**
 * Creates a notification for a user
 */
export async function createNotification({
  db,
  userId,
  type,
  title,
  message,
  navigationType,
  navigationId,
  navigationUrl
}: CreateNotificationParams) {
  try {
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      read: false,
      navigationType: navigationType || null,
      navigationId: navigationId || null,
      navigationUrl: navigationUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Creates a notification for a post comment
 */
export async function createCommentNotification(
  db: any,
  postAuthorId: string,
  commenterUsername: string,
  postTitle: string,
  postId: string
) {
  await createNotification({
    db,
    userId: postAuthorId,
    type: 'comment',
    title: 'New comment on your post',
    message: `${commenterUsername} commented on your post "${postTitle}"`,
    navigationType: 'post',
    navigationId: postId,
    navigationUrl: `/posts/${postId}`
  })
}

/**
 * Creates a notification for a post vote
 */
export async function createVoteNotification(
  db: any,
  postAuthorId: string,
  voterUsername: string,
  postTitle: string,
  postId: string,
  isUpvote: boolean
) {
  await createNotification({
    db,
    userId: postAuthorId,
    type: 'vote',
    title: isUpvote ? 'Your post received an upvote' : 'Your post received a downvote',
    message: `${voterUsername} ${isUpvote ? 'upvoted' : 'downvoted'} your post "${postTitle}"`,
    navigationType: 'post',
    navigationId: postId,
    navigationUrl: `/posts/${postId}`
  })
}

/**
 * Creates a notification for a new answer
 */
export async function createAnswerNotification(
  db: any,
  postAuthorId: string,
  answererUsername: string,
  postTitle: string,
  postId: string
) {
  await createNotification({
    db,
    userId: postAuthorId,
    type: 'answer',
    title: 'New answer to your question',
    message: `${answererUsername} answered your question "${postTitle}"`,
    navigationType: 'post',
    navigationId: postId,
    navigationUrl: `/posts/${postId}`
  })
}

/**
 * Creates a notification for bounty awarded
 */
export async function createBountyNotification(
  db: any,
  answerAuthorId: string,
  postTitle: string,
  postId: string,
  bountyAmount: number
) {
  await createNotification({
    db,
    userId: answerAuthorId,
    type: 'bounty',
    title: 'Bounty awarded!',
    message: `Your answer was accepted and you received ${bountyAmount} SOL bounty for "${postTitle}"`,
    navigationType: 'post',
    navigationId: postId,
    navigationUrl: `/posts/${postId}`
  })
}

/**
 * Creates a system notification
 */
export async function createSystemNotification(
  db: any,
  userId: string,
  title: string,
  message: string,
  navigationUrl?: string
) {
  await createNotification({
    db,
    userId,
    type: 'system',
    title,
    message,
    navigationType: navigationUrl ? 'home' : undefined,
    navigationUrl: navigationUrl || undefined
  })
} 