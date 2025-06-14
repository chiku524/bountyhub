import { hydrateRoot } from 'react-dom/client';
import VideoUpload from '~/components/VideoUpload';
import type { VideoFile } from '~/types/video';
import React from 'react';

function init() {
  const container = document.getElementById('video-upload-container');
  if (!container) return;

  const root = hydrateRoot(
    container,
    React.createElement(VideoUpload, {
      onUploadComplete: (file: VideoFile) => {
        // Dispatch a custom event to communicate with the parent component
        const event = new CustomEvent('videoUploadComplete', { detail: file });
        window.dispatchEvent(event);
      },
      onError: (errorMessage: string) => {
        // Dispatch a custom event to communicate with the parent component
        const event = new CustomEvent('videoUploadError', { detail: errorMessage });
        window.dispatchEvent(event);
      }
    })
  );
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 