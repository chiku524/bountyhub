import { inArray, sql } from 'drizzle-orm'
import { notifications, users } from '../../drizzle/schema'
import { isNotificationTypeEnabled, type NotificationType } from './notificationPreferences'
import { extractMentions, mentionSnippet } from './mentions'

export type { NotificationType }

export interface CreateNotificationParams {
  db: any
  userId: string
  type: NotificationType
  title: string
  message: string
  navigationType?: 'post' | 'home' | 'profile' | 'wallet' | 'chat'
  navigationId?: string
  navigationUrl?: string
}

/**
 * Creates a notification for a user, unless they turned that type of alert off in Settings → Notifications.
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
    if (!(await isNotificationTypeEnabled(db, userId, type))) return
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
    message: `Your answer was accepted and you received ${bountyAmount} BBUX bounty for "${postTitle}"`,
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
export interface NotifyMentionsParams {
  db: any
  /** The content that may contain @mentions (Markdown or plain text). */
  text: string
  authorId: string
  authorUsername: string
  /** Where the mention happened, e.g. `an answer on "Title"` or `Global Chat`. */
  where: string
  navigationType: 'post' | 'chat'
  navigationId?: string
  navigationUrl: string
  /** When set, only these users can be notified (e.g. members of a private room). */
  allowedUserIds?: ReadonlySet<string>
  /** User ids that must not get a mention notification (e.g. already notified another way). */
  excludeUserIds?: ReadonlySet<string>
  /** Usernames (any case) already mentioned before an edit, so they are not notified twice. */
  previousText?: string
}

/**
 * Notifies every user @mentioned in `text` (except the author). Unknown usernames are ignored.
 * Never throws: a failed notification must not fail the message or answer that triggered it.
 * Returns the ids of the users who were notified.
 */
export async function notifyMentionedUsers({
  db,
  text,
  authorId,
  authorUsername,
  where,
  navigationType,
  navigationId,
  navigationUrl,
  allowedUserIds,
  excludeUserIds,
  previousText,
}: NotifyMentionsParams): Promise<string[]> {
  try {
    const before = new Set(extractMentions(previousText ?? '').map((n) => n.toLowerCase()))
    const names = extractMentions(text)
      .map((n) => n.toLowerCase())
      .filter((n) => !before.has(n))
    if (names.length === 0) return []

    const mentioned: { id: string }[] = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(sql`lower(${users.username})`, names))

    const recipients = [...new Set(mentioned.map((u) => u.id))].filter(
      (id) => id !== authorId && !excludeUserIds?.has(id) && (!allowedUserIds || allowedUserIds.has(id))
    )
    if (recipients.length === 0) return []

    const snippet = mentionSnippet(text)
    const now = new Date()
    await db.insert(notifications).values(
      recipients.map((userId) => ({
        id: crypto.randomUUID(),
        userId,
        type: 'mention',
        title: `${authorUsername} mentioned you`,
        message: snippet ? `${authorUsername} mentioned you in ${where}: "${snippet}"` : `${authorUsername} mentioned you in ${where}`,
        read: false,
        navigationType,
        navigationId: navigationId || null,
        navigationUrl,
        createdAt: now,
        updatedAt: now,
      }))
    )
    return recipients
  } catch (error) {
    console.error('Error creating mention notifications:', error)
    return []
  }
}
