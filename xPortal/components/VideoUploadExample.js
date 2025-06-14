import { useState } from 'react';
import VideoUpload from './VideoUpload';

const VideoUploadExample = () => {
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadComplete = (file) => {
    setUploadedVideo(file);
    setError(null);
    // You can now use file.filename to store in your database
    console.log('Uploaded video:', file);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
      
      <VideoUpload
        onUploadComplete={handleUploadComplete}
        onError={handleError}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {uploadedVideo && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Video</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Filename: {uploadedVideo.filename}
            </p>
            <p className="text-sm text-gray-600">
              Size: {(uploadedVideo.length / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className="text-sm text-gray-600">
              Uploaded: {new Date(uploadedVideo.uploadDate).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploadExample; 