import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

// Create GridFS stream
let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('videos');
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'videos',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

// Create multer upload middleware
const upload = multer({ storage });

// Function to get video by filename
const getVideo = async (filename) => {
  try {
    const file = await gfs.files.findOne({ filename });
    if (!file) {
      throw new Error('Video not found');
    }
    return file;
  } catch (error) {
    throw error;
  }
};

// Function to stream video
const streamVideo = (filename, res) => {
  const readstream = gfs.createReadStream(filename);
  readstream.pipe(res);
};

export default {
  upload,
  getVideo,
  streamVideo
}; 