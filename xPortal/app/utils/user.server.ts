// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm, User, Post, PostForm, Profile } from './types.server'
import { getUser } from './auth.server'
import { addReputationPoints, REPUTATION_POINTS } from './reputation.server'
import { getProfilePicture } from './profile.server'
import { SolanaAddressService } from './solana-address.server'
import type { Db } from './db.server';
import { users, posts, comments, votes, bounties, tags, postTags, profiles, virtualWallets, refundRequests, media, codeBlocks } from '../../drizzle/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function createUser(db: Db, { email, password, username }: RegisterForm) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const { solanaAddress, tokenAccountAddress } = await SolanaAddressService.generateUserAddresses();
    const userId = crypto.randomUUID();
    const [user] = await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
        username,
        solanaAddress,
        tokenAccountAddress,
    }).returning().all();
    await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId: user.id,
        firstName: '',
        lastName: '',
    }).run();
    await db.insert(virtualWallets).values({
        id: crypto.randomUUID(),
        userId: user.id,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalEarned: 0,
        totalSpent: 0,
    }).run();
    return user;
}

export const editUser = async (db: Db, inputData: { profile: Partial<Profile> }, request: Request) => {
    const user = await getUser(request);
    if (!user) throw new Error('User not found');
    const { profile } = inputData;
    const existingProfile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
    if (!existingProfile) {
        await db.insert(profiles).values({
            id: crypto.randomUUID(),
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
        }).run();
    } else {
        await db.update(profiles).set({
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
        }).where(eq(profiles.userId, user.id)).run();
    }
    const updatedUser = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    return updatedUser;
};

export const getUserPosts = async (db: Db, username: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        posts: {
          orderBy: [desc(posts.createdAt)]
        }
      }
    });
    if (!user) return [];
    return user.posts;
  } catch (error) {
    return [];
  }
}

export const createPost = async (db: Db, post: PostForm) => {
  try {
    const postId = crypto.randomUUID();
    const [newPost] = await db.insert(posts).values({
      id: postId,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
    }).returning().all();
    for (const cb of post.codeBlocks) {
      await db.insert(codeBlocks).values({
        id: crypto.randomUUID(),
        postId: newPost.id,
        language: cb.language,
        code: cb.code,
        description: cb.description,
      }).run();
    }
    for (const m of post.media) {
      await db.insert(media).values({
        id: crypto.randomUUID(),
        postId: newPost.id,
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        isScreenRecording: m.isScreenRecording,
        cloudinaryId: m.url.split('/').pop()?.split('.')[0] || 'default',
      }).run();
    }
    await addReputationPoints(db, post.authorId, REPUTATION_POINTS.POST_CREATED, 'POST_CREATED', newPost.id);
    return newPost;
  } catch (error) {
    throw error;
  }
};

export async function deletePost(db: Db, postId: string) {
    await db.delete(posts).where(eq(posts.id, postId)).run();
    return { success: true };
}

type UserLookupType = 'id' | 'email' | 'username';
export async function getUserById(db: Db, userId: string) {
    return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export async function updateUser(db: Db, userId: string, data: { firstName?: string; lastName?: string }) {
    await db.update(profiles).set(data).where(eq(profiles.userId, userId)).run();
    return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export async function deleteUser(db: Db, userId: string) {
    await db.delete(users).where(eq(users.id, userId)).run();
    return { success: true };
}

export async function getAllUsers(db: Db) {
    return db.query.users.findMany();
}

export async function getUserByEmail(db: Db, email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function getUserByUsername(db: Db, username: string) {
    return db.query.users.findFirst({ where: eq(users.username, username) });
}