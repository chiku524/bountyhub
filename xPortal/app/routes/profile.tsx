// app/routes/profile.tsx
import { Form, useLoaderData, Link } from "@remix-run/react"
import { LoaderFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'
import { requireUserId } from '~/utils/auth.server'
import { ProfilePictureUpload } from '~/components/ProfilePictureUpload'

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
    posts: Array<{
      id: string;
      title: string;
      content: string;
      createdAt: Date;
    }>;
  };
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
                    createdAt: true,
                },
            },
        },
    });

    if (!userData) {
        throw new Response("User not found", { status: 404 });
    }

    return json({ user: userData });
};

export default function Profile() {
  const { user } = useLoaderData<LoaderData>();

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
      <div className="flex-1 overflow-y-auto">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          </div>

          <div className="bg-neutral-800/80 rounded-lg p-6 shadow-lg border border-violet-500/20">
            <div className="flex items-start space-x-6">
              <ProfilePictureUpload 
                currentPicture={user.profile?.profilePicture || null}
                username={user.username}
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                <Form method="post" className="space-y-4">
                  {/* Existing form fields */}
                </Form>
              </div>
            </div>
          </div>

          {/* Your Posts Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Your Posts</h2>
            {user.posts && user.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.posts.map((post) => (
                  <div key={post.id} className="bg-neutral-800/80 rounded-lg p-4 border border-violet-500/20 shadow-md hover:shadow-violet-500/40 transition-shadow">
                    <h3 className="text-lg font-semibold text-violet-300 mb-2 truncate">{post.title}</h3>
                    <p className="text-gray-300 mb-2 line-clamp-3">{post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                      <Link to={`/posts/${post.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium underline">View Post</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No posts yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
