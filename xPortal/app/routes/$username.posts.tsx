// app/routes/profile.tsx
import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useActionData, useNavigate, useSubmit, useSearchParams } from "@remix-run/react"
import { FormField } from '~/components/form-field'
import { LoaderFunction, ActionFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { getUserPosts, deletePost } from '~/utils/user.server'
import { Nav } from '../components/nav'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'
import { prisma } from '~/utils/prisma.server'

type Post = {
    id: string;
    title: string;
    content: string;
    blobVideoURL: string | null;
    createdAt: string;
    votes: number;
    author: {
        id: string;
        username: string;
        profilePicture: string | null;
    };
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

interface LoaderData {
    user: {
        id: string;
        username: string;
        profilePicture: string | null;
        posts: Post[];
    };
    currentUser: {
        id: string;
        username: string;
    } | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const { username } = params;
    const currentUser = await getUser(request);

    if (!username) {
        return json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            profile: {
                select: {
                    profilePicture: true
                }
            },
            posts: {
                include: {
                    comments: true,
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    profilePicture: true
                                }
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    });

    if (!user) {
        return json({ error: 'User not found' }, { status: 404 });
    }

    // Transform the user data to include profilePicture
    const transformedUser = {
        ...user,
        profilePicture: user.profile?.profilePicture || null
    };

    // Transform the posts data to include author profile pictures
    const transformedPosts = user.posts.map(post => {
        const videoUrl = post.blobVideoURL && post.blobVideoURL.trim() !== '' ? post.blobVideoURL : null;
        return {
            ...post,
            blobVideoURL: videoUrl,
            author: {
                ...post.author,
                profilePicture: post.author.profile?.profilePicture || null
            }
        };
    });

    return json({ 
        user: {
            ...transformedUser,
            posts: transformedPosts
        },
        currentUser 
    });
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const action = form.get('_action')

    switch (action) {
        case 'deletePost': {
            const postId = form.get('postId') as string;
            if (!postId) {
                return json({ error: 'Post ID is required' }, { status: 400 });
            }

            const user = await getUser(request);
            if (!user) {
                return json({ error: 'Not authenticated' }, { status: 401 });
            }

            try {
                await deletePost(postId);
                return json({ success: true });
            } catch (error) {
                console.error('Delete post error:', error);
                return json({ error: 'Failed to delete post' }, { status: 500 });
            }
        }
        default:
            return json({ error: 'Invalid action' }, { status: 400 });
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
        console.error(`Video error for post ${postId}:`, error);
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

    const renderVideo = (post: Post) => {
        if (!post.blobVideoURL) return null;

        return (
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
                )}
            </div>
        );
    };

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
                            <div 
                                key={post.id} 
                                className="bg-neutral-800/80 rounded-lg p-6 shadow-lg border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 w-full mx-auto flex flex-col"
                                style={{ maxHeight: '600px' }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={user.profilePicture || '/default-avatar.png'} 
                                            alt={user.username}
                                            className="w-10 h-10 rounded-full border-2 border-violet-500/50"
                                        />
                                        <div>
                                            <Link 
                                                to={`/${user.username}`}
                                                className="text-violet-400 hover:text-violet-300 font-medium"
                                            >
                                                {user.username}
                                            </Link>
                                            <p className="text-sm text-gray-400">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Top-right stats for md+ screens */}
                                    <div className="hidden md:flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">
                                            {(typeof post.votes === 'number' ? post.votes : 0)} votes
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
                                    {/* Title and content with more vertical space */}
                                    <div className="min-h-[90px]">
                                        <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                                            {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                                        </h2>
                                        <p className="text-gray-300 mb-4 overflow-hidden truncate max-w-full w-full break-words">
                                            {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                                        </p>
                                    </div>
                                </Link>

                                {/* Add margin above the video */}
                                <div className="mt-4">
                                    {renderVideo(post)}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                    {/* Bottom-left stats for small screens */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex md:hidden items-center space-x-2">
                                            <span className="text-sm text-gray-400">
                                                {(typeof post.votes === 'number' ? post.votes : 0)} votes
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {post.comments.length} comments
                                            </span>
                                        </div>
                                        {/* Removed Vote and Comment buttons */}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
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