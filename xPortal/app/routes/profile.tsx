// app/routes/profile.tsx
import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link } from "@remix-run/react"
import { LoaderFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'
import { requireUserId } from '~/utils/auth.server'

interface LoaderData {
  user: {
    id: string;
    username: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
      profilePicture: string | null;
      bio: string | null;
      location: string | null;
      website: string | null;
      twitter: string | null;
      github: string | null;
      linkedin: string | null;
    } | null;
  };
  posts: Array<{
    id: string;
    title: string;
    content: string;
    blobVideoURL: string | null;
    createdAt: string;
    comments: { id: string }[];
  }>;
}

interface Profile {
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    twitter?: string | null;
    github?: string | null;
    linkedin?: string | null;
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
            profile: true,
            posts: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    blobVideoURL: true,
                    createdAt: true,
                    comments: true
                }
            }
        }
    });

    if (!userData) {
        throw new Response("User not found", { status: 404 });
    }

    return json({ user: userData, posts: userData.posts });
};

export default function Profile() {
  const { user, posts } = useLoaderData<LoaderData>();
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});

  const handleVideoError = (postId: string, error: string) => {
    console.error(`Video error for post ${postId}:`, error);
    setVideoErrors(prev => ({ ...prev, [postId]: error }));
  };

  if (!user) {
    return (
      <div className="h-screen w-full bg-neutral-900 flex flex-row">
        <Nav />
        <div className='flex flex-col justify-center items-center w-full h-full'>
          <h1 className="text-white text-2xl">Please log in to view your profile</h1>
          <Link to="/login" className="mt-4 text-indigo-400 hover:text-indigo-300">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
      <Nav />
      <div className='flex flex-col w-full h-full overflow-hidden'>
        <div className='flex-1 overflow-y-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-white">Your Profile</h1>
              <Link 
                to="/posts/create" 
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create Post</span>
              </Link>
            </div>
            <div className="bg-neutral-800/80 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-indigo-500">
                  {user.profile?.profilePicture ? (
                    <img 
                      src={user.profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-white">
                      {user.profile?.firstName?.[0] || user.username[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </h2>
                  <p className="text-gray-400">@{user.username}</p>
                </div>
              </div>
              {user.profile?.bio && (
                <p className="mt-4 text-gray-300">{user.profile.bio}</p>
              )}
              <div className="mt-4 flex space-x-4">
                {user.profile?.github && (
                  <a href={user.profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    GitHub
                  </a>
                )}
                {user.profile?.linkedin && (
                  <a href={user.profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    LinkedIn
                  </a>
                )}
                {user.profile?.website && (
                  <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Posts Section */}
            <div className="bg-neutral-800/80 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Your Posts</h2>
                <Link
                  to={`/${user.username}/posts`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  See all posts
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.slice(0, 4).map((post: { id: string; title: string; content: string; blobVideoURL: string | null; createdAt: string; comments: { id: string }[]; }) => (
                  <div key={post.id} className="bg-neutral-700 rounded-lg p-4">
                    <Link to={`/posts/${post.id}`} className="block">
                      <h3 className="text-lg font-medium text-white mb-2">
                        {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{post.content}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{post.comments.length} comments</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
