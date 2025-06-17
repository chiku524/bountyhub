// app/routes/profile.tsx
import { useState } from 'react'
import { Form, useLoaderData, Link, useActionData, useNavigate, useSubmit, useSearchParams } from "@remix-run/react"
import { LoaderFunction, ActionFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { getUserPosts, deletePost } from '~/utils/user.server'
import { Nav } from '../components/nav'
import { FiTrash2, FiEdit2, FiThumbsUp, FiMessageSquare } from 'react-icons/fi'
import { prisma } from '~/utils/prisma.server'
import { getProfilePicture } from '~/utils/profile.server'

type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        username: string;
        profilePicture: string;
    };
    upvotes: number;
    downvotes: number;
    visibilityVotes: number;
    qualityUpvotes: number;
    qualityDownvotes: number;
    userVote: number;
    userQualityVote: number;
    comments: number;
};

interface LoaderData {
    user: {
        id: string;
        username: string;
        profilePicture: string;
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
        profilePicture: user.profile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`
    };

    // Transform the posts data to include author profile pictures
    const transformedPosts = user.posts.map(post => ({
        ...post,
        author: {
            ...post.author,
            profilePicture: post.author.profile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.username)}&background=random`
        }
    }));

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