import { useState, useEffect } from 'react';
import { useLoaderData, useActionData, useFetcher, useRouteError, isRouteErrorResponse, useSubmit, Link, Form } from '@remix-run/react';
import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect, type MetaFunction } from '@remix-run/cloudflare';
import { getUser, requireUserId } from '~/utils/auth.server';
import { createDb } from '~/utils/db.server';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { posts, users, profiles, media, comments, answers, codeBlocks, votes, bounties, virtualWallets, postTags, tags, reports, bookmarks, integrityRatings, bountyClaims } from '../../drizzle/schema';
import { Nav } from '~/components/nav';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { addReputationPoints, REPUTATION_POINTS } from '~/utils/reputation.server';
import IntegrityRatingButton from '~/components/IntegrityRatingButton';
import { Layout } from '~/components/Layout';
import { AuthNotice } from '~/components/auth-notice';
import { FaThumbsUp, FaThumbsDown, FaComment, FaReply, FaEdit, FaTrash, FaFlag, FaCheck, FaTimes, FaEye, FaClock, FaUser, FaTag, FaDollarSign, FaGift, FaLock, FaUnlock } from 'react-icons/fa';
import CodeBlockEditor from '~/components/CodeBlockEditor';
import { MediaUpload } from '~/components/MediaUpload';
import TagSelector from '~/components/TagSelector';
import bountyBucksInfo from '../../bounty-bucks-info.json';
import { getVirtualWallet, createDepositRequest, confirmDeposit, createWithdrawalRequest } from '~/utils/virtual-wallet.server';
import { BountyModal } from '~/components/BountyModal';
import { RefundRequestModal } from '~/components/RefundRequestModal';
import IntegrityRatingModal from '~/components/IntegrityRatingModal';
import { z } from 'zod';

