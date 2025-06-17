import { useEffect, useState, useCallback } from 'react';
import { useLoaderData, useParams, useSubmit, useFetcher, Form, useRouteError, isRouteErrorResponse, Link } from '@remix-run/react';
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
    createdAt: string;
    updatedAt: string;
    profile?: {
      profilePicture: string | null;
      createdAt: string;
      updatedAt: string;
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
    createdAt: string;
    updatedAt: string;
    profile?: {
      profilePicture: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
};

type PostWithRelations = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: User & {
    profile: Profile | null;
    profilePicture: string | null;
  };
  comments: CommentWithAuthor[];
  answers: AnswerWithAuthor[];
  codeBlocks: CodeBlock[];
  upvotes: number;
  downvotes: number;
  userQualityVote: number;
  media: {
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    isScreenRecording: boolean;
  }[];
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
            orderBy: {
              createdAt: 'desc'
            },
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
              { createdAt: 'desc' }
            ]
          },
          codeBlocks: true,
          votes: {
            where: {
              userId: user?.id || '',
              isQualityVote: true
            }
          }
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
    const transformedPost = {
      ...post,
      visibilityVotes: post.visibilityVotes,
      qualityUpvotes,
      qualityDownvotes,
      userQualityVote,
      userVisibilityVote,
      author: {
        ...post.author,
        profilePicture: post.author.profile?.profilePicture || null
      },
      comments: post.comments.map(comment => ({
        ...comment,
        userVote: commentVotes.find(v => v.commentId === comment.id)?.value || 0,
        author: {
          ...comment.author,
          profilePicture: comment.author.profile?.profilePicture || null
        }
      })),
      answers: post.answers.map(answer => ({
        ...answer,
        userVote: answerVotes.find(v => v.answerId === answer.id)?.value || 0,
        author: {
          ...answer.author,
          profilePicture: answer.author.profile?.profilePicture || null
        }
      }))
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

      return await prisma.$transaction(async (tx) => {
        // Delete existing vote
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
      });
    }
    case 'answerVote': {
      const answerId = formData.get('answerId') as string;
      const value = parseInt(formData.get('value') as string);
      
      if (!answerId || ![-1, 0, 1].includes(value)) {
        return json({ error: 'Invalid parameters' }, { status: 400 });
      }

      return await prisma.$transaction(async (tx) => {
        // Delete existing vote
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
      });
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
  const submit = useSubmit();
  const commentFetcher = useFetcher<CommentResponse>();
  const answerFetcher = useFetcher<AnswerResponse>();
  const voteFetcher = useFetcher<VoteResponse>();
  const acceptAnswerFetcher = useFetcher<AcceptAnswerResponse>();
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentWithAuthor[]>(post.comments);
  const [answers, setAnswers] = useState<AnswerWithAuthor[]>(post.answers);
  const [voteState, setVoteState] = useState({
    upvotes: post.qualityUpvotes || 0,
    downvotes: post.qualityDownvotes || 0,
    userQualityVote: post.userQualityVote || 0
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handleVote = useCallback(async (value: number) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    const formData = new FormData();
    formData.append('action', 'qualityVote');
    formData.append('value', value.toString());
    voteFetcher.submit(formData, { method: 'post' });
  }, [currentUser, voteFetcher]);

  const handleComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    // Optimistically update UI
    const optimisticComment: CommentWithAuthor = {
      id: `temp-${Date.now()}`,
      content: newComment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt,
        profile: currentUser.profile
      }
    };

    setComments(prev => [optimisticComment, ...prev]);
    setNewComment('');

    const formData = new FormData();
    formData.append('action', 'comment');
    formData.append('content', newComment);

    commentFetcher.submit(formData, { method: 'post' });
  }, [currentUser, newComment, commentFetcher]);

  const handleCommentVote = useCallback(async (commentId: string, value: number) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    try {
      const formData = new FormData();
      formData.append('value', value.toString());
      // Use the correct endpoint for comment voting
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process vote');
      }
      if (data.success) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  upvotes: data.upvotes,
                  downvotes: data.downvotes,
                  userVote: data.userVote
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to process vote');
    }
  }, [currentUser]);

  const handleAnswerVote = useCallback(async (answerId: string, value: number) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    try {
      const formData = new FormData();
      formData.append('value', value.toString());
      // Use the correct endpoint for answer voting
      const response = await fetch(`/api/answers/${answerId}/vote`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process vote');
      }
      if (data.success) {
        setAnswers(prevAnswers =>
          prevAnswers.map(answer =>
            answer.id === answerId
              ? {
                  ...answer,
                  upvotes: data.upvotes,
                  downvotes: data.downvotes,
                  userVote: data.userVote
                }
              : answer
          )
        );
      }
    } catch (error) {
      console.error('Error voting on answer:', error);
      setError(error instanceof Error ? error.message : 'Failed to process vote');
    }
  }, [currentUser]);

  // Memoize rendered components
  const renderComment = useCallback((comment: CommentWithAuthor) => (
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
            className={`p-1 transition-colors ${
              comment.userVote === 1
                ? 'text-violet-400'
                : 'text-gray-400 hover:text-violet-400'
            }`}
          >
            <FiArrowUp className="h-5 w-5" />
          </button>
          <span className="text-gray-300">{comment.upvotes - comment.downvotes}</span>
          <button
            onClick={() => handleCommentVote(comment.id, comment.userVote === -1 ? 0 : -1)}
            className={`p-1 transition-colors ${
              comment.userVote === -1
                ? 'text-violet-400'
                : 'text-gray-400 hover:text-violet-400'
            }`}
          >
            <FiArrowDown className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-gray-300">{comment.content}</p>
    </div>
  ), [handleCommentVote]);

  // Update comments when fetcher data changes
  useEffect(() => {
    if (commentFetcher.data?.success && commentFetcher.data?.comment) {
      const newComment = {
        ...commentFetcher.data.comment,
        createdAt: new Date(commentFetcher.data.comment.createdAt),
        updatedAt: new Date(commentFetcher.data.comment.updatedAt),
        author: {
          ...commentFetcher.data.comment.author,
          createdAt: new Date(commentFetcher.data.comment.author.createdAt),
          updatedAt: new Date(commentFetcher.data.comment.author.updatedAt),
          profile: commentFetcher.data.comment.author.profile ? {
            ...commentFetcher.data.comment.author.profile,
            createdAt: new Date(commentFetcher.data.comment.author.profile.createdAt),
            updatedAt: new Date(commentFetcher.data.comment.author.profile.updatedAt)
          } : null
        }
      } as unknown as CommentWithAuthor;

      // Replace optimistic comment with real one
      setComments(prev => prev.map(comment => 
        comment.id.startsWith('temp-') ? newComment : comment
      ));
      setError(null);
    } else if (commentFetcher.data?.error) {
      // Remove optimistic comment on error
      setComments(prev => prev.filter(comment => !comment.id.startsWith('temp-')));
      setError(commentFetcher.data.error);
    }
  }, [commentFetcher.data]);

  // Update answers when fetcher data changes
  useEffect(() => {
    if (answerFetcher.data?.success && answerFetcher.data?.answer) {
      const newAnswer = {
        ...answerFetcher.data.answer,
        createdAt: new Date(answerFetcher.data.answer.createdAt),
        updatedAt: new Date(answerFetcher.data.answer.updatedAt),
        author: {
          ...answerFetcher.data.answer.author,
          createdAt: new Date(answerFetcher.data.answer.author.createdAt),
          updatedAt: new Date(answerFetcher.data.answer.author.updatedAt),
          profile: answerFetcher.data.answer.author.profile ? {
            ...answerFetcher.data.answer.author.profile,
            createdAt: new Date(answerFetcher.data.answer.author.profile.createdAt),
            updatedAt: new Date(answerFetcher.data.answer.author.profile.updatedAt)
          } : null
        }
      } as unknown as AnswerWithAuthor;
      setAnswers(prev => [...prev, newAnswer]);
      setError(null);
    } else if (answerFetcher.data?.error) {
      setError(answerFetcher.data.error);
    }
  }, [answerFetcher.data]);

  // Update vote state when fetcher data changes
  useEffect(() => {
    const data = voteFetcher.data;
    if (data?.success && typeof data.qualityUpvotes === 'number' && typeof data.qualityDownvotes === 'number' && typeof data.userQualityVote === 'number') {
      setVoteState(prev => ({
        ...prev,
        upvotes: data.qualityUpvotes,
        downvotes: data.qualityDownvotes,
        userQualityVote: data.userQualityVote
      }));
    }
  }, [voteFetcher.data]);

  // Update answers when accept answer fetcher data changes
  useEffect(() => {
    if (acceptAnswerFetcher.data?.success && acceptAnswerFetcher.data?.answer) {
      const updatedAnswer = {
        ...acceptAnswerFetcher.data.answer,
        createdAt: new Date(acceptAnswerFetcher.data.answer.createdAt),
        updatedAt: new Date(acceptAnswerFetcher.data.answer.updatedAt),
        author: {
          ...acceptAnswerFetcher.data.answer.author,
          createdAt: new Date(acceptAnswerFetcher.data.answer.author.createdAt),
          updatedAt: new Date(acceptAnswerFetcher.data.answer.author.updatedAt),
          profile: acceptAnswerFetcher.data.answer.author.profile ? {
            ...acceptAnswerFetcher.data.answer.author.profile,
            createdAt: new Date(acceptAnswerFetcher.data.answer.author.profile.createdAt),
            updatedAt: new Date(acceptAnswerFetcher.data.answer.author.profile.updatedAt)
          } : null
        }
      } as unknown as AnswerWithAuthor;
      setAnswers(prev => 
        prev.map(answer => 
          answer.id === updatedAnswer.id
            ? { ...answer, isAccepted: true }
            : answer
        )
      );
      setError(null);
    } else if (acceptAnswerFetcher.data?.error) {
      setError(acceptAnswerFetcher.data.error);
    }
  }, [acceptAnswerFetcher.data]);

  const handleAnswer = async (content: string) => {
    const formData = new FormData();
    formData.append('action', 'answer');
    formData.append('content', content);
    formData.append('postId', post.id);

    answerFetcher.submit(formData, { method: 'post' });
  };

  const handleAcceptAnswer = async (answerId: string) => {
    const formData = new FormData();
    formData.append('action', 'acceptAnswer');
    formData.append('answerId', answerId);
    acceptAnswerFetcher.submit(formData, { method: 'post' });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const formData = new FormData();
    formData.append('action', 'deletePost');
    submit(formData, { method: 'post' });
  };

  const handleQualityVote = async (value: number) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    const formData = new FormData();
    formData.append('action', 'qualityVote');
    formData.append('value', value.toString());
    voteFetcher.submit(formData, { method: 'post' });
  };

  if (!post) {
    return (
      <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
        <Nav />
        <div className="flex-1 overflow-y-auto">
          <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4">
            <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20">
              <p className="text-red-500">Post not found</p>
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
        <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4 pb-16">
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500">
                {error}
              </div>
            )}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{post.title}</h1>
                <div className="flex items-center gap-2">
                  <img
                    src={getProfilePicture(post.author.profile?.profilePicture ?? null, post.author.username)}
                    alt={`${post.author.username}'s avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold text-violet-400">{post.author.username}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="mt-4 space-y-6">
              {/* Media Section */}
              {post.media && post.media.length > 0 && (
                <div className="bg-neutral-800/50 rounded-lg p-6 border border-violet-500/20">
                  <h2 className="text-xl font-semibold text-violet-400 mb-4">Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.media.map((media: { id: string; type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => (
                      <div key={media.id} className="relative group">
                        {media.type === 'VIDEO' ? (
                          <video
                            src={media.url}
                            poster={media.thumbnailUrl || undefined}
                            className="w-full h-48 object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt="Post media"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        {media.isScreenRecording && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-sm rounded">
                            Screen Recording
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Content Section */}
              <div className="bg-neutral-800/50 rounded-lg p-6 border border-violet-500/20">
                <h2 className="text-xl font-semibold text-violet-400 mb-4">Content</h2>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {post.content}
                  </div>
                </div>
              </div>

              {/* Code Blocks Section */}
              {post.codeBlocks && post.codeBlocks.length > 0 && (
                <div className="bg-neutral-800/50 rounded-lg p-6 border border-violet-500/20">
                  <h2 className="text-xl font-semibold text-violet-400 mb-4">Code Blocks</h2>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {post.codeBlocks.map((block: { id: string; language: string; code: string }) => (
                      <div key={block.id} className="relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-violet-400 font-mono">
                            {block.language}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(block.code);
                            }}
                            className="text-gray-400 hover:text-violet-400 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                          </button>
                        </div>
                        <div className="relative">
                          <SyntaxHighlighter
                            language={block.language.toLowerCase()}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              maxHeight: '300px',
                              overflow: 'auto'
                            }}
                          >
                            {block.code}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voting UI */}
            <div className="flex items-center justify-between mt-8 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQualityVote(1)}
                  className={`flex items-center space-x-1 transition-colors ${
                    voteState.userQualityVote === 1 
                      ? 'text-violet-400' 
                      : 'text-gray-400 hover:text-violet-400'
                  }`}
                >
                  <FiArrowUp size={18} />
                  <span>{voteState.upvotes}</span>
                </button>
                <button
                  onClick={() => handleQualityVote(-1)}
                  className={`flex items-center space-x-1 transition-colors ${
                    voteState.userQualityVote === -1 
                      ? 'text-violet-400' 
                      : 'text-gray-400 hover:text-violet-400'
                  }`}
                >
                  <FiArrowDown size={18} />
                  <span>{voteState.downvotes}</span>
                </button>
              </div>
              {currentUser?.id === post.author.id && (
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 size={20} />
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Comments ({pagination.totalComments})</h2>
              
              {/* Comment Form */}
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
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

              {/* Comments List with fixed height and scrolling */}
              <div className="relative">
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {comments.map(renderComment)}
                </div>
                {comments.length > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-800/80 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Pagination Controls */}
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

              {/* Answers List */}
              <div className="space-y-4">
                {answers.map((answer: AnswerWithAuthor) => (
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
                          className={`p-1 transition-colors ${
                            answer.userVote === 1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          }`}
                        >
                          <FiArrowUp className="h-5 w-5" />
                        </button>
                        <span className="text-gray-300">{answer.upvotes - answer.downvotes}</span>
                        <button
                          onClick={() => handleAnswerVote(answer.id, answer.userVote === -1 ? 0 : -1)}
                          className={`p-1 transition-colors ${
                            answer.userVote === -1
                              ? 'text-violet-400'
                              : 'text-gray-400 hover:text-violet-400'
                          }`}
                        >
                          <FiArrowDown className="h-5 w-5" />
                        </button>
                        {currentUser?.id === post.author.id && !post.answers.some((a: AnswerWithAuthor) => a.isAccepted) && (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            Accept Answer
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{answer.content}</p>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  );
} 