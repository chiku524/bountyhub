import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { prisma } from '~/utils/prisma.server';
import { getUser } from '~/utils/auth.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const postId = params.postId;
  if (!postId) {
    return json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const post = await prisma.posts.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profile: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    return json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return json({ error: 'Failed to fetch post' }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request);
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postId = params.postId;
  if (!postId) {
    return json({ error: 'Post ID is required' }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    switch (action) {
      case 'comment': {
        const content = formData.get('content') as string;
        if (!content) {
          return json({ error: 'Comment content is required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
          data: {
            content,
            authorId: user.id,
            postId,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profile: true,
              },
            },
          },
        });

        return json({ comment });
      }

      case 'answer': {
        const content = formData.get('content') as string;
        if (!content) {
          return json({ error: 'Answer content is required' }, { status: 400 });
        }

        const answer = await prisma.answer.create({
          data: {
            content,
            authorId: user.id,
            postId,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profile: true,
              },
            },
          },
        });

        return json({ answer });
      }

      case 'vote': {
        const value = parseInt(formData.get('value') as string);
        const targetType = formData.get('targetType') as 'post' | 'comment' | 'answer';
        const targetId = formData.get('targetId') as string;

        if (!targetId || !targetType || !value) {
          return json({ error: 'Invalid vote parameters' }, { status: 400 });
        }

        // Set voteType string for the Vote model
        const voteType = targetType.toUpperCase();

        // Check if user has already voted
        const existingVote = await prisma.vote.findFirst({
          where: {
            userId: user.id,
            voteType,
            ...(targetType === 'post' ? { postId: targetId } :
                targetType === 'comment' ? { commentId: targetId } :
                { answerId: targetId }),
          },
        });

        if (existingVote) {
          // Update existing vote
          await prisma.vote.update({
            where: { id: existingVote.id },
            data: { value },
          });
        } else {
          // Create new vote
          await prisma.vote.create({
            data: {
              userId: user.id,
              postId: targetId,
              value: 1,
              voteType: 'POST',
              isQualityVote: false,
              commentId: null,
              answerId: null
            }
          });
        }

        // Update vote counts
        const voteCounts = await prisma.vote.groupBy({
          by: ['value'],
          where: {
            voteType,
            ...(targetType === 'post' ? { postId: targetId } :
                targetType === 'comment' ? { commentId: targetId } :
                { answerId: targetId }),
          },
          _count: true,
        });

        const upvotes = voteCounts.find(v => v.value === 1)?._count || 0;
        const downvotes = voteCounts.find(v => v.value === -1)?._count || 0;

        // Update the target's vote counts
        if (targetType === 'post') {
          await prisma.posts.update({
            where: { id: targetId },
            data: { 
              qualityUpvotes: upvotes,
              qualityDownvotes: downvotes
            },
          });
        } else if (targetType === 'comment') {
          await prisma.comment.update({
            where: { id: targetId },
            data: { upvotes, downvotes },
          });
        } else {
          await prisma.answer.update({
            where: { id: targetId },
            data: { upvotes, downvotes },
          });
        }

        return json({ upvotes, downvotes });
      }

      case 'accept-answer': {
        const answerId = formData.get('answerId') as string;
        if (!answerId) {
          return json({ error: 'Answer ID is required' }, { status: 400 });
        }

        // Check if user is the post author
        const post = await prisma.posts.findUnique({
          where: { id: postId },
          select: { authorId: true },
        });

        if (!post || post.authorId !== user.id) {
          return json({ error: 'Only the post author can accept answers' }, { status: 403 });
        }

        // Update answer
        const answer = await prisma.answer.update({
          where: { id: answerId },
          data: { isAccepted: true },
        });

        return json({ answer });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return json({ error: 'Failed to process action' }, { status: 500 });
  }
}; 