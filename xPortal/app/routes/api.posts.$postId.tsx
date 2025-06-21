import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getUser } from "~/utils/auth.server";
import { eq, and } from "drizzle-orm";
import { posts, comments, answers, votes, users, profiles } from "../../drizzle/schema";
import { createDb } from "~/utils/db.server";
import { addReputationPoints, REPUTATION_POINTS } from "~/utils/reputation.server";

interface UpdateData {
  visibilityVotes?: number;
  qualityUpvotes?: number;
  qualityDownvotes?: number;
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  if (!params.postId) {
    throw new Response('Post ID is required', { status: 400 });
  }

  try {
    const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
    const db = createDb(typedContext.env.DB);

    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.postId))
      .limit(1);

    if (!post.length) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    return json({ post: post[0] });
  } catch (error) {
    console.error('Error fetching post:', error);
    return json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { postId } = params;
  
  if (!postId) {
    return json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
    const db = createDb(typedContext.env.DB);
    const user = await getUser(request, db, typedContext.env);
    if (!user) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    switch (action) {
      case 'addComment': {
        const content = formData.get('content') as string;
        const userId = formData.get('userId') as string;
        const answerId = formData.get('answerId') as string;

        if (!content || !userId) {
          return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const comment = await db.insert(comments).values({
          id: crypto.randomUUID(),
          content,
          authorId: userId,
          postId,
          answerId: answerId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        return json({ success: true, comment: comment[0] });
      }

      case 'addAnswer': {
        const content = formData.get('content') as string;
        const userId = formData.get('userId') as string;

        if (!content || !userId) {
          return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const answer = await db.insert(answers).values({
          id: crypto.randomUUID(),
          content,
          authorId: userId,
          postId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        return json({ success: true, answer: answer[0] });
      }

      case 'vote': {
        const userId = formData.get('userId') as string;
        const value = parseInt(formData.get('value') as string);
        const voteType = formData.get('voteType') as string;
        const isQualityVote = formData.get('isQualityVote') === 'true';

        if (!userId || isNaN(value) || !voteType) {
          return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingVote = await db
          .select()
          .from(votes)
          .where(
            and(
              eq(votes.postId, postId),
              eq(votes.userId, userId),
              eq(votes.voteType, voteType)
            )
          )
          .limit(1);

        if (existingVote.length > 0) {
          await db
            .update(votes)
            .set({
              value,
              updatedAt: new Date(),
            })
            .where(eq(votes.id, existingVote[0].id));
        } else {
          await db.insert(votes).values({
            id: crypto.randomUUID(),
            postId,
            userId,
            value,
            voteType,
            isQualityVote,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Calculate vote counts
        const voteCounts = await db
          .select({
            totalVotes: votes.value,
          })
          .from(votes)
          .where(
            and(
              eq(votes.postId, postId),
              eq(votes.voteType, voteType)
            )
          );

        const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.totalVotes, 0);

        // Update post with new vote counts
        const updateData: UpdateData = {};
        if (voteType === 'visibility') {
          updateData.visibilityVotes = totalVotes;
        } else if (voteType === 'quality') {
          const upvotes = voteCounts.filter(v => v.totalVotes > 0).reduce((sum, v) => sum + v.totalVotes, 0);
          const downvotes = voteCounts.filter(v => v.totalVotes < 0).reduce((sum, v) => sum + Math.abs(v.totalVotes), 0);
          updateData.qualityUpvotes = upvotes;
          updateData.qualityDownvotes = downvotes;
        }

        await db
          .update(posts)
          .set(updateData)
          .where(eq(posts.id, postId));

        return json({ success: true, totalVotes });
      }

      case 'updatePost': {
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const userId = formData.get('userId') as string;

        if (!title || !content || !userId) {
          return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const post = await db
          .select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);

        if (!post.length || post[0].authorId !== userId) {
          return json({ error: 'Unauthorized' }, { status: 401 });
        }

        await db
          .update(posts)
          .set({
            title,
            content,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));

        return json({ success: true });
      }

      case 'updateComment': {
        const content = formData.get('content') as string;
        const commentId = formData.get('commentId') as string;
        const userId = formData.get('userId') as string;

        if (!content || !commentId || !userId) {
          return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const comment = await db
          .select()
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!comment.length || comment[0].authorId !== userId) {
          return json({ error: 'Unauthorized' }, { status: 401 });
        }

        await db
          .update(comments)
          .set({
            content,
            updatedAt: new Date(),
          })
          .where(eq(comments.id, commentId));

        return json({ success: true });
      }

      case 'updateAnswer': {
        const content = formData.get('content') as string;
        const answerId = formData.get('answerId') as string;
        const userId = formData.get('userId') as string;

        if (!content || !answerId || !userId) {
          return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const answer = await db
          .select()
          .from(answers)
          .where(eq(answers.id, answerId))
          .limit(1);

        if (!answer.length || answer[0].authorId !== userId) {
          return json({ error: 'Unauthorized' }, { status: 401 });
        }

        await db
          .update(answers)
          .set({
            content,
            updatedAt: new Date(),
          })
          .where(eq(answers.id, answerId));

        return json({ success: true });
      }

      case 'comment': {
        const content = formData.get('content') as string;
        if (!content) {
          return json({ error: 'Comment content is required' }, { status: 400 });
        }
        if (!params.postId) {
          return json({ error: 'Post ID is required' }, { status: 400 });
        }
        const commentId = crypto.randomUUID();
        await db.insert(comments).values({
          id: commentId,
          content,
          authorId: user.id,
          postId: params.postId,
          upvotes: 0,
          downvotes: 0,
          answerId: null
        });
        // Fetch author and profile
        const author = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
        const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
        // Award reputation points for commenting
        await addReputationPoints(
          db,
          user.id,
          REPUTATION_POINTS.COMMENT_CREATED,
          'COMMENT_CREATED',
          commentId
        );
        return json({
          success: true,
          comment: {
            id: commentId,
            content,
            author: {
              id: author[0]?.id,
              username: author[0]?.username,
              profilePicture: profile[0]?.profilePicture || null,
              profile: profile[0] ? { profilePicture: profile[0].profilePicture } : null
            },
            upvotes: 0,
            downvotes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userVote: 0
          }
        });
      }

      case 'answer': {
        const content = formData.get('content') as string;
        if (!content) {
          return json({ error: 'Answer content is required' }, { status: 400 });
        }
        if (!params.postId) {
          return json({ error: 'Post ID is required' }, { status: 400 });
        }
        const answerId = crypto.randomUUID();
        await db.insert(answers).values({
          id: answerId,
          content,
          postId: params.postId,
          authorId: user.id,
          isAccepted: false,
          upvotes: 0,
          downvotes: 0
        });
        // Fetch author and profile
        const author = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
        const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
        // Award reputation points for answering
        await addReputationPoints(
          db,
          user.id,
          REPUTATION_POINTS.ANSWER_CREATED,
          'ANSWER_CREATED',
          answerId
        );
        return json({
          success: true,
          answer: {
            id: answerId,
            content,
            author: {
              id: author[0]?.id,
              username: author[0]?.username,
              profilePicture: profile[0]?.profilePicture || null,
              profile: profile[0] ? { profilePicture: profile[0].profilePicture } : null
            },
            upvotes: 0,
            downvotes: 0,
            isAccepted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userVote: 0
          }
        });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return json({ error: 'Failed to process action' }, { status: 500 });
  }
}

export default function PostsPostId() {
  return null;
}

