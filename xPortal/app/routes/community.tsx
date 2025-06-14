import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useSubmit, useNavigate } from "@remix-run/react"
import { LoaderFunction, json, ActionFunction } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'

interface LoaderData {
  user: {
    id: string;
    username: string;
    profilePicture: string | null;
  } | null;
  posts: Array<{
    id: string;
    title: string;
    content: string;
    blobVideoURL: string | null;
    author: {
      id: string;
      username: string;
      profilePicture: string | null;
    };
    createdAt: string;
    votes: number;
    userVoted: boolean;
    comments: Array<{
      id: string;
      content: string;
      author: {
        id: string;
        username: string;
      };
      createdAt: string;
    }>;
  }>;
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

const POSTS_PER_PAGE = 5;

type Post = {
  id: string;
  title: string;
  content: string;
  blobVideoURL: string | null;
  author: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
  createdAt: string;
  votes: number;
  userVoted: boolean;
  comments: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
    };
    createdAt: string;
  }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const skip = (page - 1) * POSTS_PER_PAGE;

  const posts = await prisma.posts.findMany({
    take: POSTS_PER_PAGE,
    skip,
    orderBy: { createdAt: 'desc' },
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
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              username: true
            }
          },
          createdAt: true
        }
      },
      votes: {
        where: user ? {
          userId: user.id
        } : undefined,
        select: {
          id: true,
          value: true
        }
      }
    }
  });

  // Transform the posts data to match our Post type
  const transformedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    blobVideoURL: post.blobVideoURL,
    author: {
      id: post.author.id,
      username: post.author.username,
      profilePicture: post.author.profile?.profilePicture || null
    },
    createdAt: post.createdAt.toISOString(),
    votes: post.votes?.reduce((acc, vote) => acc + vote.value, 0) || 0,
    userVoted: post.votes?.length > 0,
    comments: post.comments?.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        username: comment.author.username
      },
      createdAt: comment.createdAt.toISOString()
    })) || []
  }));

  return json({ posts: transformedPosts, user });
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return json({ error: 'You must be logged in to perform this action' }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action');
  const postId = formData.get('postId');

  if (!postId) {
    return json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    if (action === 'vote') {
      // Check if user has already voted
      const existingVote = await prisma.vote.findFirst({
        where: {
          userId: user.id,
          postId: postId as string
        }
      });

      if (existingVote) {
        // If user has already voted, remove their vote
        await prisma.vote.delete({
          where: {
            id: existingVote.id
          }
        });
      } else {
        // If user hasn't voted, create a new vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            postId: postId as string,
            value: 1 // Upvote
          }
        });
      }

      // Get updated post data
      const updatedPost = await prisma.posts.findUnique({
        where: { id: postId as string },
        include: {
          votes: true
        }
      });

      return json({ 
        success: true,
        votes: updatedPost?.votes.reduce((acc, vote) => acc + vote.value, 0) || 0
      });
    } else if (action === 'delete') {
      // Check if the post exists and belongs to the user
      const post = await prisma.posts.findUnique({
        where: { id: postId as string },
        select: { authorId: true }
      });

      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      if (post.authorId !== user.id) {
        return json({ error: 'You can only delete your own posts' }, { status: 403 });
      }

      // Delete the post
      await prisma.posts.delete({
        where: { id: postId as string }
      });

      return json({ success: true });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling action:', error);
    return json({ error: 'Failed to process action' }, { status: 500 });
  }
};

export default function Community() {
  const { posts, user } = useLoaderData<LoaderData>();
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const [voteStatus, setVoteStatus] = useState<Record<string, boolean>>(
    posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: post.userVoted
    }), {})
  );
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleVideoError = (postId: string, error: string) => {
    setVideoErrors(prev => ({
      ...prev,
      [postId]: error
    }));
  };

  const handleVote = async (postId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('action', 'vote');
    formData.append('postId', postId);
    
    try {
      submit(formData, { method: 'post' });
      setVoteStatus(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const handleDelete = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('postId', postId);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4">
          <div className="space-y-6">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-neutral-800/80 rounded-lg p-6 shadow-lg border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300"
              >
                <Link 
                  to={`/posts/${post.id}`}
                  className="block group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={post.author.profilePicture || '/default-avatar.png'} 
                        alt={post.author.username}
                        className="w-10 h-10 rounded-full border-2 border-violet-500/50"
                      />
                      <div>
                        <span className="text-violet-400 hover:text-violet-300 font-medium">
                          {post.author.username}
                        </span>
                        <p className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {post.votes} votes
                      </span>
                      <span className="text-sm text-gray-400">
                        {post.comments.length} comments
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

                  {post.blobVideoURL && (
                    <div className="relative w-full aspect-video mb-4 bg-black rounded-lg overflow-hidden max-w-[600px] max-h-[400px] mx-auto">
                      {videoErrors[post.id] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-white p-4 text-center">
                          <div>
                            <p className="font-bold mb-2">Video Error</p>
                            <p className="text-sm">{videoErrors[post.id]}</p>
                            <p className="text-xs mt-2">Filename: {post.blobVideoURL}</p>
                          </div>
                        </div>
                      ) : (
                        <video 
                          className="w-full h-full object-contain"
                          controls
                          onError={(e) => handleVideoError(post.id, `Failed to load video: ${e.currentTarget.error?.message || 'Unknown error'}`)}
                        >
                          <source 
                            src={`/api/videos/${encodeURIComponent(post.blobVideoURL)}`}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}
                </Link>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleVote(post.id);
                      }}
                      className={`flex items-center space-x-1 transition-colors ${
                        voteStatus[post.id] 
                          ? 'text-violet-400' 
                          : 'text-gray-400 hover:text-violet-400'
                      }`}
                    >
                      <svg 
                        className={`w-5 h-5 ${voteStatus[post.id] ? 'fill-current' : 'fill-none'}`} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 15l7-7 7 7" 
                        />
                      </svg>
                      <span>Vote</span>
                    </button>
                    <Link
                      to={`/posts/${post.id}`}
                      className="flex items-center space-x-1 text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Comment</span>
                    </Link>
                  </div>
                  {user?.id === post.author.id && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(post.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 