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

    const postId = params.postId;
    if (!postId) {
      return json({ error: 'Post ID is required' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const isVoting = formData.get('isVoting') === 'true';

    console.log('Processing vote:', { postId, userId: user.id, isVoting });

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

    // Find existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        postId: postId,
        voteType: 'POST',
        isQualityVote: false
      }
    });

    let updatedPost;
    
    try {
      if (isVoting) {
        if (!existingVote) {
          // Create new vote
          await prisma.vote.create({
            data: {
              userId: user.id,
              postId: postId,
              value: 1,
              voteType: 'POST',
              isQualityVote: false,
              commentId: null,
              answerId: null
            }
          });

          // Update post vote count
          updatedPost = await prisma.posts.update({
            where: { id: postId },
            data: {
              visibilityVotes: {
                increment: 1
              }
            },
            select: {
              visibilityVotes: true
            }
          });
        } else {
          // User already voted, return current state
          updatedPost = await prisma.posts.findUnique({
            where: { id: postId },
            select: {
              visibilityVotes: true
            }
          });
        }
      } else {
        if (existingVote) {
          // Delete existing vote
          await prisma.vote.delete({
            where: { id: existingVote.id }
          });

          // Update post vote count
          updatedPost = await prisma.posts.update({
            where: { id: postId },
            data: {
              visibilityVotes: {
                decrement: 1
              }
            },
            select: {
              visibilityVotes: true
            }
          });
        } else {
          // No vote to remove, return current state
          updatedPost = await prisma.posts.findUnique({
            where: { id: postId },
            select: {
              visibilityVotes: true
            }
          });
        }
      }

      if (!updatedPost) {
        throw new Error('Failed to update post');
      }

      console.log('Vote processed successfully:', { 
        postId, 
        newVoteCount: updatedPost.visibilityVotes,
        voted: isVoting 
      });

      return json({ 
        success: true,
        votes: updatedPost.visibilityVotes,
        voted: isVoting
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