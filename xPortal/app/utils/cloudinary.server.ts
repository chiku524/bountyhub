import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(base64Data: string, options: {
  resourceType: 'image' | 'video';
  folder?: string;
  publicId?: string;
}) {
  try {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64String = base64Data.split(',')[1];
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${options.resourceType}/${options.resourceType === 'video' ? 'mp4' : 'jpeg'};base64,${base64String}`,
        {
          resource_type: options.resourceType,
          folder: options.folder || 'portal',
          public_id: options.publicId,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return result as {
      secure_url: string;
      public_id: string;
      resource_type: string;
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload media');
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete media');
  }
} 