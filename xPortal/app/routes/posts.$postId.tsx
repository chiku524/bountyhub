import { useEffect, useState, useCallback } from 'react';
import { useLoaderData, useParams, useSubmit, useFetcher, Form, useRouteError, isRouteErrorResponse, Link, useActionData } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { getUser } from '~/utils/auth.server';
import { prisma } from '~/utils/prisma.server';
import PostInteractions from '~/components/PostInteractions';
import { Nav } from '~/components/nav';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import type { Comment, Answer, CodeBlock, User, Profile } from "@prisma/client";
import { addReputationPoints, REPUTATION_POINTS } from '~/utils/reputation.server';

type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  userVote: number | null;
  author: {
    id: string;
    username: string;
    profilePicture: string | null;
    profile?: {
      profilePicture: string | null;
    } | null;
  };
};

type AnswerWithAuthor = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  userVote: number | null;
  isAccepted: boolean;
  author: {
    id: string;
    username: string;
    profilePicture: string | null;
    profile?: {
      profilePicture: string | null;
    } | null;
  };
};

type PostWithRelations = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  visibilityVotes: number;
  qualityUpvotes: number;
  qualityDownvotes: number;
  userQualityVote: number;
  userVisibilityVote: number;
  hasBounty: boolean;
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
  author: {
    id: string;
    username: string;
    profile?: {
      profilePicture: string | null;
    } | null;
    profilePicture: string | null;
  };
  comments: CommentWithAuthor[];
  answers: AnswerWithAuthor[];
  codeBlocks: CodeBlock[];
  media: {
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    isScreenRecording: boolean;
  }[];
  bounty: {
    amount: string;
    tokenSymbol: string;
    expiresAt: string;
    status: 'ACTIVE' | 'CLAIMED' | 'REFUNDED' | 'EXPIRED';
  } | null;
};

type CommentResponse = {
  success: boolean;
  comment?: CommentWithAuthor;
  error?: string;
};

type AnswerResponse = {
  success: boolean;
  answer?: AnswerWithAuthor;
  error?: string;
};

type VoteResponse = {
  success: boolean;
  qualityUpvotes: number;
  qualityDownvotes: number;
  userQualityVote: number;
  error?: string;
};

type AcceptAnswerResponse = {
  success: boolean;
  answer?: AnswerWithAuthor;
  error?: string;
  message?: string;
};

type BountyClaimResponse = {
  success: boolean;
  message: string;
  error?: string;
  answer?: AnswerWithAuthor;
};

const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed=';

