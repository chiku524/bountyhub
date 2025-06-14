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
  const user = await getUser(request);
  const { postId } = params;

  if (!postId) {
    throw new Response('Post ID is required', { status: 400 });
  }

  try {
    console.log('Prisma client:', prisma);
    console.log('Fetching post with ID:', postId);
    
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
          },
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
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
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
              },
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
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        codeBlocks: true,
      },
    });

    console.log('Post found:', post ? 'yes' : 'no');

    if (!post) {
      throw new Response('Post not found', { status: 404 });
    }

    // Get user's quality vote if they're logged in
    let userQualityVote = 0;
    if (user) {
      try {
        const userVote = await prisma.qualityVote.findFirst({
          where: {
            userId: user.id,
            postId: post.id
          },
          select: {
            value: true
          }
        });
        userQualityVote = userVote?.value || 0;
      } catch (error) {
        console.error('Error fetching user quality vote:', error);
        // Continue with default vote value if there's an error
        userQualityVote = 0;
      }
    }

    // Calculate quality vote counts
    let upvotes = 0;
    let downvotes = 0;
    try {
      const qualityVoteCounts = await prisma.qualityVote.groupBy({
        by: ['value'],
        where: {
          postId: post.id
        },
        _count: true
      });

      upvotes = qualityVoteCounts.find(v => v.value === 1)?._count || 0;
      downvotes = qualityVoteCounts.find(v => v.value === -1)?._count || 0;
    } catch (error) {
      console.error('Error calculating quality vote counts:', error);
      // Continue with default vote counts if there's an error
    }

    // Transform the post data to include vote information
    const transformedPost = {
      ...post,
      upvotes,
      downvotes,
      userQualityVote,
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

    console.log('Transformed post:', {
      id: transformedPost.id,
      title: transformedPost.title,
      upvotes,
      downvotes,
      userQualityVote
    });

    return json({
      post: transformedPost,
      currentUser: user,
    });
  } catch (error) {
    console.error('Error in post detail loader:', error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response('Failed to fetch post', { status: 500 });
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
      // Check if user has already voted
      const existingVote = await prisma.qualityVote.findFirst({
        where: {
          userId: user.id,
          postId
        }
      });

      console.log('Existing vote:', existingVote);

      if (existingVote) {
        if (existingVote.value === value) {
          // If clicking the same vote button, remove the vote
          await prisma.qualityVote.delete({
            where: {
              id: existingVote.id
            }
          });
        } else {
          // If clicking the opposite vote button, update the vote
          await prisma.qualityVote.update({
            where: {
              id: existingVote.id
            },
            data: {
              value
            }
          });
        }
      } else {
        // Create new vote
        await prisma.qualityVote.create({
          data: {
            userId: user.id,
            postId,
            value
          }
        });
      }

      // Get updated vote counts
      const voteCounts = await prisma.qualityVote.groupBy({
        by: ['value'],
        where: {
          postId
        },
        _count: true
      });

      console.log('Vote counts:', voteCounts);

      const upvotes = voteCounts.find(v => v.value === 1)?._count || 0;
      const downvotes = voteCounts.find(v => v.value === -1)?._count || 0;

      // Get user's current vote
      const userVote = await prisma.qualityVote.findFirst({
        where: {
          userId: user.id,
          postId
        },
        select: {
          value: true
        }
      });

      console.log('User vote after update:', userVote);

      return json({ 
        success: true,
        upvotes,
        downvotes,
        userQualityVote: userVote?.value || 0
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
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in action:', error);
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 500 });
    }
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
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
      const response = await fetch(`/posts/${post.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }
      
      const data = await response.json();
      if (data.success) {
        setVoteState(prev => ({
          ...prev,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          userQualityVote: data.userQualityVote
        }));
      } else {
        setError(data.error || 'Failed to submit vote');
      }
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const data = await response.json();
      if (data.success) {
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
        setError(null);
      } else {
        setError(data.error || 'Failed to post comment');
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
      await submit(formData, { method: 'post' });
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
      await submit(formData, { method: 'post' });
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
              <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
              
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

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={comment.author.profilePicture || '/default-avatar.png'}
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
            </div>

            {/* Answers */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Answers</h2>
              {post.answers.map((answer: AnswerWithAuthor) => (
                <div key={answer.id} className="bg-neutral-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={answer.author.profile?.profilePicture || '/default-avatar.png'}
                      alt={answer.author.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-white font-medium">{answer.author.username}</span>
                    {answer.isAccepted && (
                      <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                        Accepted
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300">{answer.content}</p>
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
              {currentUser && (
                <Form method="post" className="mt-4">
                  <input type="hidden" name="action" value="answer" />
                  <textarea
                    name="content"
                    className="w-full bg-neutral-700 text-white rounded-lg p-2 mb-2"
                    placeholder="Write an answer..."
                    rows={4}
                  />
                  <button
                    type="submit"
                    className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600"
                  >
                    Post Answer
                  </button>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 