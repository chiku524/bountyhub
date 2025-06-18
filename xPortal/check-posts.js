const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPosts() {
  try {
    const posts = await prisma.posts.findMany({
      include: {
        media: true,
        codeBlocks: true,
        bounty: true,
        author: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('Recent posts:');
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post: ${post.title}`);
      console.log(`   Author: ${post.author.username}`);
      console.log(`   Content: ${post.content.substring(0, 100)}...`);
      console.log(`   Media count: ${post.media.length}`);
      console.log(`   Code blocks count: ${post.codeBlocks.length}`);
      console.log(`   Has bounty: ${post.hasBounty}`);
      console.log(`   Bounty:`, post.bounty);
      
      if (post.media.length > 0) {
        console.log(`   Media:`, post.media.map(m => ({ type: m.type, url: m.url })));
      }
      
      if (post.codeBlocks.length > 0) {
        console.log(`   Code blocks:`, post.codeBlocks.map(cb => ({ language: cb.language, code: cb.code.substring(0, 50) + '...' })));
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosts(); 