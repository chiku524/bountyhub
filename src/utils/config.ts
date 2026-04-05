// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8788' : 'https://api.bountyhub.tech'),
    timeout: 10000,
  },
  
  // Cloudinary Configuration
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqobhvk07',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bountyhub',
  },
  
  // GIPHY Configuration (set VITE_GIPHY_API_KEY in .env.local and Cloudflare Pages)
  giphy: {
    apiKey: import.meta.env.VITE_GIPHY_API_KEY || '',
  },
  
  // App Configuration
  app: {
    name: 'BountyHub',
    /** Bundled web app version (from package.json at build time). */
    version: import.meta.env.VITE_APP_VERSION || import.meta.env.MODE,
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

/** WebSocket base URL for chat (same host as API, ws/wss scheme). */
export function getChatWsUrl(): string {
  const base = config.api.baseUrl
  if (base.startsWith('https://')) return base.replace('https://', 'wss://')
  if (base.startsWith('http://')) return base.replace('http://', 'ws://')
  return `wss://${base}`
} 