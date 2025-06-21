import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiVideo, FiX } from 'react-icons/fi';

interface MediaUploadProps {
  onMediaUpload: (media: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => void;
  onMediaRemove: (index: number) => void;
  uploadedMedia: Array<{ type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }>;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
}

// Helper to upload a file/blob to Cloudinary
async function uploadToCloudinary(file: File | Blob, resourceType: 'image' | 'video', uploadPreset: string, cloudName: string, folder: string): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary');
  }
  return response.json() as Promise<CloudinaryUploadResult>;
}

export function MediaUpload({ onMediaUpload, onMediaRemove, uploadedMedia }: MediaUploadProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  const startScreenRecording = useCallback(async () => {
    try {
      cleanupRecording();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen recording is not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        if (recordedChunksRef.current.length === 0) {
          cleanupRecording();
          return;
        }
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setIsUploading(true);
        try {
          // Cloudinary config from env
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bountyhub';
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
          if (!uploadPreset || !cloudName) throw new Error('Cloudinary config missing');
          const uploadResult = await uploadToCloudinary(blob, 'video', uploadPreset, cloudName, 'bountyhub/posts');
          const url = uploadResult.secure_url;
          // Generate thumbnail as before
          try {
            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = 'anonymous';
            video.onloadeddata = () => {
              try {
                video.currentTime = 1;
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0);
                  const thumbnailUrl = canvas.toDataURL('image/jpeg');
                  onMediaUpload({
                    type: 'VIDEO',
                    url,
                    thumbnailUrl,
                    isScreenRecording: true
                  });
                } else {
                  onMediaUpload({
                    type: 'VIDEO',
                    url,
                    isScreenRecording: true
                  });
                }
              } catch (error) {
                onMediaUpload({
                  type: 'VIDEO',
                  url,
                  isScreenRecording: true
                });
              }
            };
            video.onerror = () => {
              onMediaUpload({
                type: 'VIDEO',
                url,
                isScreenRecording: true
              });
            };
          } catch (error) {
            onMediaUpload({
              type: 'VIDEO',
              url,
              isScreenRecording: true
            });
          }
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to upload screen recording');
        } finally {
          setIsUploading(false);
          cleanupRecording();
        }
      };
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start screen recording');
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

    try {
      // Validate file type
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        throw new Error('Please upload a video or image file');
      }

      // Cloudinary can handle much larger files, so we'll use generous limits
      const maxSize = isVideo ? 100 * 1024 * 1024 : 50 * 1024 * 1024; // 100MB for videos, 50MB for images
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${isVideo ? '100MB' : '50MB'}`);
      }

      // Cloudinary config from env
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bountyhub';
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
      if (!uploadPreset || !cloudName) throw new Error('Cloudinary config missing');

      // Upload to Cloudinary
      const resourceType = isVideo ? 'video' : 'image';
      const folder = 'bountyhub/posts';
      const uploadResult = await uploadToCloudinary(file, resourceType, uploadPreset, cloudName, folder);
      const url = uploadResult.secure_url;

      if (isVideo) {
        // Generate thumbnail as before
        try {
          const video = document.createElement('video');
          video.src = url;
          video.crossOrigin = 'anonymous';
          video.onloadeddata = () => {
            try {
              video.currentTime = 1;
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0);
                const thumbnailUrl = canvas.toDataURL('image/jpeg');
                
                onMediaUpload({
                  type: 'VIDEO',
                  url,
                  thumbnailUrl,
                  isScreenRecording: false
                });
              } else {
                // Fallback without thumbnail
                onMediaUpload({
                  type: 'VIDEO',
                  url,
                  isScreenRecording: false
                });
              }
            } catch (error) {
              console.error('Failed to create video thumbnail:', error);
              // Fallback without thumbnail
              onMediaUpload({
                type: 'VIDEO',
                url,
                isScreenRecording: false
              });
            }
          };
          video.onerror = () => {
            // Fallback without thumbnail
            onMediaUpload({
              type: 'VIDEO',
              url,
              isScreenRecording: false
            });
          };
        } catch (error) {
          console.error('Failed to process video file:', error);
          // Fallback without thumbnail
          onMediaUpload({
            type: 'VIDEO',
            url,
            isScreenRecording: false
          });
        }
      } else {
        onMediaUpload({
          type: 'IMAGE',
          url,
          isScreenRecording: false
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-2">
        <p>📁 File size limits: Images (50MB), Videos (100MB) - Powered by Cloudinary</p>
      </div>
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
                >
                  <track kind="captions" />
                </video>
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