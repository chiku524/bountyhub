import { json } from '@remix-run/node';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { prisma } from '~/utils/prisma.server';
import { getUser } from '~/utils/auth.server';
import { addReputationPoints, REPUTATION_POINTS } from '~/utils/reputation.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const commentId = params.commentId;
    if (!commentId) {
      return json({ error: 'Comment ID is required' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current vote state
    const vote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        commentId: commentId,
        voteType: 'COMMENT',
        isQualityVote: true
      }
    });

    // Get total votes for the comment
    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({
        where: {
          commentId: commentId,
          voteType: 'COMMENT',
          isQualityVote: true,
          value: 1
        }
      }),
      prisma.vote.count({
        where: {
          commentId: commentId,
          voteType: 'COMMENT',
          isQualityVote: true,
          value: -1
        }
      })
    ]);

    return json({
      success: true,
      userVote: vote?.value || 0,
      upvotes,
      downvotes
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in loader:', error);
    return json({ 
      error: 'Failed to get vote state',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const commentId = params.commentId;
    if (!commentId) {
      return json({ error: 'Comment ID is required' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const value = parseInt(formData.get('value') as string);
    
    if (![-1, 0, 1].includes(value)) {
      return json({ error: 'Invalid vote value' }, { status: 400 });
    }

    // First, check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return json({ error: 'Comment not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Use a transaction to ensure atomic operations
      const result = await prisma.$transaction(async (tx) => {
        // First, delete any existing vote for this user and comment
        await tx.vote.deleteMany({
          where: {
            userId: user.id,
            commentId: commentId,
            voteType: 'COMMENT',
            isQualityVote: true
          }
        });

        if (value !== 0) {
          // Create new vote
          await tx.vote.create({
            data: {
              userId: user.id,
              commentId: commentId,
              value,
              voteType: 'COMMENT',
              isQualityVote: true,
              postId: null,
              answerId: null
            }
          });
        }

        // Count votes
        const [upvotes, downvotes] = await Promise.all([
          tx.vote.count({
            where: {
              commentId: commentId,
              voteType: 'COMMENT',
              isQualityVote: true,
              value: 1
            }
          }),
          tx.vote.count({
            where: {
              commentId: commentId,
              voteType: 'COMMENT',
              isQualityVote: true,
              value: -1
            }
          })
        ]);

        // Update comment vote counts
        const updatedComment = await tx.comment.update({
          where: { id: commentId },
          data: {
            upvotes,
            downvotes
          }
        });

        return {
          comment: updatedComment,
          userVote: value
        };
      });

      return json({ 
        success: true,
        upvotes: result.comment.upvotes,
        downvotes: result.comment.downvotes,
        userVote: result.userVote
      });
    } catch (error) {
      console.error('Error in vote action:', error);
      return json({ 
        error: 'Failed to process vote',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in vote action:', error);
    return json({ 
      error: 'Failed to process vote',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 