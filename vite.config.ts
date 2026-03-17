import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaults = {
    VITE_API_URL: mode === 'development' ? 'http://localhost:3000' : 'https://api.bountyhub.tech',
    VITE_GIPHY_API_KEY: '8tPzDynfDBevgXLsAaPztARWyvWzNLPK',
    VITE_CLOUDINARY_CLOUD_NAME: 'dqobhvk07',
    VITE_CLOUDINARY_UPLOAD_PRESET: 'bountyhub',
    VITE_GITHUB_RELEASES_URL: '',
  }
  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL ?? defaults.VITE_API_URL),
      'import.meta.env.VITE_GIPHY_API_KEY': JSON.stringify(env.VITE_GIPHY_API_KEY ?? defaults.VITE_GIPHY_API_KEY),
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME ?? defaults.VITE_CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET ?? defaults.VITE_CLOUDINARY_UPLOAD_PRESET),
      'import.meta.env.VITE_GITHUB_RELEASES_URL': JSON.stringify(env.VITE_GITHUB_RELEASES_URL ?? defaults.VITE_GITHUB_RELEASES_URL),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
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
  }
}) 