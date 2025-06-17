// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm, User, Post, PostForm, Profile } from './types.server'
import { getUser } from './auth.server'
import { prisma } from './prisma.server'
import { addReputationPoints, REPUTATION_POINTS } from './reputation.server'
import { getProfilePicture } from './profile.server'

export async function createUser({ email, password, username }: RegisterForm) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
            profile: {
                create: {
                    firstName: '',
                    lastName: '',
                },
            },
        },
    })
    return user
}

export const editUser = async (inputData: { profile: Partial<Profile> }, request: Request) => {
    const user = await getUser(request);
    if (!user) {
        throw new Error('User not found');
    }

    const { profile } = inputData;

    // First, ensure the profile exists
    const existingProfile = await prisma.profile.findUnique({
        where: { userId: user.id }
    });

    if (!existingProfile) {
        // Create new profile
        const newProfile = await prisma.profile.create({
            data: {
                userId: user.id,
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                profilePicture: profile.profilePicture,
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || '',
                facebook: profile.facebook || '',
                twitter: profile.twitter || '',
                instagram: profile.instagram || '',
                linkedin: profile.linkedin || '',
                github: profile.github || '',
                youtube: profile.youtube || '',
                tiktok: profile.tiktok || '',
                discord: profile.discord || '',
                reddit: profile.reddit || '',
                medium: profile.medium || '',
                stackoverflow: profile.stackoverflow || '',
                devto: profile.devto || ''
            }
        });
    } else {
        // Update existing profile
        const updatedProfile = await prisma.profile.update({
            where: { userId: user.id },
            data: {
                firstName: profile.firstName ?? existingProfile.firstName,
                lastName: profile.lastName ?? existingProfile.lastName,
                profilePicture: profile.profilePicture ?? existingProfile.profilePicture,
                bio: profile.bio ?? existingProfile.bio,
                location: profile.location ?? existingProfile.location,
                website: profile.website ?? existingProfile.website,
                facebook: profile.facebook ?? existingProfile.facebook,
                twitter: profile.twitter ?? existingProfile.twitter,
                instagram: profile.instagram ?? existingProfile.instagram,
                linkedin: profile.linkedin ?? existingProfile.linkedin,
                github: profile.github ?? existingProfile.github,
                youtube: profile.youtube ?? existingProfile.youtube,
                tiktok: profile.tiktok ?? existingProfile.tiktok,
                discord: profile.discord ?? existingProfile.discord,
                reddit: profile.reddit ?? existingProfile.reddit,
                medium: profile.medium ?? existingProfile.medium,
                stackoverflow: profile.stackoverflow ?? existingProfile.stackoverflow,
                devto: profile.devto ?? existingProfile.devto
            }
        });
    }

    // Return the updated user with profile
    const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true }
    });
    
    if (!updatedUser) {
        throw new Error('Failed to fetch updated user data');
    }
    
    return updatedUser;
};

export const getUserPosts = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        posts: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return [];
    }

    return user.posts;
  } catch (error) {
    return [];
  }
}

export const createPost = async (post: PostForm) => {
  try {
    const newPost = await prisma.posts.create({
      data: {
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        codeBlocks: {
          create: post.codeBlocks
        },
        media: {
          create: post.media
        }
      }
    });

    // Award reputation points for creating a post
    await addReputationPoints(
      post.authorId,
      REPUTATION_POINTS.POST_CREATED,
      'POST_CREATED',
      newPost.id
    );

    return newPost;
  } catch (error) {
    throw error;
  }
};

export async function deletePost(postId: string) {
    try {
        await prisma.posts.delete({
            where: { id: postId }
        });

        return { success: true };
    } catch (error) {
        throw error;
    }
}

type UserLookupType = 'id' | 'email' | 'username';
export async function getUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    })
}

export async function updateUser(userId: string, data: { firstName?: string; lastName?: string }) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            profile: {
                update: data,
            },
        },
        include: { profile: true },
    })
}

export async function deleteUser(userId: string) {
    return prisma.user.delete({
        where: { id: userId },
    })
}

export async function getAllUsers() {
    return prisma.user.findMany({
        include: { profile: true },
    })
}

export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
        include: { profile: true },
    })
}

export async function getUserByUsername(username: string) {
    return prisma.user.findUnique({
        where: { username },
        include: { profile: true },
    })
}