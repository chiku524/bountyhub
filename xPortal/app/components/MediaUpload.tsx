import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiVideo, FiImage, FiX } from 'react-icons/fi';

interface MediaUploadProps {
  onMediaUpload: (media: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => void;
  onMediaRemove: (index: number) => void;
  uploadedMedia: Array<{ type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }>;
}

export function MediaUpload({ onMediaUpload, onMediaRemove, uploadedMedia }: MediaUploadProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'screen' | 'file' | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function to stop recording and release resources
  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    recordedChunksRef.current = [];
    setIsRecording(false);
    setUploadType(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  const startScreenRecording = useCallback(async () => {
    try {
      // Clean up any existing recording first
      cleanupRecording();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunksRef.current.length === 0) {
          cleanupRecording();
          return;
        }

        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create thumbnail
        const video = document.createElement('video');
        video.src = url;
        video.onloadeddata = () => {
          video.currentTime = 1; // Get frame at 1 second
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          const thumbnailUrl = canvas.toDataURL('image/jpeg');
          
          onMediaUpload({
            type: 'VIDEO',
            url,
            thumbnailUrl,
            isScreenRecording: true
          });
          cleanupRecording();
        };
      };

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setUploadType('screen');
    } catch (error) {
      console.error('Error starting screen recording:', error);
      alert('Failed to start screen recording');
      cleanupRecording();
    }
  }, [onMediaUpload, cleanupRecording]);

  const stopScreenRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadType('file');

    try {
      // Validate file type
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        throw new Error('Please upload a video or image file');
      }

      // Validate file size (max 100MB for videos, 10MB for images)
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${isVideo ? '100MB' : '10MB'}`);
      }

      const url = URL.createObjectURL(file);
      
      if (isVideo) {
        // Create thumbnail for video
        const video = document.createElement('video');
        video.src = url;
        video.onloadeddata = () => {
          video.currentTime = 1;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          const thumbnailUrl = canvas.toDataURL('image/jpeg');
          
          onMediaUpload({
            type: 'VIDEO',
            url,
            thumbnailUrl,
            isScreenRecording: false
          });
        };
      } else {
        onMediaUpload({
          type: 'IMAGE',
          url,
          isScreenRecording: false
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={isRecording ? stopScreenRecording : startScreenRecording}
          disabled={isUploading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-violet-500 hover:bg-violet-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FiVideo className="w-5 h-5" />
          {isRecording ? 'Stop Recording' : 'Record Screen'}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiUpload className="w-5 h-5" />
          Upload Media
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isRecording || isUploading}
        />
      </div>

      {uploadedMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {uploadedMedia.map((media, index) => (
            <div key={index} className="relative group">
              {media.type === 'VIDEO' ? (
                <video
                  src={media.url}
                  poster={media.thumbnailUrl}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              ) : (
                <img
                  src={media.url}
                  alt="Uploaded media"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={() => onMediaRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-4 h-4" />
              </button>
              {media.isScreenRecording && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-sm rounded">
                  Screen Recording
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {(isRecording || isUploading) && (
        <div className="flex items-center gap-2 text-violet-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-400"></div>
          <span>
            {isRecording ? 'Recording...' : 'Uploading...'}
          </span>
        </div>
      )}
    </div>
  );
} 