function getProfilePicture(profilePicture: string | null, username: string): string {
    if (profilePicture) {
        return profilePicture;
    }
    return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await getUser(request);
    const { postId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = 10;

    if (!postId) {
      throw new Response('Post ID is required', { status: 400 });
    }

    // Combine all queries into a single database call
    const [post, userVotes, voteCounts] = await Promise.all([
      prisma.posts.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true
                }
              }
            }
          },
          media: true,
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      profilePicture: true
                    }
                  }
                }
              }
            },
            orderBy: [
              { upvotes: 'desc' },
              { createdAt: 'desc' }
            ],
            skip: (page - 1) * perPage,
            take: perPage
          },
          answers: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      profilePicture: true
                    }
                  }
                }
              }
            },
            orderBy: [
              { isAccepted: 'desc' },
              { upvotes: 'desc' },
              { createdAt: 'desc' }
            ]
          },
          codeBlocks: true,
          votes: {
            where: {
              userId: user?.id || '',
              isQualityVote: true
            }
          },
          bounty: true
        }
      }),
      user ? prisma.vote.findMany({
        where: {
          userId: user.id,
          postId: postId,
          OR: [
            { isQualityVote: true },
            { isQualityVote: false }
          ]
        }
      }) : [],
      prisma.vote.groupBy({
        by: ['isQualityVote', 'value'],
        where: {
          postId: postId,
          isQualityVote: true
        },
        _count: true
      })
    ]);

    if (!post) {
      throw new Response('Post not found', { status: 404 });
    }

    // Get total counts for pagination
    const [totalComments, totalAnswers] = await Promise.all([
      prisma.comment.count({
        where: { postId }
      }),
      prisma.answer.count({
        where: { postId }
      })
    ]);

    // Process vote counts
    const qualityUpvotes = voteCounts.find(v => v.isQualityVote && v.value === 1)?._count || 0;
    const qualityDownvotes = voteCounts.find(v => v.isQualityVote && v.value === -1)?._count || 0;
    const userQualityVote = userVotes.find(v => v.isQualityVote)?.value || 0;
    const userVisibilityVote = userVotes.find(v => !v.isQualityVote)?.value || 0;

    // Fetch all comment and answer IDs
    const commentIds = post.comments.map(c => c.id);
    const answerIds = post.answers.map(a => a.id);

    // Fetch all votes by the current user for these comments and answers
    let commentVotes: { commentId: string; value: number }[] = [];
    let answerVotes: { answerId: string; value: number }[] = [];
    if (user) {
      if (commentIds.length > 0) {
        commentVotes = (await prisma.vote.findMany({
          where: {
            userId: user.id,
            commentId: { in: commentIds },
            voteType: 'COMMENT',
            isQualityVote: true
          },
          select: { commentId: true, value: true }
        })).filter(v => v.commentId !== null) as { commentId: string; value: number }[];
      }
      if (answerIds.length > 0) {
        answerVotes = (await prisma.vote.findMany({
          where: {
            userId: user.id,
            answerId: { in: answerIds },
            voteType: 'ANSWER',
            isQualityVote: true
          },
          select: { answerId: true, value: true }
        })).filter(v => v.answerId !== null) as { answerId: string; value: number }[];
      }
    }

    // Transform the post data
    const transformedPost: PostWithRelations = {
      ...post,
      visibilityVotes: post.visibilityVotes,
      qualityUpvotes,
      qualityDownvotes,
      userQualityVote,
      userVisibilityVote,
      hasBounty: post.hasBounty,
      status: post.status,
      author: {
        ...post.author,
        profilePicture: post.author.profile?.profilePicture || null
      },
      comments: post.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        userVote: commentVotes.find(v => v.commentId === comment.id)?.value || 0,
        author: {
          id: comment.author.id,
          username: comment.author.username,
          profilePicture: comment.author.profile?.profilePicture || null,
          profile: comment.author.profile ? {
            profilePicture: comment.author.profile.profilePicture
          } : null
        }
      })),
      answers: post.answers.map(answer => ({
        ...answer,
        createdAt: answer.createdAt.toISOString(),
        updatedAt: answer.updatedAt.toISOString(),
        userVote: answerVotes.find(v => v.answerId === answer.id)?.value || 0,
        author: {
          id: answer.author.id,
          username: answer.author.username,
          profilePicture: answer.author.profile?.profilePicture || null,
          profile: answer.author.profile ? {
            profilePicture: answer.author.profile.profilePicture
          } : null
        }
      })),
      codeBlocks: post.codeBlocks,
      media: post.media.map(m => ({
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || undefined,
        isScreenRecording: m.isScreenRecording
      })),
      bounty: post.bounty ? {
        amount: post.bounty.amount.toString(),
        tokenSymbol: 'SOL', // Default to SOL since we don't store token symbol
        expiresAt: post.bounty.expiresAt?.toISOString() || '',
        status: post.bounty.status
      } : null
    };

    return json({ 
      post: transformedPost, 
      currentUser: user,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / perPage),
        totalComments,
        totalAnswers
      }
    });
  } catch (error) {
    throw new Response('Failed to load post', { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request);
  if (!user) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }

  const postId = params.postId;
  if (!postId) {
    return json({ error: 'Post ID is required' }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'deletePost': {
      const post = await prisma.posts.findUnique({
        where: { id: postId },
        include: {
          author: true
        }
      });

      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      if (post.author.id !== user.id) {
        return json({ error: 'You can only delete your own posts' }, { status: 403 });
      }

      await prisma.posts.delete({
        where: { id: postId }
      });

      return redirect('/community');
    }
    case 'qualityVote': {
      const value = parseInt(formData.get('value') as string);
      if (![-1, 0, 1].includes(value)) {
        return json({ error: 'Invalid vote value' }, { status: 400 });
      }

      return await prisma.$transaction(async (tx) => {
        // First, delete any existing vote for this user and post
        await tx.vote.deleteMany({
          where: {
            userId: user.id,
            postId: postId,
            voteType: 'POST',
            isQualityVote: true
          }
        });

        if (value !== 0) {
          // Create new vote if value is not 0
          await tx.vote.create({
            data: {
              userId: user.id,
              postId: postId,
              value,
              voteType: 'POST',
              isQualityVote: true,
              commentId: null,
              answerId: null
            }
          });
        }

        // Get updated vote counts
        const [qualityUpvotes, qualityDownvotes] = await Promise.all([
          tx.vote.count({
            where: {
              postId: postId,
              voteType: 'POST',
              isQualityVote: true,
              value: 1
            }
          }),
          tx.vote.count({
            where: {
              postId: postId,
              voteType: 'POST',
              isQualityVote: true,
              value: -1
            }
          })
        ]);

        // Update post vote counts
        await tx.posts.update({
          where: { id: postId },
          data: {
            qualityUpvotes,
            qualityDownvotes
          }
        });

        return json({
          success: true,
          qualityUpvotes,
          qualityDownvotes,
          userQualityVote: value
        });
      });
    }
    case 'visibilityVote': {
      const isVoting = formData.get('isVoting') === 'true';

      // Use a transaction to ensure atomic operations
      const result = await prisma.$transaction(async (tx) => {
        // Get current vote state
        const existingVote = await tx.vote.findFirst({
          where: {
            userId: user.id,
            postId,
            voteType: 'POST',
            isQualityVote: false
          }
        });

        // Update vote record
        if (isVoting) {
          if (!existingVote) {
            await tx.vote.create({
              data: {
                userId: user.id,
                postId,
                value: 1, // Always 1 for visibility votes
                voteType: 'POST',
                isQualityVote: false,
                commentId: null,
                answerId: null
              }
            });
          }
        } else {
          if (existingVote) {
            await tx.vote.delete({
              where: { id: existingVote.id }
            });
          }
        }

        // Update post visibility votes
        const visibilityVotes = await tx.vote.count({
          where: {
            postId,
            voteType: 'POST',
            isQualityVote: false,
            value: 1 // Only count positive votes
          }
        });

        const updatedPost = await tx.posts.update({
          where: { id: postId },
          data: {
            visibilityVotes
          }
        });

        return {
          post: updatedPost,
          userVisibilityVote: isVoting
        };
      });

      return json({
        success: true,
        visibilityVotes: result.post.visibilityVotes,
        userVisibilityVote: result.userVisibilityVote
      });
    }
    case 'comment': {
      const content = formData.get('content') as string;
      if (!content) {
        return json({ error: 'Comment content is required' }, { status: 400 });
      }

      if (!params.postId) {
        return json({ error: 'Post ID is required' }, { status: 400 });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: user.id,
          postId: params.postId,
          upvotes: 0,
          downvotes: 0,
          answerId: null
        },
        include: {
          author: {
            include: {
              profile: true
            }
          }
        }
      });

      // Award reputation points for commenting
      await addReputationPoints(
        user.id,
        REPUTATION_POINTS.COMMENT_CREATED,
        'COMMENT_CREATED',
        comment.id
      );

      return json({
        success: true,
        comment: {
          ...comment,
          author: {
            ...comment.author,
            profilePicture: comment.author.profile?.profilePicture || null
          }
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

      const answer = await prisma.answer.create({
        data: {
          content,
          postId: params.postId,
          authorId: user.id,
          isAccepted: false,
          upvotes: 0,
          downvotes: 0
        },
        include: {
          author: {
            include: {
              profile: true
            }
          }
        }
      });

      // Award reputation points for answering a question
      await addReputationPoints(
        user.id,
        REPUTATION_POINTS.ANSWER_CREATED,
        'ANSWER_CREATED',
        answer.id
      );

      return json({
        success: true,
        answer: {
          ...answer,
          author: {
            ...answer.author,
            profilePicture: answer.author.profile?.profilePicture || null
          }
        }
      });
    }
    case 'acceptAnswer': {
      const answerId = formData.get('answerId') as string;
      if (!answerId) {
        return json({ error: 'Answer ID is required' }, { status: 400 });
      }

      return await prisma.$transaction(async (tx) => {
        // First, unaccept any previously accepted answers
        await tx.answer.updateMany({
          where: {
            postId: postId,
            isAccepted: true
          },
          data: {
            isAccepted: false
          }
        });

        // Accept the new answer
        const updatedAnswer = await tx.answer.update({
          where: { id: answerId },
          data: {
            isAccepted: true
          },
          include: {
            author: {
              include: {
                profile: true
              }
            }
          }
        });

        // Add reputation points to the answer author
        await addReputationPoints(
          updatedAnswer.authorId,
          REPUTATION_POINTS.ANSWER_ACCEPTED,
          'ANSWER_ACCEPTED',
          updatedAnswer.id
        );

        return json({
          success: true,
          answer: {
            ...updatedAnswer,
            author: {
              ...updatedAnswer.author,
              profilePicture: updatedAnswer.author.profile?.profilePicture || null
            }
          }
        });
      });
    }
    case 'commentVote': {
      const commentId = formData.get('commentId') as string;
      const value = parseInt(formData.get('value') as string);
      
      if (!commentId || ![-1, 0, 1].includes(value)) {
        return json({ error: 'Invalid parameters' }, { status: 400 });
      }

      // Retry logic for deadlocks
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          return await prisma.$transaction(async (tx) => {
            // Delete existing vote first
            await tx.vote.deleteMany({
              where: {
                userId: user.id,
                commentId: commentId,
                voteType: 'COMMENT',
                isQualityVote: true
              }
            });

            // Create new vote if value is not 0
            if (value !== 0) {
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

            // Get updated vote counts
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
            await tx.comment.update({
              where: { id: commentId },
              data: {
                upvotes,
                downvotes
              }
            });

            return json({
              success: true,
              upvotes,
              downvotes,
              userVote: value
            });
          }, {
            maxWait: 5000, // 5 seconds max wait
            timeout: 10000  // 10 seconds timeout
          });
        } catch (error: any) {
          retryCount++;
          if (error.code === 'P2034' && retryCount < maxRetries) {
            // Deadlock detected, wait a bit and retry
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
            continue;
          }
          // If it's not a deadlock or we've exhausted retries, throw the error
          throw error;
        }
      }

      return json({ error: 'Vote operation failed after retries' }, { status: 500 });
    }
    case 'answerVote': {
      const answerId = formData.get('answerId') as string;
      const value = parseInt(formData.get('value') as string);
      
      if (!answerId || ![-1, 0, 1].includes(value)) {
        return json({ error: 'Invalid parameters' }, { status: 400 });
      }

      // Retry logic for deadlocks
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          return await prisma.$transaction(async (tx) => {
            // Delete existing vote first
            await tx.vote.deleteMany({
              where: {
                userId: user.id,
                answerId: answerId,
                voteType: 'ANSWER',
                isQualityVote: true
              }
            });

            // Create new vote if value is not 0
            if (value !== 0) {
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

            // Get updated vote counts
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
            await tx.answer.update({
              where: { id: answerId },
              data: {
                upvotes,
                downvotes
              }
            });

            return json({
              success: true,
              upvotes,
              downvotes,
              userVote: value
            });
          }, {
            maxWait: 5000, // 5 seconds max wait
            timeout: 10000  // 10 seconds timeout
          });
        } catch (error: any) {
          retryCount++;
          if (error.code === 'P2034' && retryCount < maxRetries) {
            // Deadlock detected, wait a bit and retry
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
            continue;
          }
          // If it's not a deadlock or we've exhausted retries, throw the error
          throw error;
        }
      }

      return json({ error: 'Vote operation failed after retries' }, { status: 500 });
    }
    case 'claim_bounty': {
      const answerId = formData.get('answerId') as string;
      if (!answerId) {
        return json({ error: 'Answer ID is required' }, { status: 400 });
      }

      // Get the answer and its author
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        include: {
          author: {
            select: {
              id: true,
              username: true
            }
          },
          post: {
            include: {
              bounty: true
            }
          }
        }
      });

      if (!answer) {
        return json({ error: 'Answer not found' }, { status: 404 });
      }

      if (!answer.post.bounty) {
        return json({ error: 'No bounty found for this post' }, { status: 404 });
      }

      if (answer.post.bounty.status !== 'ACTIVE') {
        return json({ error: 'Bounty is not active' }, { status: 400 });
      }

      if (answer.post.authorId !== user.id) {
        return json({ error: 'Only the post author can claim the bounty' }, { status: 403 });
      }

      // Use a transaction to ensure atomic operations
      return await prisma.$transaction(async (tx) => {
        // Update the answer as accepted
        await tx.answer.update({
          where: { id: answerId },
          data: { isAccepted: true },
        });

        // Update the post status
        await tx.posts.update({
          where: { id: postId },
          data: { status: 'COMPLETED' },
        });

        // Update the bounty status to claimed and set winner
        await tx.bounty.update({
          where: { postId },
          data: {
            status: 'CLAIMED',
            winnerId: answer.authorId,
          },
        });

        // Import VirtualWalletService at the top of the file
        const { VirtualWalletService } = await import('~/utils/virtual-wallet.server');
        
        // Transfer bounty tokens to the answer author
        const bountyAmount = answer.post.bounty!.amount;
        await VirtualWalletService.claimBounty(
          answer.authorId,
          bountyAmount,
          answer.post.bounty!.id
        );

        return json({ 
          success: true,
          message: `Bounty of ${bountyAmount} PORTAL transferred to ${answer.author.username}`,
          answer: {
            ...answer,
            isAccepted: true
          }
        });
      });
    }
    case 'refund_bounty': {
      const post = await prisma.posts.findUnique({
        where: { id: postId },
        include: { bounty: true },
      });

      if (!post?.bounty) {
        return json({ error: 'No bounty found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'Only the post author can refund the bounty' }, { status: 403 });
      }

      // Update the bounty status to refunded
      await prisma.bounty.update({
        where: { postId },
        data: {
          status: 'REFUNDED',
        },
      });

      return json({ success: true });
    }
    default: {
      return json({ error: 'Invalid action' }, { status: 400 });
    }
  }
};

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
        <Nav />
        <div className="flex-1 overflow-y-auto">
          <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4">
            <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20">
              <p className="text-red-500">{error.data}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20">
            <p className="text-red-500">An unexpected error occurred</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { post, currentUser, pagination } = useLoaderData<typeof loader>();
  const [answers, setAnswers] = useState<AnswerWithAuthor[]>(post.answers);
  const [comments, setComments] = useState<CommentWithAuthor[]>(post.comments);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const submit = useSubmit();
  const fetcher = useFetcher();
  const actionData = useActionData<AnswerResponse | CommentResponse | BountyClaimResponse>();

  // Show success message when bounty is claimed
  useEffect(() => {
    if (actionData?.success && 'message' in actionData && actionData.message) {
      setSuccessMessage(actionData.message);
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [actionData]);

  // Helper function to sort answers by accepted status, then upvotes
  const sortAnswers = (answers: AnswerWithAuthor[]) => {
    return [...answers].sort((a, b) => {
      // Accepted answers first
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      // Then by upvotes (highest first)
      if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Helper function to sort comments by upvotes
  const sortComments = (comments: CommentWithAuthor[]) => {
    return [...comments].sort((a, b) => {
      // First by upvotes (highest first)
      if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Handle server response for new answers and comments
  useEffect(() => {
    if (actionData?.success) {
      if ('answer' in actionData && actionData.answer) {
        // Replace the optimistic answer with the real one and maintain sorting
        setAnswers(prev => {
          const filtered = prev.filter(a => !a.id.startsWith('temp-'));
          const newAnswers = [actionData.answer!, ...filtered];
          return sortAnswers(newAnswers);
        });
      } else if ('comment' in actionData && actionData.comment) {
        // Replace the optimistic comment with the real one and maintain sorting
        setComments(prev => {
          const filtered = prev.filter(c => !c.id.startsWith('temp-'));
          const newComments = [actionData.comment!, ...filtered];
          return sortComments(newComments);
        });
      } else if ('message' in actionData && actionData.message && actionData.message.includes('Bounty')) {
        // Handle bounty claim - update the answer as accepted
        if ('answer' in actionData && actionData.answer) {
          setAnswers(prev => {
            const updatedAnswers = prev.map(a => 
              a.id === actionData.answer!.id 
                ? { ...a, isAccepted: true }
                : a
            );
            return sortAnswers(updatedAnswers);
          });
        }
      }
    }
  }, [actionData]);

  const handleAnswerVote = async (answerId: string, value: number) => {
    // Prevent rapid clicks
    const voteKey = `answer-${answerId}`;
    if (votingStates[voteKey]) return;
    
    setVotingStates(prev => ({ ...prev, [voteKey]: true }));

    // Optimistic update with correct vote count logic
    setAnswers(prev => {
      const updatedAnswers = prev.map(answer => {
        if (answer.id === answerId) {
          const currentVote = answer.userVote || 0;
          let newUpvotes = answer.upvotes;
          let newDownvotes = answer.downvotes;

          // Remove current vote
          if (currentVote === 1) {
            newUpvotes -= 1;
          } else if (currentVote === -1) {
            newDownvotes -= 1;
          }

          // Add new vote
          if (value === 1) {
            newUpvotes += 1;
          } else if (value === -1) {
            newDownvotes += 1;
          }

          return {
            ...answer,
            userVote: value,
            upvotes: newUpvotes,
            downvotes: newDownvotes
          };
        }
        return answer;
      });
      return sortAnswers(updatedAnswers);
    });

    const formData = new FormData();
    formData.append('action', 'answerVote');
    formData.append('answerId', answerId);
    formData.append('value', value.toString());
    submit(formData, { method: 'post' });

    // Reset voting state after a delay
    setTimeout(() => {
      setVotingStates(prev => ({ ...prev, [voteKey]: false }));
    }, 1000);
  };

  const handleCommentVote = async (commentId: string, value: number) => {
    // Prevent rapid clicks
    const voteKey = `comment-${commentId}`;
    if (votingStates[voteKey]) return;
    
    setVotingStates(prev => ({ ...prev, [voteKey]: true }));

    // Optimistic update with correct vote count logic
    setComments(prev => {
      const updatedComments = prev.map(comment => {
        if (comment.id === commentId) {
          const currentVote = comment.userVote || 0;
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;

          // Remove current vote
          if (currentVote === 1) {
            newUpvotes -= 1;
          } else if (currentVote === -1) {
            newDownvotes -= 1;
          }

          // Add new vote
          if (value === 1) {
            newUpvotes += 1;
          } else if (value === -1) {
            newDownvotes += 1;
          }

          return {
            ...comment,
            userVote: value,
            upvotes: newUpvotes,
            downvotes: newDownvotes
          };
        }
        return comment;
      });
      return sortComments(updatedComments);
    });

    const formData = new FormData();
    formData.append('action', 'commentVote');
    formData.append('commentId', commentId);
    formData.append('value', value.toString());
    submit(formData, { method: 'post' });

    // Reset voting state after a delay
    setTimeout(() => {
      setVotingStates(prev => ({ ...prev, [voteKey]: false }));
    }, 1000);
  };

  const handleComment = async (content: string) => {
    if (!currentUser) return;
    
    // Create optimistic comment
    const optimisticComment: CommentWithAuthor = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        profile: currentUser.profilePicture ? { profilePicture: currentUser.profilePicture } : null
      }
    };

    // Add to local state immediately
    setComments(prev => {
      const newComments = [optimisticComment, ...prev];
      return sortComments(newComments);
    });

    // Submit to server
    const formData = new FormData();
    formData.append('action', 'comment');
    formData.append('content', content);
    submit(formData, { method: 'post' });
  };

  const handleAnswer = async (content: string) => {
    if (!currentUser) return;
    
    // Create optimistic answer
    const optimisticAnswer: AnswerWithAuthor = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      isAccepted: false,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        profile: currentUser.profilePicture ? { profilePicture: currentUser.profilePicture } : null
      }
    };

    // Add to local state immediately
    setAnswers(prev => {
      const newAnswers = [optimisticAnswer, ...prev];
      return sortAnswers(newAnswers);
    });

    // Submit to server
    const formData = new FormData();
    formData.append('action', 'answer');
    formData.append('content', content);
    submit(formData, { method: 'post' });
  };

  const handleAcceptAnswer = async (answerId: string) => {
    const formData = new FormData();
    formData.append('action', 'acceptAnswer');
    formData.append('answerId', answerId);
    submit(formData, { method: 'post' });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.append('action', 'deletePost');
    submit(formData, { method: 'post' });
  };

  const handleQualityVote = async (value: number) => {
    const formData = new FormData();
    formData.append('action', 'qualityVote');
    formData.append('value', value.toString());
    submit(formData, { method: 'post' });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-800 rounded-lg p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img
                  src={getProfilePicture(post.author.profilePicture, post.author.username)}
                  alt={`${post.author.username}'s avatar`}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Posted by {post.author.username}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {currentUser?.id === post.author.id && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Post Content */}
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-gray-300">{post.content}</p>
              
              {/* Render Media */}
              {post.media && post.media.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Media</h3>
                  <div className={`grid gap-4 ${
                    post.media.length === 1 ? 'grid-cols-1' :
                    post.media.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    post.media.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {post.media.map((mediaItem: PostWithRelations['media'][0]) => (
                      <div key={mediaItem.id} className="rounded-lg overflow-hidden bg-neutral-800/50 border border-neutral-700/50">
                        {mediaItem.type === 'IMAGE' && (
                          <img
                            src={mediaItem.url}
                            alt="Post media"
                            className="w-full h-64 object-cover rounded-t-lg"
                          />
                        )}
                        {mediaItem.type === 'VIDEO' && (
                          <video
                            controls
                            className="w-full h-64 object-cover rounded-t-lg"
                            poster={mediaItem.thumbnailUrl}
                          >
                            <source src={mediaItem.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        {mediaItem.type === 'AUDIO' && (
                          <div className="p-4">
                            <audio controls className="w-full">
                              <source src={mediaItem.url} type="audio/mpeg" />
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        )}
                        {(mediaItem.isScreenRecording || mediaItem.type === 'VIDEO') && (
                          <div className="px-3 py-2 bg-neutral-700/50 border-t border-neutral-600/50">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-violet-400">
                                {mediaItem.isScreenRecording ? '📹 Screen Recording' : '🎥 Video'}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {mediaItem.type}
                              </span>
                            </div>
                          </div>
                        )}
                        {mediaItem.type === 'IMAGE' && (
                          <div className="px-3 py-2 bg-neutral-700/50 border-t border-neutral-600/50">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-violet-400">🖼️ Image</span>
                              <span className="text-gray-400 text-xs">
                                {mediaItem.type}
                              </span>
                            </div>
                          </div>
                        )}
                        {mediaItem.type === 'AUDIO' && (
                          <div className="px-3 py-2 bg-neutral-700/50 border-t border-neutral-600/50">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-violet-400">🎵 Audio</span>
                              <span className="text-gray-400 text-xs">
                                {mediaItem.type}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Code Blocks */}
              {post.codeBlocks && post.codeBlocks.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Code</h3>
                  {post.codeBlocks.map((codeBlock: CodeBlock) => (
                    <div key={codeBlock.id} className="rounded-lg overflow-hidden">
                      <SyntaxHighlighter
                        language={codeBlock.language}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                        showLineNumbers={true}
                        wrapLines={true}
                      >
                        {codeBlock.code}
                      </SyntaxHighlighter>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Interactions */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => handleQualityVote(post.userQualityVote === 1 ? 0 : 1)}
                className={`p-2 transition-colors ${
                  post.userQualityVote === 1
                    ? 'text-violet-400'
                    : 'text-gray-400 hover:text-violet-400'
                }`}
              >
                <FiArrowUp className="h-5 w-5" />
              </button>
              <span className="text-gray-300">{post.qualityUpvotes - post.qualityDownvotes}</span>
              <button
                onClick={() => handleQualityVote(post.userQualityVote === -1 ? 0 : -1)}
                className={`p-2 transition-colors ${
                  post.userQualityVote === -1
                    ? 'text-violet-400'
                    : 'text-gray-400 hover:text-violet-400'
                }`}
              >
                <FiArrowDown className="h-5 w-5" />
              </button>
            </div>

            {/* Bounty Section */}
            {post.bounty && (
              <div className="mt-8 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg shadow-lg shadow-cyan-500/10">
                <h2 className="text-lg font-medium text-cyan-300 mb-2 flex items-center">
                  <span className="mr-2">💰</span>
                  Bounty
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 font-semibold text-lg">
                      {post.bounty.amount} {post.bounty.tokenSymbol}
                    </p>
                    <p className="text-sm text-cyan-200/70">
                      Expires: {new Date(post.bounty.expiresAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-cyan-200/70">
                    Status: <span className="text-cyan-300 font-medium">{post.bounty.status}</span>
                  </div>
                </div>
                {/* Refund Bounty Button (only for post author, only if bounty is active) */}
                {post.bounty.status === 'ACTIVE' && post.authorId === currentUser?.id && (
                  <div className="mt-4 flex justify-end">
                    <Form method="post">
                      <input type="hidden" name="action" value="refund_bounty" />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
                      >
                        Refund Bounty
                      </button>
                    </Form>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-500">{successMessage}</p>
              </div>
            )}

            {/* Answers Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Answers ({pagination.totalAnswers})</h2>
              
              {/* Answer Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const textarea = form.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea.value.trim()) {
                  handleAnswer(textarea.value);
                  textarea.value = ''; // Clear the textarea after posting
                }
              }} className="mb-6">
                <textarea
                  placeholder="Write an answer..."
                  className="w-full p-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  rows={6}
                />
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Post Answer
                </button>
              </form>

              {/* Answers List with Scrolling */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {sortAnswers(answers).map((answer: AnswerWithAuthor) => (
                  <div key={answer.id} className={`p-4 rounded-md border ${
                    answer.isAccepted 
                      ? 'bg-green-500/10 border-green-500/50' 
                      : 'bg-neutral-700/50 border-violet-500/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={getProfilePicture(answer.author.profile?.profilePicture ?? null, answer.author.username)}
                          alt={`${answer.author.username}'s avatar`}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-semibold text-violet-400">{answer.author.username}</span>
                        <span className="text-gray-400">
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </span>
                        {answer.isAccepted && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                            Accepted Answer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAnswerVote(answer.id, answer.userVote === 1 ? 0 : 1)}
                          disabled={votingStates[`answer-${answer.id}`]}
                          className={`p-1 transition-colors ${
                            answer.userVote === 1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          } ${votingStates[`answer-${answer.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FiArrowUp className="h-5 w-5" />
                        </button>
                        <span className="text-gray-300">{answer.upvotes - answer.downvotes}</span>
                        <button
                          onClick={() => handleAnswerVote(answer.id, answer.userVote === -1 ? 0 : -1)}
                          disabled={votingStates[`answer-${answer.id}`]}
                          className={`p-1 transition-colors ${
                            answer.userVote === -1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          } ${votingStates[`answer-${answer.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FiArrowDown className="h-5 w-5" />
                        </button>
                        {currentUser?.id === post.author.id && !answers.some((a: AnswerWithAuthor) => a.isAccepted) && (
                          <Form method="post">
                            <input type="hidden" name="action" value="claim_bounty" />
                            <input type="hidden" name="answerId" value={answer.id} />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/25"
                            >
                              Accept Answer & Claim Bounty
                            </button>
                          </Form>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{answer.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Comments ({pagination.totalComments})</h2>
              
              {/* Comment Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const textarea = form.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea.value.trim()) {
                  handleComment(textarea.value);
                  textarea.value = ''; // Clear the textarea after posting
                }
              }} className="mb-6">
                <textarea
                  placeholder="Write a comment..."
                  className="w-full p-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  rows={3}
                />
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Post Comment
                </button>
              </form>

              {/* Comments List with Scrolling */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {sortComments(comments).map((comment: CommentWithAuthor) => (
                  <div key={comment.id} className="p-4 bg-neutral-700/50 rounded-md border border-violet-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={getProfilePicture(comment.author.profile?.profilePicture ?? null, comment.author.username)}
                          alt={`${comment.author.username}'s avatar`}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-semibold text-violet-400">{comment.author.username}</span>
                        <span className="text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCommentVote(comment.id, comment.userVote === 1 ? 0 : 1)}
                          disabled={votingStates[`comment-${comment.id}`]}
                          className={`p-1 transition-colors ${
                            comment.userVote === 1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          } ${votingStates[`comment-${comment.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FiArrowUp className="h-5 w-5" />
                        </button>
                        <span className="text-gray-300">{comment.upvotes - comment.downvotes}</span>
                        <button
                          onClick={() => handleCommentVote(comment.id, comment.userVote === -1 ? 0 : -1)}
                          disabled={votingStates[`comment-${comment.id}`]}
                          className={`p-1 transition-colors ${
                            comment.userVote === -1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          } ${votingStates[`comment-${comment.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FiArrowDown className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', (pagination.currentPage - 1).toString());
                      window.location.href = url.toString();
                    }}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-neutral-700 text-white rounded">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', (pagination.currentPage + 1).toString());
                      window.location.href = url.toString();
                    }}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.5);
          }
        `}
      </style>
    </div>
  );
} 