// Extended CodeBlock type with description field
type CodeBlockWithDescription = {
  id: string;
  language: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

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
  codeBlocks: CodeBlockWithDescription[];
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

export const meta: MetaFunction = ({ data }) => {
  const postTitle = (data as any)?.post?.title || 'Post';
  return [
    { title: `${postTitle} - portal.ask` },
    { name: "description", content: postTitle },
  ];
};

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
  try {
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);
    const user = await getUser(request, db);
    const { postId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = 10;

    if (!postId) {
      throw new Response('Post ID is required', { status: 400 });
    }

    // Fetch the post and all relations
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        author: {
          columns: {
            id: true,
            username: true,
          },
          with: {
            profile: {
              columns: {
                profilePicture: true,
              },
            },
          },
        },
        media: true,
        comments: {
          orderBy: [desc(comments.upvotes), desc(comments.createdAt)],
          limit: perPage,
          offset: (page - 1) * perPage,
          with: {
            author: {
              columns: {
                id: true,
                username: true,
              },
              with: {
                profile: {
                  columns: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          orderBy: [desc(answers.isAccepted), desc(answers.upvotes), desc(answers.createdAt)],
          with: {
            author: {
              columns: {
                id: true,
                username: true,
              },
              with: {
                profile: {
                  columns: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        codeBlocks: true,
        votes: user ? {
          where: and(eq(votes.userId, user.id), eq(votes.isQualityVote, true)),
        } : undefined,
        bounty: true,
      },
    }) as unknown as {
      id: string;
      title: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      authorId: string;
      visibilityVotes: number;
      hasBounty: boolean;
      status: string;
      author: { id: string; username: string; profile?: { profilePicture: string | null } | null };
      comments: any[];
      answers: any[];
      codeBlocks: any[];
      media: any[];
      bounty?: any;
    } | null;

    if (!post) {
      throw new Response('Post not found', { status: 404 });
    }

    // Fetch user votes for this post
    const userVotes = user ? await db.query.votes.findMany({
      where: and(eq(votes.userId, user.id), eq(votes.postId, postId)),
    }) : [];

    // Fetch grouped vote counts for quality votes
    const allVotes = await db.query.votes.findMany({
      where: and(eq(votes.postId, postId), eq(votes.voteType, 'POST'), eq(votes.isQualityVote, true)),
    });
    const qualityUpvotes = allVotes.filter((v: any) => v.value === 1).length;
    const qualityDownvotes = allVotes.filter((v: any) => v.value === -1).length;
    const userQualityVote = userVotes.find(v => v.isQualityVote)?.value || 0;
    const userVisibilityVote = userVotes.find(v => !v.isQualityVote)?.value || 0;

    // Get total counts for pagination
    const totalComments = (await db.query.comments.findMany({ where: eq(comments.postId, postId) })).length;
    const totalAnswers = (await db.query.answers.findMany({ where: eq(answers.postId, postId) })).length;

    // Fetch all comment and answer IDs
    const commentIds = post?.comments?.map(c => c.id) || [];
    const answerIds = post?.answers?.map(a => a.id) || [];

    // Fetch all votes by the current user for these comments and answers
    let commentVotes: { commentId: string; value: number }[] = [];
    let answerVotes: { answerId: string; value: number }[] = [];
    if (user) {
      if (commentIds.length > 0) {
        commentVotes = (await db.query.votes.findMany({
          where: and(eq(votes.userId, user.id), eq(votes.voteType, 'COMMENT'), eq(votes.isQualityVote, true)),
        })).filter(v => commentIds.includes(v.commentId!)).map(v => ({ commentId: v.commentId!, value: v.value }));
      }
      if (answerIds.length > 0) {
        answerVotes = (await db.query.votes.findMany({
          where: and(eq(votes.userId, user.id), eq(votes.voteType, 'ANSWER'), eq(votes.isQualityVote, true)),
        })).filter(v => answerIds.includes(v.answerId!)).map(v => ({ answerId: v.answerId!, value: v.value }));
      }
    }

    // Transform the post data
    const transformedPost: PostWithRelations = {
      id: post.id!,
      title: post.title!,
      content: post.content!,
      createdAt: post.createdAt!,
      updatedAt: post.updatedAt!,
      authorId: post.authorId!,
      visibilityVotes: post.visibilityVotes ?? 0,
      qualityUpvotes,
      qualityDownvotes,
      userQualityVote,
      userVisibilityVote,
      hasBounty: post.hasBounty ?? false,
      status: post.status as 'OPEN' | 'CLOSED' | 'COMPLETED',
      author: {
        id: post.author.id!,
        username: post.author.username!,
        profilePicture: post.author.profile?.profilePicture || null,
        profile: post.author.profile ? {
          profilePicture: post.author.profile.profilePicture
        } : null
      },
      comments: (post.comments || []).map(comment => ({
        ...comment,
        createdAt: comment.createdAt?.toISOString?.() ?? '',
        updatedAt: comment.updatedAt?.toISOString?.() ?? '',
        userVote: commentVotes.find(v => v.commentId === comment.id)?.value || 0,
        author: {
          id: comment.author.id!,
          username: comment.author.username!,
          profilePicture: comment.author.profile?.profilePicture || null,
          profile: comment.author.profile ? {
            profilePicture: comment.author.profile.profilePicture
          } : null
        }
      })),
      answers: (post.answers || []).map(answer => ({
        ...answer,
        createdAt: answer.createdAt?.toISOString?.() ?? '',
        updatedAt: answer.updatedAt?.toISOString?.() ?? '',
        userVote: answerVotes.find(v => v.answerId === answer.id)?.value || 0,
        author: {
          id: answer.author.id!,
          username: answer.author.username!,
          profilePicture: answer.author.profile?.profilePicture || null,
          profile: answer.author.profile ? {
            profilePicture: answer.author.profile.profilePicture
          } : null
        }
      })),
      codeBlocks: (post.codeBlocks || []).map(cb => ({ ...cb })),
      media: (post.media || []).map(m => ({
        id: m.id!,
        type: m.type!,
        url: m.url!,
        thumbnailUrl: m.thumbnailUrl || undefined,
        isScreenRecording: m.isScreenRecording ?? false
      })),
      bounty: post.bounty ? {
        amount: post.bounty.amount?.toString?.() ?? '',
        tokenSymbol: 'SOL', // Default to SOL since we don't store token symbol
        expiresAt: post.bounty.expiresAt?.toISOString?.() || '',
        status: post.bounty.status as 'ACTIVE' | 'CLAIMED' | 'REFUNDED' | 'EXPIRED'
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

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
  const db = createDb((context as any).env.DB);
  const user = await getUser(request, db);
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
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      });

      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'You can only delete your own posts' }, { status: 403 });
      }

      await db.delete(posts).where(eq(posts.id, postId));

      return redirect('/community');
    }
    case 'qualityVote': {
      const value = parseInt(formData.get('value') as string);
      if (![-1, 0, 1].includes(value)) {
        return json({ error: 'Invalid vote value' }, { status: 400 });
      }
      // Use a transaction to ensure atomic operations
      return await db.transaction(async () => {
        // Delete existing vote first
        await db.delete(votes).where(and(eq(votes.userId, user.id), eq(votes.postId, postId), eq(votes.voteType, 'POST'), eq(votes.isQualityVote, true)));
        if (value !== 0) {
          await db.insert(votes).values({
            id: crypto.randomUUID(),
            userId: user.id,
            postId,
            value,
            voteType: 'POST',
            isQualityVote: true,
            commentId: null,
            answerId: null
          });
        }
        // Get updated vote counts
        const allVotes = await db.query.votes.findMany({
          where: and(eq(votes.postId, postId), eq(votes.voteType, 'POST'), eq(votes.isQualityVote, true)),
        });
        const qualityUpvotes = allVotes.filter((v: any) => v.value === 1).length;
        const qualityDownvotes = allVotes.filter((v: any) => v.value === -1).length;
        // Update post vote counts
        await db.update(posts).set({
          qualityUpvotes,
          qualityDownvotes
        }).where(eq(posts.id, postId));
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
      const result = await db.transaction(async () => {
        // Get current vote state
        const existingVote = await db
          .select()
          .from(votes)
          .where(and(eq(votes.userId, user.id), eq(votes.postId, postId), eq(votes.voteType, 'POST'), eq(votes.isQualityVote, false)))
          .limit(1);

        // Update vote record
        if (isVoting) {
          if (!existingVote.length) {
            await db.insert(votes).values({
              id: crypto.randomUUID(),
              userId: user.id,
              postId,
              value: 1, // Always 1 for visibility votes
              voteType: 'POST',
              isQualityVote: false,
              commentId: null,
              answerId: null
            });
          }
        } else {
          if (existingVote.length) {
            await db.delete(votes).where(eq(votes.id, existingVote[0].id));
          }
        }

        // Update post visibility votes
        const visibilityVotesResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(votes)
          .where(and(eq(votes.postId, postId), eq(votes.voteType, 'POST'), eq(votes.isQualityVote, false), eq(votes.value, 1)));

        const updatedPost = await db
          .update(posts)
          .set({
            visibilityVotes: visibilityVotesResult[0]?.count || 0
          })
          .where(eq(posts.id, postId))
          .returning();

        return {
          post: updatedPost[0],
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
      // Award reputation points for answering a question
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
    case 'acceptAnswer': {
      const answerId = formData.get('answerId') as string;
      if (!answerId) {
        return json({ error: 'Answer ID is required' }, { status: 400 });
      }

      // Get the answer and its author
      const answer = await db.query.answers.findFirst({
        where: eq(answers.id, answerId),
        with: {
          author: {
            columns: {
              id: true,
              username: true
            }
          }
        }
      }) as any;

      if (!answer) {
        return json({ error: 'Answer not found' }, { status: 404 });
      }

      // Get the post and bounty separately
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, answer.postId),
        with: {
          bounty: true
        }
      }) as any;

      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'Only the post author can accept answers' }, { status: 403 });
      }

      if (!post.bounty) {
        return json({ error: 'No bounty found for this post' }, { status: 404 });
      }

      if (post.bounty.status !== 'ACTIVE') {
        return json({ error: 'Bounty is not active' }, { status: 400 });
      }

      // Use a transaction to ensure atomic operations
      return await db.transaction(async () => {
        // Update the answer as accepted
        await db.update(answers).set({ isAccepted: true }).where(eq(answers.id, answerId));

        // Update the post status
        await db.update(posts).set({ status: 'COMPLETED' }).where(eq(posts.id, answer.postId));

        // Update the bounty status to claimed and set winner
        await db.update(bounties).set({
          status: 'CLAIMED',
          winnerId: answer.authorId,
        }).where(eq(bounties.postId, answer.postId));

        // Import claimBounty function at the top of the file
        const { claimBounty } = await import('~/utils/virtual-wallet.server');
        
        // Transfer bounty tokens to the answer author
        const bountyAmount = post.bounty!.amount;
        await claimBounty(
          db,
          answer.authorId,
          bountyAmount,
          post.bounty!.id
        );

        return json({ 
          success: true,
          message: `Bounty of ${bountyAmount} BBUX transferred to ${answer.author.username}`,
          answer: {
            ...answer,
            isAccepted: true
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
          return await db.transaction(async () => {
            // Delete existing vote first
            await db.delete(votes).where(and(eq(votes.userId, user.id), eq(votes.commentId, commentId), eq(votes.voteType, 'COMMENT'), eq(votes.isQualityVote, true)));

            // Create new vote if value is not 0
            if (value !== 0) {
              await db.insert(votes).values({
                id: crypto.randomUUID(),
                userId: user.id,
                commentId: commentId,
                value,
                voteType: 'COMMENT',
                isQualityVote: true,
                postId: null,
                answerId: null
              });
            }

            // Get updated vote counts
            const [upvotesResult, downvotesResult] = await Promise.all([
              db.select({ count: sql<number>`count(*)` }).from(votes).where(and(eq(votes.commentId, commentId), eq(votes.voteType, 'COMMENT'), eq(votes.isQualityVote, true), eq(votes.value, 1))),
              db.select({ count: sql<number>`count(*)` }).from(votes).where(and(eq(votes.commentId, commentId), eq(votes.voteType, 'COMMENT'), eq(votes.isQualityVote, true), eq(votes.value, -1))),
            ]);

            // Update comment vote counts
            await db.update(comments).set({
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0
            }).where(eq(comments.id, commentId));

            return json({
              success: true,
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0,
              userVote: value
            });
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
          return await db.transaction(async () => {
            // Delete existing vote first
            await db.delete(votes).where(and(eq(votes.userId, user.id), eq(votes.answerId, answerId), eq(votes.voteType, 'ANSWER'), eq(votes.isQualityVote, true)));

            // Create new vote if value is not 0
            if (value !== 0) {
              await db.insert(votes).values({
                id: crypto.randomUUID(),
                userId: user.id,
                answerId: answerId,
                value,
                voteType: 'ANSWER',
                isQualityVote: true,
                postId: null,
                commentId: null
              });
            }

            // Get updated vote counts
            const [upvotesResult, downvotesResult] = await Promise.all([
              db.select({ count: sql<number>`count(*)` }).from(votes).where(and(eq(votes.answerId, answerId), eq(votes.voteType, 'ANSWER'), eq(votes.isQualityVote, true), eq(votes.value, 1))),
              db.select({ count: sql<number>`count(*)` }).from(votes).where(and(eq(votes.answerId, answerId), eq(votes.voteType, 'ANSWER'), eq(votes.isQualityVote, true), eq(votes.value, -1))),
            ]);

            // Update answer vote counts
            await db.update(answers).set({
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0
            }).where(eq(answers.id, answerId));

            return json({
              success: true,
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0,
              userVote: value
            });
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
      const answer = await db.query.answers.findFirst({
        where: eq(answers.id, answerId),
        with: {
          author: {
            columns: {
              id: true,
              username: true
            }
          }
        }
      }) as any;

      if (!answer) {
        return json({ error: 'Answer not found' }, { status: 404 });
      }

      // Get the post and bounty separately
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, answer.postId),
        with: {
          bounty: true
        }
      }) as any;

      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'Only the post author can claim the bounty' }, { status: 403 });
      }

      if (!post.bounty) {
        return json({ error: 'No bounty found for this post' }, { status: 404 });
      }

      if (post.bounty.status !== 'ACTIVE') {
        return json({ error: 'Bounty is not active' }, { status: 400 });
      }

      // Use a transaction to ensure atomic operations
      return await db.transaction(async () => {
        // Update the answer as accepted
        await db.update(answers).set({ isAccepted: true }).where(eq(answers.id, answerId));

        // Update the post status
        await db.update(posts).set({ status: 'COMPLETED' }).where(eq(posts.id, answer.postId));

        // Update the bounty status to claimed and set winner
        await db.update(bounties).set({
          status: 'CLAIMED',
          winnerId: answer.authorId,
        }).where(eq(bounties.postId, answer.postId));

        // Import claimBounty function at the top of the file
        const { claimBounty } = await import('~/utils/virtual-wallet.server');
        
        // Transfer bounty tokens to the answer author
        const bountyAmount = post.bounty!.amount;
        await claimBounty(
          db,
          answer.authorId,
          bountyAmount,
          post.bounty!.id
        );

        return json({ 
          success: true,
          message: `Bounty of ${bountyAmount} BBUX transferred to ${answer.author.username}`,
          answer: {
            ...answer,
            isAccepted: true
          }
        });
      });
    }
    case 'refund_bounty': {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: { bounty: true },
      });

      if (!post?.bounty) {
        return json({ error: 'No bounty found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'Only the post author can refund the bounty' }, { status: 403 });
      }

      // Update the bounty status to refunded
      await db.update(bounties).set({
        status: 'REFUNDED',
      }).where(eq(bounties.postId, postId));

      return json({ success: true });
    }
    case 'accept_answer': {
      const answerId = formData.get('answerId') as string;
      if (!answerId) {
        return json({ error: 'Answer ID is required' }, { status: 400 });
      }

      // Get the answer and its author
      const answer = await db.query.answers.findFirst({
        where: eq(answers.id, answerId),
        with: {
          author: {
            columns: {
              id: true,
              username: true
            }
          }
        }
      }) as any;

      if (!answer) {
        return json({ error: 'Answer not found' }, { status: 404 });
      }

      // Get the post separately
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, answer.postId)
      });

      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'Only the post author can accept answers' }, { status: 403 });
      }

      // Use a transaction to ensure atomic operations
      return await db.transaction(async () => {
        // Update the answer as accepted
        await db.update(answers).set({ isAccepted: true }).where(eq(answers.id, answerId));

        // Update the post status to completed
        await db.update(posts).set({ status: 'COMPLETED' }).where(eq(posts.id, answer.postId));

        return json({ 
          success: true,
          message: `Answer accepted by ${answer.author.username}`,
          answer: {
            ...answer,
            isAccepted: true
          }
        });
      });
    }
    case 'deleteComment': {
      const commentId = formData.get('commentId') as string;
      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

      if (!comment.length || comment[0].authorId !== user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      await db.delete(comments).where(eq(comments.id, commentId));
      return { success: true };
    }

    case 'deleteAnswer': {
      const answerId = formData.get('answerId') as string;
      const answer = await db
        .select()
        .from(answers)
        .where(eq(answers.id, answerId))
        .limit(1);

      if (!answer.length || answer[0].authorId !== user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      await db.delete(answers).where(eq(answers.id, answerId));
      return { success: true };
    }

    case 'updatePost': {
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const tags = formData.getAll('tags') as string[];
      const bountyAmount = formData.get('bountyAmount') as string;
      
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post.length || post[0].authorId !== user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      // Use transaction for atomic operations
      await db.transaction(async () => {
        // Update post
        await db
          .update(posts)
          .set({
            title,
            content,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));

        // Delete existing tags
        await db.delete(postTags).where(eq(postTags.postId, postId));

        // Add new tags
        if (tags && tags.length > 0) {
          const tagValues = tags.map((tag: string) => ({
            id: crypto.randomUUID(),
            postId,
            tagId: tag,
          }));
          await db.insert(postTags).values(tagValues);
        }
      });

      return { success: true };
    }

    case 'reportPost': {
      const reason = formData.get('reason') as string;
      
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const existingReport = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.postId, postId),
            eq(reports.reporterId, user.id)
          )
        )
        .limit(1);

      if (existingReport.length > 0) {
        throw new Response("Already reported", { status: 400 });
      }

      await db.insert(reports).values({
        id: crypto.randomUUID(),
        postId,
        reporterId: user.id,
        reason,
        status: "PENDING",
        createdAt: new Date(),
      });

      return { success: true };
    }

    case 'reportComment': {
      const commentId = formData.get('commentId') as string;
      const reason = formData.get('reason') as string;
      
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const existingReport = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.commentId, commentId),
            eq(reports.reporterId, user.id)
          )
        )
        .limit(1);

      if (existingReport.length > 0) {
        throw new Response("Already reported", { status: 400 });
      }

      await db.insert(reports).values({
        id: crypto.randomUUID(),
        commentId,
        reporterId: user.id,
        reason,
        status: "PENDING",
        createdAt: new Date(),
      });

      return { success: true };
    }

    case 'reportAnswer': {
      const answerId = formData.get('answerId') as string;
      const reason = formData.get('reason') as string;
      
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const existingReport = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.answerId, answerId),
            eq(reports.reporterId, user.id)
          )
        )
        .limit(1);

      if (existingReport.length > 0) {
        throw new Response("Already reported", { status: 400 });
      }

      await db.insert(reports).values({
        id: crypto.randomUUID(),
        answerId,
        reporterId: user.id,
        reason,
        status: "PENDING",
        createdAt: new Date(),
      });

      return { success: true };
    }

    case 'toggleBookmark': {
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const existingBookmark = await db
        .select()
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.postId, postId),
            eq(bookmarks.userId, user.id)
          )
        )
        .limit(1);

      if (existingBookmark.length > 0) {
        await db
          .delete(bookmarks)
          .where(
            and(
              eq(bookmarks.postId, postId),
              eq(bookmarks.userId, user.id)
            )
          );
        return { bookmarked: false };
      } else {
        await db.insert(bookmarks).values({
          id: crypto.randomUUID(),
          postId,
          userId: user.id,
          createdAt: new Date(),
        });
        return { bookmarked: true };
      }
    }

    case 'rateIntegrity': {
      const rating = parseInt(formData.get('rating') as string);
      const reason = formData.get('reason') as string;
      
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const existingRating = await db
        .select()
        .from(integrityRatings)
        .where(
          and(
            eq(integrityRatings.postId, postId),
            eq(integrityRatings.raterId, user.id)
          )
        )
        .limit(1);

      if (existingRating.length > 0) {
        await db
          .update(integrityRatings)
          .set({
            rating,
            reason,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(integrityRatings.postId, postId),
              eq(integrityRatings.raterId, user.id)
            )
          );
      } else {
        await db.insert(integrityRatings).values({
          id: crypto.randomUUID(),
          postId,
          raterId: user.id,
          rating,
          reason,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true };
    }

    case 'claimBounty': {
      const answerId = formData.get('answerId') as string;
      
      if (!user.id) {
        throw new Response("Unauthorized", { status: 401 });
      }

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post.length) {
        throw new Response("Post not found", { status: 404 });
      }

      if (post[0].authorId === user.id) {
        throw new Response("Cannot claim your own bounty", { status: 400 });
      }

      const answer = await db
        .select()
        .from(answers)
        .where(eq(answers.id, answerId))
        .limit(1);

      if (!answer.length || answer[0].postId !== postId) {
        throw new Response("Answer not found", { status: 404 });
      }

      if (answer[0].authorId !== user.id) {
        throw new Response("Cannot claim bounty for another user's answer", { status: 400 });
      }

      // Check if bounty is already claimed
      const existingClaim = await db
        .select()
        .from(bountyClaims)
        .where(eq(bountyClaims.postId, postId))
        .limit(1);

      if (existingClaim.length > 0) {
        throw new Response("Bounty already claimed", { status: 400 });
      }

      // Use transaction for atomic operations
      await db.transaction(async () => {
        // Create bounty claim
        await db.insert(bountyClaims).values({
          id: crypto.randomUUID(),
          postId,
          answerId,
          claimantId: user.id,
          amount: 0, // This should be fetched from bounty table
          status: "PENDING",
          createdAt: new Date(),
        });

        // Update post to mark bounty as claimed
        await db
          .update(posts)
          .set({
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));
      });

      return { success: true };
    }

    default:
      throw new Response("Invalid action", { status: 400 });
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
  const { post, currentUser, pagination } = useLoaderData<typeof loader>() as {
    post: PostWithRelations;
    currentUser: any;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalComments: number;
      totalAnswers: number;
    };
  };
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
                    <span>Posted by </span>
                    <Link 
                      to={`/${post.author.username}`}
                      className="text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {post.author.username}
                    </Link>
                    
                    {/* Integrity Rating Button for Post Author */}
                    {currentUser && currentUser.id !== post.author.id && (
                      <IntegrityRatingButton
                        targetUser={post.author}
                        context={post.hasBounty ? 'BOUNTY_REJECTION' : 'GENERAL'}
                        referenceId={post.id}
                        referenceType="POST"
                        variant="badge"
                        className="ml-2"
                      />
                    )}
                    
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
                            className="w-full max-w-4xl max-h-96 object-contain rounded-t-lg bg-neutral-900"
                          />
                        )}
                        {mediaItem.type === 'VIDEO' && (
                          <video
                            controls
                            className="w-full max-w-4xl max-h-96 object-contain rounded-t-lg bg-black"
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
                  {post.codeBlocks.map((codeBlock: CodeBlockWithDescription) => (
                    <div key={codeBlock.id} className="rounded-lg overflow-hidden border border-neutral-600/50">
                      {/* Code Block Header */}
                      <div className="bg-neutral-700/50 px-4 py-3 border-b border-neutral-600/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-sm font-medium rounded-md">
                              {codeBlock.language}
                            </span>
                            {codeBlock.description && (
                              <span className="text-gray-300 text-sm">
                                {codeBlock.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Code Content */}
                      <SyntaxHighlighter
                        language={codeBlock.language}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0',
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
                        <Link 
                          to={`/${answer.author.username}`}
                          className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          {answer.author.username}
                        </Link>
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
                        
                        {/* Integrity Rating Button for Answer Author */}
                        {currentUser && currentUser.id !== answer.author.id && (
                          <IntegrityRatingButton
                            targetUser={answer.author}
                            context="ANSWER_QUALITY"
                            referenceId={answer.id}
                            referenceType="ANSWER"
                            variant="icon"
                            className="ml-1"
                          />
                        )}
                        
                        {currentUser?.id === post.author.id && !answers.some((a: AnswerWithAuthor) => a.isAccepted) && (
                          <Form method="post">
                            <input type="hidden" name="action" value={post.bounty && post.bounty.status === 'ACTIVE' ? 'claim_bounty' : 'accept_answer'} />
                            <input type="hidden" name="answerId" value={answer.id} />
                            <button
                              type="submit"
                              className={`px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-lg ${
                                post.bounty && post.bounty.status === 'ACTIVE'
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-500/25'
                                  : 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
                              }`}
                            >
                              {post.bounty && post.bounty.status === 'ACTIVE' 
                                ? 'Accept Answer &amp; Claim Bounty'
                                : 'Accept Answer'
                              }
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
                  rows={4}
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
                          className="w-6 h-6 rounded-full"
                        />
                        <Link 
                          to={`/${comment.author.username}`}
                          className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          {comment.author.username}
                        </Link>
                        <span className="text-gray-400 text-sm">
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
                          <FiArrowUp className="h-4 w-4" />
                        </button>
                        <span className="text-gray-300 text-sm">{comment.upvotes - comment.downvotes}</span>
                        <button
                          onClick={() => handleCommentVote(comment.id, comment.userVote === -1 ? 0 : -1)}
                          disabled={votingStates[`comment-${comment.id}`]}
                          className={`p-1 transition-colors ${
                            comment.userVote === -1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          } ${votingStates[`comment-${comment.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FiArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}