import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useSubmit, useNavigate, useSearchParams } from "@remix-run/react"
import { LoaderFunction, json, ActionFunction } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'
import { FiThumbsUp } from 'react-icons/fi'

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
    visibilityVotes: number;
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
  visibilityVotes: number;
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
  try {
    const user = await getUser(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = 9;
    const skip = (page - 1) * perPage;

    // First, get the total count of posts
    const totalPosts = await prisma.posts.count();

    // Then fetch the posts with pagination
    const posts = await prisma.posts.findMany({
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
        votes: user ? {
          where: {
            userId: user.id,
            voteType: 'POST',
            isQualityVote: false
          }
        } : undefined,
        comments: {
          select: {
            id: true
          }
        }
      },
      orderBy: [
        {
          visibilityVotes: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ],
      skip,
      take: perPage
    });

    // Transform the posts data
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
      visibilityVotes: post.visibilityVotes,
      userVoted: user ? post.votes.length > 0 : false,
      comments: post.comments.length
    }));

    console.log('Loader data:', {
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / perPage),
      postsCount: transformedPosts.length
    });

    return json({
      user,
      posts: transformedPosts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / perPage)
    });
  } catch (error) {
    console.error('Error in loader:', error);
    return json({ 
      error: 'Failed to load posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get('action');
    const postId = formData.get('postId');
    const isVoting = formData.get('isVoting') === 'true';

    if (!postId) {
      return json({ error: 'Post ID is required' }, { status: 400 });
    }

    if (action === 'vote') {
      try {
        // Use a transaction to ensure atomic operations
        const result = await prisma.$transaction(async (tx) => {
          // Get current vote state
          const existingVote = await tx.vote.findFirst({
            where: {
              userId: user.id,
              postId: postId as string,
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
                  postId: postId as string,
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
              postId: postId as string,
              voteType: 'POST',
              isQualityVote: false
            }
          });

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
        });
      } catch (error) {
        console.error('Error in vote action:', error);
        return json({ 
          error: 'Failed to process vote',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
      }
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
    console.error('Error in action:', error);
    return json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export default function Community() {
  const { user, posts, totalPosts, currentPage, totalPages } = useLoaderData<typeof loader>();
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Update localPosts when posts from loader changes
  useEffect(() => {
    if (posts && Array.isArray(posts)) {
      setLocalPosts(posts);
    } else {
      console.error('Invalid posts data:', posts);
      setLocalPosts([]);
    }
  }, [posts]);

  const handleVideoError = (postId: string, error: string) => {
    console.error(`Video error for post ${postId}:`, error);
    setVideoErrors(prev => ({ ...prev, [postId]: error }));
  };

  const handleVote = async (postId: string, isVoting: boolean) => {
    try {
      const formData = new FormData();
      formData.append('isVoting', isVoting.toString());

      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to process vote');
      }

      if (data.success) {
        // Update the post's vote count and state in the UI
        setLocalPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  visibilityVotes: data.votes,
                  userVoted: data.voted
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Show error message to user
      alert(error instanceof Error ? error.message : 'Failed to process vote');
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

  // If there's an error in the loader data, show an error message
  if (!posts || !Array.isArray(posts)) {
    return (
      <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
        <Nav />
        <div className="flex-1 overflow-y-auto">
          <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
            <div className="text-red-500 mt-16">
              Failed to load posts. Please try refreshing the page.
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
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Community Posts</h1>
            <Link 
              to="/posts/create" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Create Post</span>
            </Link>
          </div>

          {/* Responsive grid for posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {localPosts.length > 0 ? (
              localPosts.map((post: Post) => (
                <div 
                  key={post.id}
                  className="bg-neutral-800/80 rounded-lg p-6 shadow-lg border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 w-full mx-auto flex flex-col"
                  style={{ maxHeight: '600px' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={post.author.profilePicture || '/default-avatar.png'} 
                        alt={post.author.username}
                        className="w-10 h-10 rounded-full border-2 border-violet-500/50"
                      />
                      <div>
                        <Link 
                          to={`/${post.author.username}`}
                          className="text-violet-400 hover:text-violet-300 font-medium"
                        >
                          {post.author.username}
                        </Link>
                        <p className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Top-right stats for md+ screens */}
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {(typeof post.visibilityVotes === 'number' ? post.visibilityVotes : 0)} votes
                      </span>
                      <span className="text-sm text-gray-400">
                        {post.comments.length} comments
                      </span>
                    </div>
                  </div>

                  <Link 
                    to={`/posts/${post.id}`}
                    className="block group flex-1"
                  >
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                      {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                    </h2>
                    <p className="text-gray-300 mb-4 overflow-hidden truncate max-w-full w-full break-words">
                      {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                    </p>
                  </Link>

                  {post.blobVideoURL && (
                    <div className="mt-4">
                      <video 
                        className="w-full h-full object-contain max-h-[200px] max-w-[300px] mx-auto"
                        controls
                        onError={(e) => handleVideoError(post.id, `Failed to load video: ${e.currentTarget.error?.message || 'Unknown error'}`)}
                      >
                        <source 
                          src={`/api/videos/${encodeURIComponent(post.blobVideoURL)}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    {/* Bottom-left stats for small screens */}
                    <div className="flex items-center space-x-4">
                      <div className="flex md:hidden items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {(typeof post.visibilityVotes === 'number' ? post.visibilityVotes : 0)} votes
                        </span>
                        <span className="text-sm text-gray-400">
                          {post.comments.length} comments
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleVote(post.id, !post.userVoted);
                        }}
                        className={`flex items-center space-x-1 transition-colors ${
                          post.userVoted 
                            ? 'text-violet-400' 
                            : 'text-gray-400 hover:text-violet-400'
                        }`}
                      >
                        <FiThumbsUp className={`w-5 h-5 ${post.userVoted ? 'fill-current' : 'fill-none'}`} />
                        <span>{post.visibilityVotes}</span>
                      </button>
                    </div>
                    {user && user.id === post.author.id && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No posts found</p>
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setSearchParams({ page: String(currentPage - 1) })}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setSearchParams({ page: String(i + 1) })}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-violet-500 text-white' : 'bg-gray-700 text-white'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setSearchParams({ page: String(currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 