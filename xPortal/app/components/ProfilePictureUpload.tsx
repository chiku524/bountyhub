import { useState, useRef } from 'react';
import { FiCamera } from 'react-icons/fi';

const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed=';

interface ProfilePictureUploadProps {
  currentPicture: string | null;
  username: string;
}

export function ProfilePictureUpload({ currentPicture, username }: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPicture);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getProfilePicture = (profilePicture: string | null, username: string): string => {
    if (profilePicture) {
      return profilePicture;
    }
    return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the preview with the new image URL
        setPreview(result.profilePicture);
        // Optionally reload the page to show the updated profile picture
        window.location.reload();
      } else {
        alert(result.error || 'Failed to upload profile picture');
        // Reset preview to original
        setPreview(currentPicture);
      }
    } catch (error) {
      alert('Failed to upload profile picture');
      // Reset preview to original
      setPreview(currentPicture);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="relative w-32 h-32 rounded-full overflow-hidden">
        <img
          src={preview || getProfilePicture(currentPicture, username)}
          alt={`${username}'s profile`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
            disabled={isUploading}
          >
            <FiCamera className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 