export const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed=';

export const getProfilePicture = (profilePicture: string | null, username: string): string => {
  if (profilePicture) {
    return profilePicture;
  }
  return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}; 