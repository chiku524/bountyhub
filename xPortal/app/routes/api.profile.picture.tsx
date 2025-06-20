import { json, type ActionFunctionArgs } from '@remix-run/node';
import { getUser } from '~/utils/auth.server';
import { createDb } from '~/utils/db.server';
import { uploadToCloudinary } from '~/utils/cloudinary.server';
import { profiles } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const db = createDb((context as any).env.DB)
    const user = await getUser(request, db);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('profilePicture') as File;
    
    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(dataUrl, {
      resourceType: 'image',
      folder: 'profile-pictures'
    });
    
    if (!uploadResult.secure_url) {
      throw new Error('Failed to upload image');
    }

    // Update user's profile picture in database
    await db.update(profiles)
      .set({ profilePicture: uploadResult.secure_url })
      .where(eq(profiles.userId, user.id))
      .run();

    return json({ 
      success: true,
      profilePicture: uploadResult.secure_url
    });
  } catch (error) {
    return json({ 
      error: 'Failed to upload profile picture',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 