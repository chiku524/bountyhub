import { useEffect, useState } from 'react';
import { useLoaderData, useParams, useSubmit, Form, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { getUser } from '~/utils/auth.server';
import { prisma } from '~/utils/prisma.server';
import PostInteractions from '~/components/PostInteractions';
import { Nav } from '~/components/nav';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FiTrash2, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import type { Comment, Answer, CodeBlock, User, Profile } from "@prisma/client";

type CommentWithAuthor = Comment & {
  author: User & {
    profile: Profile | null;
  };
};

type AnswerWithAuthor = Answer & {
  author: User & {
    profile: Profile | null;
  };
};

type PostWithRelations = {
  id: string;
  title: string;
  content: string;
  blobVideoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: User & {
    profile: Profile | null;
  };
  comments: CommentWithAuthor[];
  answers: AnswerWithAuthor[];
  codeBlocks: CodeBlock[];
  upvotes: number;
  downvotes: number;
  userQualityVote: number;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await getUser(request);
    const { postId } = params;

    if (!postId) {
      throw new Response('Post ID is required', { status: 400 });
    }

    const post = await prisma.posts.findUnique({
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
          }
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
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!post) {
      throw new Response('Post not found', { status: 404 });
    }

    // Get user's votes if they're logged in
    let userQualityVote = 0;
    let userVisibilityVote = false;
    if (user) {
      const [qualityVote, visibilityVote] = await Promise.all([
        prisma.vote.findFirst({
          where: {
            userId: user.id,
            postId,
            voteType: 'POST',
            isQualityVote: true
          }
        }),
        prisma.vote.findFirst({
          where: {
            userId: user.id,
            postId,
            voteType: 'POST',
            isQualityVote: false
          }
        })
      ]);
      userQualityVote = qualityVote?.value || 0;
      userVisibilityVote = !!visibilityVote;
    }

    // Transform the post data to include vote information
    const transformedPost = {
      ...post,
      qualityUpvotes: post.qualityUpvotes,
      qualityDownvotes: post.qualityDownvotes,
      visibilityVotes: post.visibilityVotes,
      userQualityVote,
      userVisibilityVote,
      author: {
        ...post.author,
        profilePicture: post.author.profile?.profilePicture || null
      },
      comments: post.comments.map(comment => ({
        ...comment,
        author: {
          ...comment.author,
          profilePicture: comment.author.profile?.profilePicture || null
        }
      })),
      answers: post.answers.map(answer => ({
        ...answer,
        author: {
          ...answer.author,
          profilePicture: answer.author.profile?.profilePicture || null
        }
      }))
    };

    return json({ post: transformedPost, currentUser: user });
  } catch (error) {
    throw new Response('Failed to load post', { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { status: 401 });
    }

    const { postId } = params;
    if (!postId) {
      return json({ error: 'Post ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'qualityVote') {
      const value = parseInt(formData.get('value') as string);
      if (![-1, 0, 1].includes(value)) {
        return json({ error: 'Invalid vote value' }, { status: 400 });
      }

      // Use a transaction to ensure atomic operations
      const result = await prisma.$transaction(async (tx) => {
        // Get current vote state
        const existingVote = await tx.vote.findFirst({
          where: {
            userId: user.id,
            postId,
            voteType: 'POST',
            isQualityVote: true
          }
        });

        // Update vote record
        if (value === 0) {
          // Remove vote
          if (existingVote) {
            await tx.vote.delete({
              where: { id: existingVote.id }
            });
          }
        } else {
          // Update or create vote
          if (existingVote) {
            await tx.vote.update({
              where: { id: existingVote.id },
              data: { value }
            });
          } else {
            await tx.vote.create({
              data: {
                userId: user.id,
                postId,
                value,
                voteType: 'POST',
                isQualityVote: true
              }
            });
          }
        }

        // Update post vote counts
        const voteCounts = await tx.vote.groupBy({
          by: ['value'],
          where: {
            postId,
            voteType: 'POST',
            isQualityVote: true
          },
          _count: true
        });

        const upvotes = voteCounts.find(v => v.value === 1)?._count || 0;
        const downvotes = voteCounts.find(v => v.value === -1)?._count || 0;

        const updatedPost = await tx.posts.update({
          where: { id: postId },
          data: {
            qualityUpvotes: upvotes,
            qualityDownvotes: downvotes
          }
        });

        return {
          post: updatedPost,
          userQualityVote: value
        };
      });

      return json({
        success: true,
        qualityUpvotes: result.post.qualityUpvotes,
        qualityDownvotes: result.post.qualityDownvotes,
        userQualityVote: result.userQualityVote
      });
    } else if (action === 'visibilityVote') {
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
                value: 1,
                voteType: 'POST',
                isQualityVote: false
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
            isQualityVote: false
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
    } else if (action === 'comment') {
      const content = formData.get('content') as string;
      if (!content?.trim()) {
        return json({ error: 'Comment content is required' }, { status: 400 });
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          authorId: user.id,
          postId
        },
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
        }
      });

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
    } else if (action === 'answer') {
      const content = formData.get('content') as string;
      if (!content?.trim()) {
        return json({ error: 'Answer content is required' }, { status: 400 });
      }

      const answer = await prisma.answer.create({
        data: {
          content: content.trim(),
          authorId: user.id,
          postId,
          isAccepted: false
        },
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
        }
      });

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
    } else if (action === 'accept-answer') {
      const answerId = formData.get('answerId') as string;
      if (!answerId) {
        return json({ error: 'Answer ID is required' }, { status: 400 });
      }

      // Check if user is the post author
      const post = await prisma.posts.findUnique({
        where: { id: postId },
        select: { authorId: true }
      });

      if (!post || post.authorId !== user.id) {
        return json({ error: 'Only the post author can accept answers' }, { status: 403 });
      }

      // Update answer to mark it as accepted
      const answer = await prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
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
        }
      });

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

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in action:', error);
    return json({ error: 'Failed to process action' }, { status: 500 });
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
  const { post, currentUser } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [answers, setAnswers] = useState(post.answers);
  const [voteState, setVoteState] = useState({
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    userQualityVote: post.userQualityVote || 0
  });

  useEffect(() => {
    // Update vote state when post data changes
    setVoteState({
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      userQualityVote: post.userQualityVote || 0
    });
  }, [post]);

  const handleVote = async (value: number) => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    const formData = new FormData();
    formData.append('action', 'qualityVote');
    formData.append('value', value.toString());

    try {
      await submit(formData, { method: 'post' });
      // The loader will be revalidated automatically by Remix
      // and the UI will update with the new data
    } catch (error) {
      console.error('Error voting:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit vote. Please try again.');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('action', 'comment');
    formData.append('content', newComment);

    try {
      const response = await fetch(`/posts/${post.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to post comment');
        } else {
          const text = await response.text();
          throw new Error(text || 'Failed to post comment');
        }
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && data.comment) {
          // Add the new comment to the state
          setComments((prev: CommentWithAuthor[]) => [...prev, {
            id: data.comment.id,
            content: data.comment.content,
            createdAt: data.comment.createdAt,
            author: {
              id: data.comment.author.id,
              username: data.comment.author.username,
              profile: {
                profilePicture: data.comment.author.profilePicture
              }
            }
          }]);
          setNewComment('');
          setError(null);
        } else {
          setError(data.error || 'Failed to post comment');
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    }
  };

  const handleAnswer = async (content: string) => {
    const formData = new FormData();
    formData.append('action', 'answer');
    formData.append('content', content);
    formData.append('postId', post.id);

    try {
      const response = await fetch(`/posts/${post.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to post answer');
        } else {
          const text = await response.text();
          throw new Error(text || 'Failed to post answer');
        }
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && data.answer) {
          // Add the new answer to the state
          setAnswers((prev: AnswerWithAuthor[]) => [...prev, {
            id: data.answer.id,
            content: data.answer.content,
            createdAt: data.answer.createdAt,
            isAccepted: data.answer.isAccepted,
            author: {
              id: data.answer.author.id,
              username: data.answer.author.username,
              profile: {
                profilePicture: data.answer.author.profilePicture
              }
            }
          }]);
          setError(null);
        } else {
          setError(data.error || 'Failed to post answer');
        }
      }
    } catch (error) {
      setError('Failed to post answer');
      console.error('Error posting answer:', error);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    const formData = new FormData();
    formData.append('action', 'accept-answer');
    formData.append('answerId', answerId);
    formData.append('postId', post.id);

    try {
      const response = await fetch(`/posts/${post.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to accept answer');
        } else {
          const text = await response.text();
          throw new Error(text || 'Failed to accept answer');
        }
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          // Update the answers list to reflect the accepted status
          setAnswers((prev: AnswerWithAuthor[]) =>
            prev.map(answer =>
              answer.id === answerId
                ? { ...answer, isAccepted: true }
                : answer
            )
          );
          setError(null);
        } else {
          setError(data.error || 'Failed to accept answer');
        }
      }
    } catch (error) {
      setError('Failed to accept answer');
      console.error('Error accepting answer:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const formData = new FormData();
    formData.append('_action', 'deletePost');

    try {
      await submit(formData, { method: 'post' });
    } catch (error) {
      setError('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  const renderVideo = () => {
    if (!post.blobVideoURL) return null;

    return (
      <div className="mb-6 relative aspect-video bg-neutral-700 rounded-lg overflow-hidden">
        <video
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          onError={(e) => {
            setVideoError(`Failed to load video: ${e.currentTarget.error?.message || 'Unknown error'}`);
            e.currentTarget.style.display = 'none';
          }}
        >
          <source 
            src={`/api/videos/${encodeURIComponent(post.blobVideoURL)}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/90 text-red-500 p-4 text-center">
            {videoError}
          </div>
        )}
      </div>
    );
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
        <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500">
                {error}
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-white">{post.title}</h1>
              {currentUser?.id === post.author.id && (
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 size={20} />
                </button>
              )}
            </div>
            
            {renderVideo()}
            
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.codeBlocks && post.codeBlocks.length > 0 && (
              <div className="space-y-4 mb-6">
                {post.codeBlocks.map((block: CodeBlock) => (
                  <div key={block.id} className="relative">
                    <SyntaxHighlighter
                      language={block.language}
                      style={vscDarkPlus}
                      className="rounded-lg"
                    >
                      {block.code}
                    </SyntaxHighlighter>
                  </div>
                ))}
              </div>
            )}

            {/* Voting UI */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => handleVote(1)}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  voteState.userQualityVote === 1
                    ? 'bg-violet-500 text-white'
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                }`}
              >
                <FiThumbsUp size={18} />
                <span>{voteState.upvotes}</span>
              </button>
              <button
                onClick={() => handleVote(-1)}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  voteState.userQualityVote === -1
                    ? 'bg-violet-500 text-white'
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                }`}
              >
                <FiThumbsDown size={18} />
                <span>{voteState.downvotes}</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Comments ({comments.length})</h2>
              
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
                  {comments.map((comment: CommentWithAuthor) => (
                    <div key={comment.id} className="bg-neutral-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={comment.author.profile?.profilePicture || '/default-avatar.png'}
                          alt={comment.author.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <span className="text-white font-medium">
                            {comment.author.username}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
                {comments.length > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-800/80 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Answers Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Answers ({answers.length})</h2>
              
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
                  rows={4}
                />
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Post Answer
                </button>
              </form>

              {/* Answers List with fixed height and scrolling */}
              <div className="relative">
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {answers.map((answer: AnswerWithAuthor) => (
                    <div key={answer.id} className="bg-neutral-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={answer.author.profile?.profilePicture || '/default-avatar.png'}
                          alt={answer.author.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <span className="text-white font-medium">
                            {answer.author.username}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </span>
                          {answer.isAccepted && (
                            <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                              Accepted
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{answer.content}</p>
                      {currentUser?.id === post.author.id && !answer.isAccepted && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Accept Answer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {answers.length > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-800/80 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Add custom scrollbar styles */}
            <style>
              {`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: rgba(0, 0, 0, 0.1);
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(139, 92, 246, 0.3);
                  border-radius: 3px;
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