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
        isQualityVote: false
      }
    });

    // Get total votes for the comment
    const totalVotes = await prisma.vote.count({
      where: {
        commentId: commentId,
        voteType: 'COMMENT',
        isQualityVote: false
      }
    });

    return json({
      success: true,
      voted: !!vote,
      votes: totalVotes
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
      return json({ error: 'Invalid vote value' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First, check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: true
      }
    });

    if (!comment) {
      return json({ error: 'Comment not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        commentId: commentId,
        voteType: 'COMMENT',
        isQualityVote: false
      }
    });

    let updatedComment;
    
    try {
      if (value === 0) {
        // Remove vote
        if (existingVote) {
          await prisma.vote.delete({
            where: { id: existingVote.id }
          });

          // Update comment vote count
          updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
              upvotes: {
                decrement: existingVote.value === 1 ? 1 : 0
              },
              downvotes: {
                decrement: existingVote.value === -1 ? 1 : 0
              }
            }
          });
        } else {
          // No vote to remove, return current state
          updatedComment = await prisma.comment.findUnique({
            where: { id: commentId }
          });
        }
      } else {
        if (existingVote) {
          // Update existing vote
          await prisma.vote.update({
            where: { id: existingVote.id },
            data: { value }
          });

          // Update comment vote count
          updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
              upvotes: {
                increment: value === 1 ? 1 : -1
              },
              downvotes: {
                increment: value === -1 ? 1 : -1
              }
            }
          });
        } else {
          // Create new vote
          await prisma.vote.create({
            data: {
              userId: user.id,
              commentId: commentId,
              value,
              voteType: 'COMMENT',
              isQualityVote: false,
              postId: null,
              answerId: null
            }
          });

          // Update comment vote count
          updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
              upvotes: {
                increment: value === 1 ? 1 : 0
              },
              downvotes: {
                increment: value === -1 ? 1 : 0
              }
            }
          });
        }

        // Award reputation points for upvoting/downvoting
        if (value === 1) {
          await addReputationPoints(
            comment.authorId,
            REPUTATION_POINTS.COMMENT_UPVOTED,
            'COMMENT_UPVOTED',
            commentId
          );
        } else if (value === -1) {
          await addReputationPoints(
            comment.authorId,
            REPUTATION_POINTS.COMMENT_DOWNVOTED,
            'COMMENT_DOWNVOTED',
            commentId
          );
        }
      }

      if (!updatedComment) {
        throw new Error('Failed to update comment');
      }

      return json({ 
        success: true,
        upvotes: updatedComment.upvotes,
        downvotes: updatedComment.downvotes,
        userVote: value
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return json({ 
        error: 'Failed to update vote',
        details: dbError instanceof Error ? dbError.message : 'Database error'
      }, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in action:', error);
    return json({ 
      error: 'Failed to process vote',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 