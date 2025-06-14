import mongoose from 'mongoose';
import { GridFSBucket, Db } from 'mongodb';
import { Readable } from 'stream';

// Create GridFS bucket
let bucket: GridFSBucket;

// Initialize GridFS
export const initGridFS = async () => {
  try {
    if (!mongoose.connection.db) {
      const mongoUri = process.env.DATABASE_URL;
      if (!mongoUri) {
        throw new Error('DATABASE_URL is not defined');
      }
      await mongoose.connect(mongoUri);
    }
    const db = mongoose.connection.db as unknown as Db;
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    // Initialize GridFS bucket
    bucket = new GridFSBucket(db, {
      bucketName: 'videos'
    });
    
    console.log('GridFS initialized successfully');
    return bucket;
  } catch (error) {
    console.error('GridFS initialization error:', error);
    throw error;
  }
};

// Function to upload video
export const uploadVideo = async (file: File) => {
  try {
    if (!bucket) {
      bucket = await initGridFS();
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadDate: new Date(),
        }
      });

      uploadStream.on('finish', () => {
        console.log('Video upload completed:', filename);
        resolve({
          filename,
          mimetype: file.type,
          size: file.size
        });
      });

      uploadStream.on('error', (error) => {
        console.error('Video upload error:', error);
        reject(error);
      });

      // Write the buffer to the stream
      uploadStream.write(buffer);
      uploadStream.end();
    });
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
};

// Function to get video by filename
export const getVideo = async (filename: string) => {
  try {
    if (!bucket) {
      bucket = await initGridFS();
    }

    const files = await bucket.find({ filename }).toArray();
    const file = files[0];
    if (!file) {
      throw new Error('Video not found');
    }
    return file;
  } catch (error) {
    console.error('Get video error:', error);
    throw error;
  }
};

// Function to stream video
export const streamVideo = (filename: string) => {
  if (!bucket) {
    throw new Error('GridFS not initialized');
  }
  const stream = bucket.openDownloadStreamByName(filename);
  stream.on('error', (error) => {
    console.error('Stream error:', error);
  });
  return stream;
}; 