// Cloudinary implementation for Cloudflare Workers using REST API
// This avoids the Node.js SDK which uses dynamic requires

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export async function uploadToCloudinary(base64Data: string, options: {
  resourceType: 'image' | 'video';
  folder?: string;
  publicId?: string;
}) {
  try {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64String = base64Data.split(',')[1];
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration missing');
    }

    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', `data:${options.resourceType}/${options.resourceType === 'video' ? 'mp4' : 'jpeg'};base64,${base64String}`);
    formData.append('resource_type', options.resourceType);
    formData.append('folder', options.folder || 'portal');
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }
    formData.append('overwrite', 'true');

    // Create authorization header
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature({
      timestamp,
      folder: options.folder || 'portal',
      overwrite: 'true',
      resourceType: options.resourceType,
      apiSecret
    });

    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const result = await response.json() as CloudinaryUploadResponse;
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload media');
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration missing');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature({
      timestamp,
      publicId,
      apiSecret
    });

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary delete failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete media');
  }
}

async function generateSignature(params: {
  timestamp: number;
  publicId?: string;
  folder?: string;
  overwrite?: string;
  resourceType?: string;
  apiSecret: string;
}): Promise<string> {
  // Create the string to sign
  let stringToSign = '';
  
  if (params.publicId) {
    stringToSign += `public_id=${params.publicId}&`;
  }
  if (params.folder) {
    stringToSign += `folder=${params.folder}&`;
  }
  if (params.overwrite) {
    stringToSign += `overwrite=${params.overwrite}&`;
  }
  if (params.resourceType) {
    stringToSign += `resource_type=${params.resourceType}&`;
  }
  
  stringToSign += `timestamp=${params.timestamp}`;

  // Create SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign + params.apiSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
} 