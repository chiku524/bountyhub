import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPostCreation() {
  try {
    console.log('🧪 Testing basic post creation functionality...\n');

    // 1. Check if there are any users
    const users = await prisma.user.findMany({
      take: 1,
      select: { id: true, username: true }
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please create a user account first.');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.username}`);

    // 2. Check if virtual wallet exists for the user
    const wallet = await prisma.virtualWallet.findUnique({
      where: { userId: testUser.id }
    });

    if (!wallet) {
      console.log('⚠️  No virtual wallet found for user. One will be created automatically.');
    } else {
      console.log(`💰 User wallet balance: ${wallet.balance} PORTAL`);
    }

    // 3. Check database connection and basic operations
    const testPost = await prisma.posts.create({
      data: {
        title: 'Test Post - Will be deleted',
        content: 'This is a test post to verify database connectivity.',
        authorId: testUser.id,
        hasBounty: false
      }
    });

    console.log(`✅ Successfully created test post with ID: ${testPost.id}`);

    // 4. Clean up test post
    await prisma.posts.delete({
      where: { id: testPost.id }
    });

    console.log('✅ Successfully deleted test post');

    console.log('\n🎉 Basic post creation functionality is working!');
    console.log('💡 The issue might be related to:');
    console.log('   - Media upload processing');
    console.log('   - Client-side blob URL conversion');
    console.log('   - Cloudinary upload configuration');
    console.log('   - Environment variables on Vercel');

  } catch (error) {
    console.error('❌ Error testing post creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPostCreation(); 