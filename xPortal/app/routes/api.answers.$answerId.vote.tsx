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

    const answerId = params.answerId;
    if (!answerId) {
      return json({ error: 'Answer ID is required' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current vote state
    const vote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        answerId: answerId,
        voteType: 'ANSWER',
        isQualityVote: false
      }
    });

    // Get total votes for the answer
    const totalVotes = await prisma.vote.count({
      where: {
        answerId: answerId,
        voteType: 'ANSWER',
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

    const answerId = params.answerId;
    if (!answerId) {
      return json({ error: 'Answer ID is required' }, { 
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

    // First, check if the answer exists
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        author: true
      }
    });

    if (!answer) {
      return json({ error: 'Answer not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        answerId: answerId,
        voteType: 'ANSWER',
        isQualityVote: false
      }
    });

    let updatedAnswer;
    
    try {
      if (value === 0) {
        // Remove vote
        if (existingVote) {
          await prisma.vote.delete({
            where: { id: existingVote.id }
          });

          // Update answer vote count
          updatedAnswer = await prisma.answer.update({
            where: { id: answerId },
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
          updatedAnswer = await prisma.answer.findUnique({
            where: { id: answerId }
          });
        }
      } else {
        if (existingVote) {
          // Update existing vote
          await prisma.vote.update({
            where: { id: existingVote.id },
            data: { value }
          });

          // Update answer vote count
          updatedAnswer = await prisma.answer.update({
            where: { id: answerId },
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
              answerId: answerId,
              value,
              voteType: 'ANSWER',
              isQualityVote: false,
              postId: null,
              commentId: null
            }
          });

          // Update answer vote count
          updatedAnswer = await prisma.answer.update({
            where: { id: answerId },
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
            answer.authorId,
            REPUTATION_POINTS.ANSWER_UPVOTED,
            'ANSWER_UPVOTED',
            answerId
          );
        } else if (value === -1) {
          await addReputationPoints(
            answer.authorId,
            REPUTATION_POINTS.ANSWER_DOWNVOTED,
            'ANSWER_DOWNVOTED',
            answerId
          );
        }
      }

      if (!updatedAnswer) {
        throw new Error('Failed to update answer');
      }

      return json({ 
        success: true,
        upvotes: updatedAnswer.upvotes,
        downvotes: updatedAnswer.downvotes,
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