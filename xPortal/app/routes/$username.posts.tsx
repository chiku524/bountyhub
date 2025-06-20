// app/routes/profile.tsx
import { useState } from 'react'
import { Form, useLoaderData, Link, useActionData, useNavigate, useSubmit, useSearchParams } from "@remix-run/react"
import { LoaderFunction, ActionFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { getUserPosts, deletePost } from '~/utils/user.server'
import { Nav } from '../components/nav'
import { FiTrash2, FiEdit2, FiThumbsUp, FiMessageSquare } from 'react-icons/fi'
import { getProfilePicture } from '~/utils/profile.server'
import { json as cloudflareJson, LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare'
import { eq, and } from 'drizzle-orm'
import { users, posts, profiles, votes, comments } from '../../drizzle/schema'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    visibilityVotes: number;
    comments: number;
    hasBounty: boolean;
    author: {
        id: string;
        username: string;
        profilePicture: string | null;
    };
};

type User = {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    reputationPoints: number;
    integrityScore: number;
    totalRatings: number;
};

interface LoaderData {
    user: User;
    posts: Post[];
}

interface CloudflareContext {
  env: {
    DB: DrizzleD1Database<typeof import('../../drizzle/schema')>;
  };
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { username } = params;
  
  if (!username) {
    throw new Response('Username is required', { status: 400 });
  }

  try {
    const db = (context as unknown as CloudflareContext).env.DB;

    // First, find the user
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        reputationPoints: users.reputationPoints,
        integrityScore: users.integrityScore,
        totalRatings: users.totalRatings,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user.length) {
      throw new Response('User not found', { status: 404 });
    }

    // Get user's posts with vote counts
    const userPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        visibilityVotes: posts.visibilityVotes,
        qualityUpvotes: posts.qualityUpvotes,
        qualityDownvotes: posts.qualityDownvotes,
        hasBounty: posts.hasBounty,
        status: posts.status,
        author: {
          id: users.id,
          username: users.username,
        },
        profile: {
          profilePicture: profiles.profilePicture,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(posts.authorId, user[0].id))
      .orderBy(posts.createdAt);

    // Get comment counts for each post
    const postIds = userPosts.map((post: any) => post.id);
    const commentCounts = await db
      .select({
        postId: comments.postId,
        count: comments.id,
      })
      .from(comments)
      .where(and(eq(comments.postId, postIds[0]), ...postIds.slice(1).map((id: string) => eq(comments.postId, id))));

    // Transform the data to match expected format
    const transformedPosts = userPosts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      visibilityVotes: post.visibilityVotes,
      comments: commentCounts.find((c: any) => c.postId === post.id)?.count || 0,
      hasBounty: post.hasBounty,
      author: {
        id: post.author.id,
        username: post.author.username,
        profilePicture: post.profile?.profilePicture || null,
      },
    }));

    return json({ 
      user: user[0],
      posts: transformedPosts,
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new Response('Failed to fetch user posts', { status: 500 });
  }
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const user = await getUser(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    const db = (context as unknown as CloudflareContext).env.DB;

    switch (action) {
      case 'deletePost': {
        const postId = formData.get('postId') as string;
        
        if (!postId) {
          return cloudflareJson({ error: 'Post ID is required' }, { status: 400 });
        }

        // Check if user owns the post
        const post = await db
          .select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);

        if (!post.length || post[0].authorId !== user.id) {
          return cloudflareJson({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the post (cascade will handle related data)
        await db.delete(posts).where(eq(posts.id, postId));

        return cloudflareJson({ success: true });
      }

      default:
        return cloudflareJson({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return cloudflareJson({ error: 'Failed to process action' }, { status: 500 });
  }
}

export default function UserPosts() {
    const { user, currentUser } = useLoaderData<typeof loader>();
    const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
    const submit = useSubmit();
    const navigate = useNavigate();
    const actionData = useActionData();
    const [searchParams, setSearchParams] = useSearchParams();

    // Pagination logic
    const POSTS_PER_PAGE = 6;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const totalPosts = user.posts.length;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const paginatedPosts = user.posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

    const handleVideoError = (postId: string, error: string) => {
        setVideoErrors(prev => ({ ...prev, [postId]: error }));
    };

    const handleVote = (postId: string) => {
        const formData = new FormData();
        formData.append('action', 'vote');
        formData.append('postId', postId);
        submit(formData, { method: 'post' });
    };

    const handleDelete = (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const formData = new FormData();
            formData.append('_action', 'deletePost');
            formData.append('postId', postId);
            submit(formData, { method: 'post' });
        }
    };

    const isPostOwner = (post: Post) => {
        return currentUser?.id === post.author.id;
    };

    const renderPost = (post: Post) => (
        <div key={post.id} className="bg-neutral-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={post.author.profilePicture}
                        alt={`${post.author.username}'s profile`}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <Link to="/profile" className="text-white hover:text-violet-400">
                            {post.author.username}
                        </Link>
                        <p className="text-sm text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <Link to={`/posts/${post.id}`} className="block">
                <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-gray-300 mb-4">{post.content}</p>
            </Link>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <FiThumbsUp className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">{post.upvotes}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FiMessageSquare className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">{post.comments}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
            <Nav />
            <div className="flex-1 overflow-y-auto">
                <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
                    <div className="mb-6 flex justify-between items-center mt-16">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Posts by {user.username}
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {user.posts.length} {user.posts.length === 1 ? 'post' : 'posts'}
                            </p>
                        </div>
                        <Link 
                            to="/posts/create" 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <span>Create Post</span>
                        </Link>
                    </div>

                    {/* Responsive grid for posts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {paginatedPosts.map((post: Post) => (
                            renderPost(post))
                        )}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            <button
                                onClick={() => setSearchParams({ page: String(page - 1) })}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setSearchParams({ page: String(i + 1) })}
                                    className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-violet-500 text-white' : 'bg-gray-700 text-white'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setSearchParams({ page: String(page + 1) })}
                                disabled={page === totalPages}
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