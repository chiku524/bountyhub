import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { uploadVideo, getVideo, streamVideo } from '~/utils/gridfs';

export const action: ActionFunction = async ({ request }) => {
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('video') as File;
      
      if (!file) {
        return json({ error: 'No video file uploaded' }, { status: 400 });
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        return json({ error: 'Invalid file type. Please upload a video file.' }, { status: 400 });
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        return json({ error: 'File size too large. Maximum size is 100MB.' }, { status: 400 });
      }

      console.log('Starting video upload:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Upload the video
      const result = await uploadVideo(file);

      console.log('Video upload successful:', result);

      // Return the file information
      return json({
        message: 'Video uploaded successfully',
        file: result
      });
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      return json({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
  }
  return json({ error: 'Method not allowed' }, { status: 405 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const filename = url.searchParams.get('filename');

  if (!filename) {
    return json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const file = await getVideo(filename);
    if (!file) {
      return json({ error: 'Video not found' }, { status: 404 });
    }

    const stream = streamVideo(filename);
    return new Response(stream as any, {
      headers: {
        'Content-Type': file.contentType || 'video/mp4',
        'Content-Length': file.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error streaming video:', error);
    return json({ error: 'Failed to stream video' }, { status: 500 });
  }
}; 