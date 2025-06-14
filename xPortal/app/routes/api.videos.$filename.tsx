import { LoaderFunction } from '@remix-run/node';
import { GridFSBucket } from 'mongodb';
import { getMongoClient } from '~/utils/mongodb.server';

export const loader: LoaderFunction = async ({ params }) => {
  const { filename } = params;
  
  if (!filename) {
    return new Response('Filename is required', { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const db = client.db();
    
    // Initialize GridFS bucket with the correct bucket name
    const bucket = new GridFSBucket(db, {
      bucketName: 'videos'
    });

    // First check if the file exists
    const files = await bucket.find({ filename }).toArray();
    if (files.length === 0) {
      console.error(`Video not found: ${filename}`);
      return new Response('Video not found', { status: 404 });
    }

    const file = files[0];
    
    // Get the correct content type from the file metadata
    const contentType = file.contentType || 'video/mp4';
    
    // Create the download stream
    const downloadStream = bucket.openDownloadStreamByName(filename);
    
    // Handle stream errors
    downloadStream.on('error', (error) => {
      console.error('Stream error:', error);
    });

    return new Response(downloadStream as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': file.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error streaming video:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error streaming video',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 