// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.DEV 
      ? 'http://localhost:8787' 
      : 'https://api.bountyhub.tech',
    timeout: 10000,
  },
  
  // Cloudinary Configuration
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqobhvk07',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'portal',
  },
  
  // App Configuration
  app: {
    name: 'BountyHub',
    version: '1.0.0',
    environment: import.meta.env.MODE,
  },
  
  // Feature Flags
  features: {
    enableNotifications: true,
    enableWallet: true,
    enableVoting: true,
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // If baseUrl ends with /api, don't add another /api
  if (baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api')) {
    return `${baseUrl}${cleanEndpoint.slice(4)}`
  }
  
  return `${baseUrl}${cleanEndpoint}`
} 