import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Inject environment variables at build time
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://api.bountyhub.tech')),
    'import.meta.env.VITE_GIPHY_API_KEY': JSON.stringify(process.env.VITE_GIPHY_API_KEY || '8tPzDynfDBevgXLsAaPztARWyvWzNLPK'),
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqobhvk07'),
    'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bountyhub'),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}) 