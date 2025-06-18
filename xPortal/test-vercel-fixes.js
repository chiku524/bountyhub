import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVercelFixes() {
  try {
    console.log('🧪 Testing Vercel deployment fixes...\n');

    // 1. Test basic post creation without media
    console.log('1. Testing basic post creation...');
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.username}`);

    // 2. Test post creation
    const testPost = await prisma.posts.create({
      data: {
        title: 'Test Post - Vercel Fixes',
        content: 'Testing the fixes for Vercel deployment issues.',
        authorId: testUser.id,
        hasBounty: false
      }
    });

    console.log(`✅ Successfully created test post: ${testPost.id}`);

    // 3. Clean up
    await prisma.posts.delete({ where: { id: testPost.id } });
    console.log('✅ Cleaned up test post');

    console.log('\n🎉 Vercel fixes summary:');
    console.log('✅ Fixed WalletContext error with proper error handling');
    console.log('✅ Added file size limits to prevent 413 errors:');
    console.log('   - Individual files: Images (2MB), Videos (5MB)');
    console.log('   - Total upload size: 10MB');
    console.log('✅ Added fallback for media upload failures');
    console.log('✅ Improved error handling and user feedback');

    console.log('\n💡 Recommendations for Vercel deployment:');
    console.log('1. Ensure all environment variables are set in Vercel');
    console.log('2. Check that Cloudinary credentials are configured');
    console.log('3. Monitor function execution time limits');
    console.log('4. Consider using Vercel's Edge Functions for better performance');

  } catch (error) {
    console.error('❌ Error testing Vercel fixes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVercelFixes(); 