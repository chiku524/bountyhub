import { upload, getVideo, streamVideo } from '../../../utils/gridfs';
import VideoUpload from './components/VideoUpload';

// Configure multer middleware
const uploadMiddleware = upload.single('video');

// Helper function to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, uploadMiddleware);
      
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Return the file information
      return res.status(200).json({
        message: 'Video uploaded successfully',
        file: req.file
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { filename } = req.query;
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }

      const file = await getVideo(filename);
      if (!file) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Length', file.length);

      // Stream the video
      streamVideo(filename, res);

      const videoUrl = `/api/upload/video?filename=${filename}`;
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Configure API route to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}; 