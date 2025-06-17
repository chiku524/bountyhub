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
        isQualityVote: true
      }
    });

    // Get total votes for the answer
    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({
        where: {
          answerId: answerId,
          voteType: 'ANSWER',
          isQualityVote: true,
          value: 1
        }
      }),
      prisma.vote.count({
        where: {
          answerId: answerId,
          voteType: 'ANSWER',
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
      return json({ error: 'Invalid vote value' }, { status: 400 });
    }

    // First, check if the answer exists
    const answer = await prisma.answer.findUnique({
      where: { id: answerId }
    });

    if (!answer) {
      return json({ error: 'Answer not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Use a transaction to ensure atomic operations
      const result = await prisma.$transaction(async (tx) => {
        // First, delete any existing vote for this user and answer
        await tx.vote.deleteMany({
          where: {
            userId: user.id,
            answerId: answerId,
            voteType: 'ANSWER',
            isQualityVote: true
          }
        });

        if (value !== 0) {
          // Create new vote
          await tx.vote.create({
            data: {
              userId: user.id,
              answerId: answerId,
              value,
              voteType: 'ANSWER',
              isQualityVote: true,
              postId: null,
              commentId: null
            }
          });
        }

        // Count votes
        const [upvotes, downvotes] = await Promise.all([
          tx.vote.count({
            where: {
              answerId: answerId,
              voteType: 'ANSWER',
              isQualityVote: true,
              value: 1
            }
          }),
          tx.vote.count({
            where: {
              answerId: answerId,
              voteType: 'ANSWER',
              isQualityVote: true,
              value: -1
            }
          })
        ]);

        // Update answer vote counts
        const updatedAnswer = await tx.answer.update({
          where: { id: answerId },
          data: {
            upvotes,
            downvotes
          }
        });

        return {
          answer: updatedAnswer,
          userVote: value
        };
      });

      return json({ 
        success: true,
        upvotes: result.answer.upvotes,
        downvotes: result.answer.downvotes,
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