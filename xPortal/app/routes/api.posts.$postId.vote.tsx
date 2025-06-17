import { json } from '@remix-run/node';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { prisma } from '~/utils/prisma.server';
import { getUser } from '~/utils/auth.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const postId = params.postId;
    if (!postId) {
      return json({ error: 'Post ID is required' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current vote state
    const vote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        postId: postId,
        voteType: 'POST',
        isQualityVote: false
      }
    });

    // Get total votes for the post
    const totalVotes = await prisma.vote.count({
      where: {
        postId: postId,
        voteType: 'POST',
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

    const postId = params.postId;
    if (!postId) {
      return json({ error: 'Post ID is required' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const isVoting = formData.get('isVoting') === 'true';

    // First, check if the post exists
    const post = await prisma.posts.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return json({ error: 'Post not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use a transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // First, delete any existing vote for this user and post
      await tx.vote.deleteMany({
      where: {
        userId: user.id,
          postId: postId as string,
        voteType: 'POST',
        isQualityVote: false
      }
    });

      if (isVoting) {
        // Create new vote with all required fields set
        await tx.vote.create({
            data: {
              userId: user.id,
            postId: postId as string,
              value: 1,
              voteType: 'POST',
              isQualityVote: false,
              commentId: null,
              answerId: null
            }
          });
      }

      // Count visibility votes (only positive votes)
      const visibilityVotes = await tx.vote.count({
        where: {
          postId: postId as string,
          voteType: 'POST',
          isQualityVote: false,
          value: 1
        }
          });

      // Update post with new vote count
      const updatedPost = await tx.posts.update({
        where: { id: postId as string },
            data: {
          visibilityVotes
            }
          });

      return {
        post: updatedPost,
        userVoted: isVoting
      };
      });

      return json({ 
        success: true,
      votes: result.post.visibilityVotes,
      voted: result.userVoted
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
  } catch (error) {
    return json({ 
      error: 'Failed to process vote',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 