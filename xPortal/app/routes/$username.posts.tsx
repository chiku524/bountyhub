// app/routes/profile.tsx
import { Link, useSearchParams, useLoaderData } from "@remix-run/react"
import { FiThumbsUp, FiMessageSquare } from 'react-icons/fi'
import { json as cloudflareJson, LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare'
import { eq, sql, desc } from 'drizzle-orm'
import { users, posts, profiles, comments } from '../../drizzle/schema'
import { getUser } from '~/utils/auth.server'
import { createDb } from "~/utils/db.server"

type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    visibilityVotes: number;
    comments: number;
    hasBounty: boolean;
    upvotes: number;
    author: {
        id: string;
        username: string;
        profilePicture: string | null;
    };
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { username } = params;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  if (!username) {
    throw new Response('Username is required', { status: 400 });
  }

  try {
    const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB);
    const currentUser = await getUser(request, db);

    // Get user data
    const userData = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        solanaAddress: users.solanaAddress,
        createdAt: users.createdAt,
        reputationPoints: users.reputationPoints,
        integrityScore: users.integrityScore,
        totalRatings: users.totalRatings,
        profile: {
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          profilePicture: profiles.profilePicture,
          bio: profiles.bio,
          location: profiles.location,
          website: profiles.website,
          facebook: profiles.facebook,
          twitter: profiles.twitter,
          instagram: profiles.instagram,
          linkedin: profiles.linkedin,
          github: profiles.github,
          youtube: profiles.youtube,
          tiktok: profiles.tiktok,
          discord: profiles.discord,
          reddit: profiles.reddit,
          medium: profiles.medium,
          stackoverflow: profiles.stackoverflow,
          devto: profiles.devto,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.username, username))
      .limit(1);

    if (!userData.length) {
      throw new Response('User not found', { status: 404 });
    }

    const user = userData[0];

    // Get user's posts with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    const postsData = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        visibilityVotes: posts.visibilityVotes,
        qualityUpvotes: posts.qualityUpvotes,
        qualityDownvotes: posts.qualityDownvotes,
        comments: sql<number>`(
          SELECT COUNT(*) FROM ${comments} 
          WHERE ${comments.postId} = ${posts.id}
        )`.as('comments'),
      })
      .from(posts)
      .where(eq(posts.authorId, user.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.authorId, user.id));

    const totalPages = Math.ceil(totalPosts[0].count / limit);

    return cloudflareJson({
      user,
      posts: postsData,
      currentPage: page,
      totalPages,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        solanaAddress: currentUser.solanaAddress,
        createdAt: currentUser.createdAt,
        reputationPoints: currentUser.reputationPoints,
        integrityScore: currentUser.integrityScore,
        totalRatings: currentUser.totalRatings,
      } : null,
    });
  } catch (error) {
    console.error('Error loading user posts:', error);
    throw new Response('Failed to load user posts', { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const user = await getUser(request, undefined, typedContext.env);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB);

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
    const { user, posts } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();

    // Pagination logic
    const POSTS_PER_PAGE = 6;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

    // Map posts to the Post type
    const mappedPosts = paginatedPosts.map((post) => ({
        ...post,
        hasBounty: false, // or get from post if available
        upvotes: post.qualityUpvotes ?? 0, // or another upvote field
        author: {
            id: user.id,
            username: user.username,
            profilePicture: user.profile?.profilePicture || null,
        },
    }));

    const renderPost = (post: Post) => (
        <div key={post.id} className="bg-neutral-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={post.author.profilePicture || '/default-avatar.svg'}
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
            <div className="flex-1 overflow-y-auto">
                <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
                    <div className="mb-6 flex justify-between items-center mt-16">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Posts by {user.username}
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
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
                        {mappedPosts.map((post: Post) => (
                            renderPost(post)
                        ))}
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