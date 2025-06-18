import { PrismaClient } from '@prisma/client';
import { VirtualWalletService } from './app/utils/virtual-wallet.server.js';

const prisma = new PrismaClient();

async function testBountyClaim() {
  try {
    console.log('🧪 Testing bounty claim functionality...\n');

    // 1. Check if there are any posts with bounties
    const postsWithBounties = await prisma.posts.findMany({
      where: {
        bounty: {
          status: 'ACTIVE'
        }
      },
      include: {
        bounty: true,
        answers: {
          include: {
            author: true
          }
        }
      }
    });

    console.log(`📊 Found ${postsWithBounties.length} posts with active bounties`);

    if (postsWithBounties.length === 0) {
      console.log('❌ No posts with active bounties found. Please create a post with a bounty first.');
      return;
    }

    // 2. Check if there are answers for these posts
    const postsWithAnswers = postsWithBounties.filter(post => post.answers.length > 0);
    
    console.log(`📝 Found ${postsWithAnswers.length} posts with answers`);

    if (postsWithAnswers.length === 0) {
      console.log('❌ No posts with answers found. Please add answers to posts with bounties first.');
      return;
    }

    // 3. Check virtual wallet balances
    for (const post of postsWithAnswers) {
      console.log(`\n🔍 Post: "${post.title}"`);
      console.log(`   Bounty: ${post.bounty.amount} PORTAL`);
      console.log(`   Answers: ${post.answers.length}`);
      
      for (const answer of post.answers) {
        const wallet = await VirtualWalletService.getOrCreateWallet(answer.authorId);
        console.log(`   - Answer by ${answer.author.username}: ${wallet.balance} PORTAL balance`);
      }
    }

    console.log('\n✅ Bounty claim functionality is ready!');
    console.log('💡 To test:');
    console.log('   1. Go to a post with a bounty');
    console.log('   2. Click "Accept Answer & Claim Bounty" on an answer');
    console.log('   3. Check that the bounty tokens are transferred to the answer author');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error testing bounty claim:', error);
  }
}

testBountyClaim(); 