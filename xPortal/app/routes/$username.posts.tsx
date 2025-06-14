// app/routes/profile.tsx
import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useActionData, useNavigate, useSubmit } from "@remix-run/react"
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
        );
    };

    return (
        <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
            <Nav />
            <div className="flex-1 overflow-y-auto">
                <div className="w-[85%] max-w-4xl mx-auto mt-4 px-4">
                    <div className="mb-6 flex justify-between items-center">
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

                    <div className="space-y-6">
                        {user.posts.map((post: Post) => (
                            <div 
                                key={post.id} 
                                className="bg-neutral-800/80 rounded-lg p-6 shadow-lg border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300"
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
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">
                                            {post.votes} votes
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {post.comments.length} comments
                                        </span>
                                    </div>
                                </div>

                                <Link 
                                    to={`/posts/${post.id}`}
                                    className="block group"
                                >
                                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>
                                </Link>

                                {renderVideo(post)}

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleVote(post.id)}
                                            className="flex items-center space-x-1 text-gray-400 hover:text-violet-400 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
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
                </div>
            </div>
        </div>
    );
}