import { json } from '@remix-run/node';
import { getUser } from '~/utils/auth.server';

// Lazy import to ensure Prisma client is fully initialized
let prisma: any = null;

const getPrisma = async () => {
  if (!prisma) {
    const { prisma: prismaClient } = await import('~/utils/prisma.server');
    prisma = prismaClient;
  }
  return prisma;
};

export const loader = async ({ request }: { request: Request }) => {
  try {
    const user = await getUser(request);
    
    if (!user) {
      return json({ status: {} }, { status: 401 });
    }
    
    // Get postIds from URL search params
    const url = new URL(request.url);
    const postIdsParam = url.searchParams.get('postIds');
    
    if (!postIdsParam) {
      return json({ status: {} });
    }
    
    const postIds = JSON.parse(postIdsParam);
    
    if (!Array.isArray(postIds)) {
      return json({ status: {} });
    }
    
    const prismaClient = await getPrisma();
    if (!prismaClient) {
      return json({ status: {} }, { status: 500 });
    }
    
    const bookmarks = await prismaClient.bookmark.findMany({
      where: {
        userId: user.id,
        postId: { in: postIds }
      },
      select: { postId: true }
    });
    
    const status: Record<string, boolean> = {};
    postIds.forEach((id: string) => {
      status[id] = bookmarks.some((b: any) => b.postId === id);
    });
    
    return json({ status });
  } catch (error) {
    console.error('Error in bookmark status API:', error);
    return json({ status: {} }, { status: 500 });
  }
};

export default function () { return null; } 