import { requireUserId } from './auth.server';

// Lazy import to ensure Prisma client is fully initialized
let prisma: any = null;

const getPrisma = async () => {
  if (!prisma) {
    const { prisma: prismaClient } = await import('./prisma.server');
    prisma = prismaClient;
  }
  return prisma;
};

export async function toggleBookmark(userId: string, postId: string) {
  const prismaClient = await getPrisma();
  
  try {
    // Check if bookmark already exists
    const existingBookmark = await prismaClient.bookmark.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await prismaClient.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      });
      return { isBookmarked: false };
    } else {
      // Add bookmark
      await prismaClient.bookmark.create({
        data: {
          userId,
          postId
        }
      });
      return { isBookmarked: true };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw new Error('Failed to toggle bookmark');
  }
}

export async function getUserBookmarks(userId: string, page: number = 1, perPage: number = 10) {
  const prismaClient = await getPrisma();
  
  // Debug: Check if prisma is available in the function
  if (!prismaClient) {
    console.error('Prisma client is undefined in getUserBookmarks');
    throw new Error('Database connection not available');
  }
  
  try {
    const skip = (page - 1) * perPage;

    const [bookmarks, totalCount] = await Promise.all([
      prismaClient.bookmark.findMany({
        where: { userId },
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      profilePicture: true
                    }
                  }
                }
              },
              media: {
                take: 1,
                orderBy: {
                  createdAt: 'asc'
                }
              },
              bounty: true,
              postTags: {
                include: {
                  tag: true
                }
              },
              _count: {
                select: {
                  comments: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: perPage
      }),
      prismaClient.bookmark.count({
        where: { userId }
      })
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    return {
      bookmarks: bookmarks.map((bookmark: any) => ({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        post: {
          id: bookmark.post.id,
          title: bookmark.post.title,
          content: bookmark.post.content,
          media: bookmark.post.media?.[0] || null,
          author: {
            id: bookmark.post.author.id,
            username: bookmark.post.author.username,
            profilePicture: bookmark.post.author.profile?.profilePicture || null
          },
          createdAt: bookmark.post.createdAt.toISOString(),
          visibilityVotes: bookmark.post.visibilityVotes,
          comments: bookmark.post._count.comments,
          hasBounty: bookmark.post.hasBounty,
          bounty: bookmark.post.bounty,
          tags: bookmark.post.postTags.map((pt: any) => ({
            id: pt.tag.id,
            name: pt.tag.name,
            color: pt.tag.color
          }))
        }
      })),
      totalCount,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    throw new Error('Failed to fetch bookmarks');
  }
}

export async function isPostBookmarked(userId: string, postId: string) {
  const prismaClient = await getPrisma();
  
  try {
    const bookmark = await prismaClient.bookmark.findFirst({
      where: {
        userId,
        postId
      }
    });
    return !!bookmark;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
} 