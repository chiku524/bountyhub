// app/routes/profile.tsx
import { Layout } from '~/components/layout'
import { FormField } from '~/components/form-field'
import { Form, useLoaderData, Link  } from "@remix-run/react"
import { LoaderFunction, ActionFunction, json, redirect } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { editUser } from '~/utils/user.server'
import { useEffect, useState } from 'react'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'
import { LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { validateName, validateUsername, validateUrl } from "~/utils/validators.server";

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

interface UserData {
    id: string;
    email: string;
    username: string;
    profile: Profile | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await requireUserId(request);
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!userData) {
        throw new Response("User not found", { status: 404 });
    }

    return json({ userData });
};

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const action = form.get("_action");
    const user = await getUser(request);

    if (!user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current user data to preserve existing values
    const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            email: true,
            username: true,
            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    website: true,
                    bio: true,
                    location: true,
                    twitter: true,
                    github: true,
                    linkedin: true
                }
            }
        }
    });

    if (!currentUser) {
        return json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
        case 'logout': {
            return await logout(request);
        }
        case 'update': {
            const updateData = {
                email: form.get('email')?.toString() || currentUser.email,
                username: form.get('username')?.toString() || currentUser.username,
                profile: {
                    firstName: form.get('firstName')?.toString() || currentUser.profile?.firstName || '',
                    lastName: form.get('lastName')?.toString() || currentUser.profile?.lastName || '',
                    profilePicture: form.get('profilePicture')?.toString() || currentUser.profile?.profilePicture || '',
                    website: form.get('website')?.toString() || currentUser.profile?.website || '',
                    bio: form.get('bio')?.toString() || currentUser.profile?.bio || '',
                    location: form.get('location')?.toString() || currentUser.profile?.location || '',
                    twitter: form.get('twitter')?.toString() || currentUser.profile?.twitter || '',
                    github: form.get('github')?.toString() || currentUser.profile?.github || '',
                    linkedin: form.get('linkedin')?.toString() || currentUser.profile?.linkedin || ''
                }
            };
            return await editUser(updateData, request);
        }
        case 'updateProfile': {
            const name = form.get("name") as string;
            const bio = form.get("bio") as string;
            const location = form.get("location") as string;
            const website = form.get("website") as string | null;

            const nameError = validateName(name);
            if (nameError) {
                return json({ error: nameError });
            }

            const websiteError = validateUrl(website);
            if (websiteError) {
                return json({ error: websiteError });
            }

            const userId = await requireUserId(request);
            await editUser({
                profile: {
                    firstName: name,
                    lastName: '',
                    bio: bio || '',
                    location: location || '',
                    website: website || '',
                    twitter: undefined,
                    github: undefined,
                    linkedin: undefined,
                    profilePicture: undefined
                }
            }, request);
            return redirect("/settings");
        }
        default:
            return json({ error: 'Invalid action' }, { status: 400 });
    }
}

export default function Profile() {
    const { userData } = useLoaderData<{ userData: UserData }>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<string>('');

    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-row">
            <Nav />
            <div className="flex-1 flex items-center justify-center">
                <div className='w-4/5 h-2/3 flex flex-col bg-slate-300 text-slate-800 rounded-lg overflow-y-scroll relative border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-200 [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-600'>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                    <div className="relative">
                        <span className='mx-auto mt-10 font-bold text-xl block text-center'>Profile Settings</span>
                        <hr className='border-b border-slate-700 w-full mt-3 self-center' />
                        
                        {/* Profile Picture Section */}
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Profile Picture</div>
                            <div className='flex items-center gap-4 p-4'>
                                <div className='relative w-24 h-24 rounded-full overflow-hidden bg-gray-200'>
                                    {userData.profile?.profilePicture ? (
                                        <img 
                                            src={userData.profile.profilePicture} 
                                            alt="Profile" 
                                            className='w-full h-full object-cover'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <Form method="post" encType="multipart/form-data" className="flex-1">
                                    <input
                                        type="file"
                                        name="profilePicture"
                                        accept="image/*"
                                        className="hidden"
                                        id="profilePicture"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('profilePicture', file);
                                                formData.append('_action', 'updateProfilePicture');
                                                fetch('/api/upload/profile-picture', {
                                                    method: 'POST',
                                                    body: formData
                                                }).then(response => {
                                                    if (response.ok) {
                                                        window.location.reload();
                                                    }
                                                });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="profilePicture"
                                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                                    >
                                        Upload New Picture
                                    </label>
                                </Form>
                            </div>
                        </div>

                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Name</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>
                                {userData.profile?.firstName && userData.profile?.lastName ? 
                                    `${userData.profile.firstName} ${userData.profile.lastName}` : 
                                    'Not set'}
                            </div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => {setEditModalOpen(true); setEditData('name')}}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Email</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.email}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => {setEditModalOpen(true); setEditData('email')}}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Bio</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.bio || 'Not set'}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => {setEditModalOpen(true); setEditData('bio')}}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Username</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.username ? userData.username : 'Not set'}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => {setEditModalOpen(true); setEditData('username')}}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Website</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.website || 'Not set'}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => {setEditModalOpen(true); setEditData('website')}}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Socials</div>
                            <div className='flex flex-row justify-around gap-5'>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.github ? userData.profile.github : 'Not set'}</div>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.twitter ? userData.profile.twitter : 'Not set'}</div>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.linkedin ? userData.profile.linkedin : 'Not set'}</div>
                            </div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => {setEditModalOpen(true); setEditData('socials')}}>Edit</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {editData === 'name' ? 'Edit Name' :
                             editData === 'email' ? 'Edit Email' :
                             editData === 'username' ? 'Edit Username' :
                             editData === 'website' ? 'Edit Website' :
                             'Edit Social Links'}
                        </h2>
                        <Form method="post" className="space-y-4">
                            {editData === 'name' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            defaultValue={userData.profile?.firstName || ''}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            defaultValue={userData.profile?.lastName || ''}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            {editData === 'email' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={userData.email}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            {editData === 'username' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        defaultValue={userData.username || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            {editData === 'website' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        defaultValue={userData.profile?.website || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            )}
                            {editData === 'socials' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Twitter</label>
                                        <input
                                            type="text"
                                            name="twitter"
                                            defaultValue={userData.profile?.twitter || ''}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">GitHub</label>
                                        <input
                                            type="text"
                                            name="github"
                                            defaultValue={userData.profile?.github || ''}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                                        <input
                                            type="text"
                                            name="linkedin"
                                            defaultValue={userData.profile?.linkedin || ''}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            <input type="hidden" name="_action" value="updateProfile" />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    )
}
