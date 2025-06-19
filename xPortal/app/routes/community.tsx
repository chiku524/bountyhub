import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useSubmit, useNavigate, useSearchParams } from "@remix-run/react"
import { LoaderFunction, json, ActionFunction } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Layout } from '../components/Layout'
import { prisma } from '~/utils/prisma.server'
import { FiTrendingUp } from 'react-icons/fi'
import IntegrityRatingButton from '~/components/IntegrityRatingButton'

const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed=';

function getProfilePicture(profilePicture: string | null, username: string): string {
  if (profilePicture) {
    return profilePicture;
  }
  return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}

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
    media: {
      id: string;
      type: string;
      url: string;
      thumbnailUrl?: string;
      isScreenRecording: boolean;
    } | null;
    author: {
      id: string;
      username: string;
      profilePicture: string | null;
    };
    createdAt: string;
    visibilityVotes: number;
    userVoted: boolean;
    comments: number;
    hasBounty: boolean;
    bounty: {
      id: string;
      amount: number;
      status: string;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
  availableTags: Array<{
    id: string;
    name: string;
    description: string | null;
    color: string;
  }>;
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  selectedTags: string[];
}

const POSTS_PER_PAGE = 5;

interface Post {
  id: string;
  title: string;
  content: string;
  media: {
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    isScreenRecording: boolean;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    profile: {
      profilePicture: string | null;
    } | null;
  };
  visibilityVotes: number;
  userVoted: boolean;
  comments: number;
  hasBounty: boolean;
  bounty: {
    id: string;
    amount: number;
    status: string;
  } | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await getUser(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const selectedTags = url.searchParams.getAll('tags');
    const perPage = 9;
    const skip = (page - 1) * perPage;

    // Build the where clause for tag filtering
    const whereClause: any = {};
    if (selectedTags.length > 0) {
      whereClause.postTags = {
        some: {
          tagId: {
            in: selectedTags
          }
        }
      };
    }

    // First, get the total count of posts with tag filtering
    const totalPosts = await prisma.posts.count({
      where: whereClause
    });

    // Then fetch the posts with pagination and tag filtering
    const posts = await prisma.posts.findMany({
      where: whereClause,
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
        media: {
          take: 1,
          orderBy: {
            createdAt: 'asc'
          }
        },
        bounty: true,
        postTags: {
          include: {
            tag: true
          }
        },
        votes: user ? {
          where: {
            userId: user.id,
            voteType: 'POST',
            isQualityVote: false
          }
        } : undefined,
        _count: {
          select: {
            comments: true
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

    // Sort posts in JS: bountied first (by amount), then by visibilityVotes, then by createdAt
    posts.sort((a, b) => {
      // First, sort by bounty status and amount
      const aHasBounty = a.hasBounty && a.bounty && a.bounty.status === 'ACTIVE';
      const bHasBounty = b.hasBounty && b.bounty && b.bounty.status === 'ACTIVE';
      
      if (aHasBounty && !bHasBounty) return -1;
      if (!aHasBounty && bHasBounty) return 1;
      
      // If both have bounties, sort by bounty amount (higher first)
      if (aHasBounty && bHasBounty) {
        const aAmount = a.bounty!.amount;
        const bAmount = b.bounty!.amount;
        if (aAmount !== bAmount) return bAmount - aAmount;
      }
      
      // Then by visibility votes
      if (b.visibilityVotes !== a.visibilityVotes) return b.visibilityVotes - a.visibilityVotes;
      
      // Finally by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Transform the posts data
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      media: post.media[0] ? {
        id: post.media[0].id,
        type: post.media[0].type,
        url: post.media[0].url,
        thumbnailUrl: post.media[0].thumbnailUrl,
        isScreenRecording: post.media[0].isScreenRecording
      } : null,
      author: {
        id: post.author.id,
        username: post.author.username,
        profilePicture: getProfilePicture(post.author.profile?.profilePicture || null, post.author.username)
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      visibilityVotes: post.visibilityVotes,
      userVoted: user ? post.votes.length > 0 : false,
      comments: post._count.comments,
      hasBounty: post.hasBounty,
      bounty: post.bounty ? {
        id: post.bounty.id,
        amount: post.bounty.amount,
        status: post.bounty.status
      } : null,
      tags: post.postTags.map(postTag => ({
        id: postTag.tag.id,
        name: postTag.tag.name,
        color: postTag.tag.color
      }))
    }));

    // Transform user data if it exists
    const transformedUser = user ? {
      id: user.id,
      username: user.username,
      profilePicture: getProfilePicture(user.profile?.profilePicture || null, user.username)
    } : null;

    // Fetch all available tags
    const availableTags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });

    return json({
      user: transformedUser,
      posts: transformedPosts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / perPage),
      availableTags,
      selectedTags
    });
  } catch (error) {
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
          voted: result.userVoted,
          postId: postId as string
        });
      } catch (error) {
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
    console.error('Action error:', error);
    return json({ 
      error: 'Failed to process action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export default function Community() {
  const { user, posts: initialPosts, totalPosts, currentPage, totalPages, availableTags, selectedTags } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localPosts, setLocalPosts] = useState<any[]>(initialPosts);
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const submit = useSubmit();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update localPosts when posts from loader changes
  useEffect(() => {
    setLocalPosts(initialPosts);
  }, [initialPosts]);

  const handleVideoError = (postId: string, error: string) => {
    setVideoErrors(prev => ({ ...prev, [postId]: error }));
  };

  const handleVote = async (postId: string, voteValue: number) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('action', 'vote');
      formData.append('postId', postId);
      formData.append('isVoting', (voteValue === 1).toString());

      submit(formData, { method: 'post' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's an error in the loader data, show an error message
  if (!initialPosts || !Array.isArray(initialPosts)) {
    return (
      <Layout>
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
          <div className="text-red-500 mt-16">
            Failed to load posts. Please try refreshing the page.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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

        {/* Tag Filtering */}
        <div className="mb-6 bg-neutral-800/50 rounded-lg p-4 border border-violet-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-violet-300">Filter by Tags</h3>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  const currentTags = newParams.getAll('tags');
                  
                  if (currentTags.includes(tag.id)) {
                    // Remove tag if already selected
                    newParams.delete('tags');
                    currentTags.filter(t => t !== tag.id).forEach(t => newParams.append('tags', t));
                  } else {
                    // Add tag if not selected
                    newParams.append('tags', tag.id);
                  }
                  
                  // Reset to page 1 when filtering
                  newParams.set('page', '1');
                  setSearchParams(newParams);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-violet-500 text-white shadow-lg'
                    : 'bg-neutral-700/50 text-gray-300 hover:bg-neutral-600/50 border border-violet-500/30'
                }`}
                style={{
                  borderColor: selectedTags.includes(tag.id) ? tag.color : undefined
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
          
          {selectedTags.length > 0 && (
            <div className="mt-3 text-sm text-gray-400">
              Showing posts with: {selectedTags.map(tagId => {
                const tag = availableTags.find(t => t.id === tagId);
                return tag?.name;
              }).filter(Boolean).join(', ')}
            </div>
          )}
        </div>

        {/* Responsive grid for posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {localPosts.length > 0 ? (
            localPosts.map((post: any) => (
              <div 
                key={post.id}
                className={`bg-neutral-800/80 rounded-lg p-6 border-2 shadow-lg relative ${
                  post.hasBounty && post.bounty && post.bounty.status === 'ACTIVE'
                    ? 'border-cyan-400/60 shadow-cyan-400/20 shadow-lg'
                    : 'border-violet-500/50 shadow-violet-500/20'
                }`}
              >
                {/* Bounty Badge - Top Right */}
                {post.hasBounty && post.bounty && post.bounty.status === 'ACTIVE' && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-semibold rounded-full border border-cyan-400/40">
                      💰 {post.bounty.amount} PORTAL
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author.profilePicture || getProfilePicture(null, post.author.username)}
                      alt={`${post.author.username}'s avatar`}
                      className="w-8 h-8 rounded-full"
                    />
                    <Link 
                      to={`/${post.author.username}`}
                      className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.author.username}
                    </Link>
                    <span className="text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="group">
                  <Link 
                    to={`/posts/${post.id}`}
                    className="block"
                  >
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                      {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                    </h2>
                    <p className="text-gray-300 mb-4 overflow-hidden truncate max-w-full w-full break-words">
                      {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                    </p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag: { id: string; name: string; color: string }) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              border: `1px solid ${tag.color}40`
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {post.media && (
                      <div className="mb-4">
                        {post.media.type.toLowerCase() === 'image' && (
                          <img
                            src={post.media.url}
                            alt="Post media"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        {(post.media.type.toLowerCase() === 'video' || post.media.type.toLowerCase() === 'screen') && (
                          <video
                            src={post.media.url}
                            poster={post.media.thumbnailUrl}
                            controls
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => handleVideoError(post.id, e.currentTarget.error?.message || 'Video error')}
                          />
                        )}
                      </div>
                    )}
                  </Link>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(post.id, post.userVoted ? 0 : 1)}
                      className={`flex items-center space-x-1 transition-colors ${
                        post.userVoted
                          ? 'text-violet-400'
                          : 'text-gray-400 hover:text-violet-400'
                      }`}
                    >
                      <FiTrendingUp className={`w-5 h-5 ${post.userVoted ? 'fill-current' : 'fill-none'}`} />
                      <span>{post.visibilityVotes}</span>
                    </button>
                    <span className="text-gray-400">
                      {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>
                  
                  {/* Integrity Rating Button */}
                  {user && user.id !== post.author.id && (
                    <IntegrityRatingButton
                      targetUser={post.author}
                      context={post.hasBounty ? 'BOUNTY_REJECTION' : 'GENERAL'}
                      referenceId={post.id}
                      referenceType="POST"
                      variant="icon"
                      className="ml-2"
                    />
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
    </Layout>
  );
} 