import path from 'path'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

function getLogoVersion(): string {
  try {
    const logoPath = path.resolve(__dirname, 'public/logo.svg')
    const content = readFileSync(logoPath, 'utf-8')
    return createHash('sha256').update(content).digest('hex').slice(0, 12)
  } catch {
    return String(Date.now())
  }
}

const logoVersion = getLogoVersion()

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaults = {
    VITE_API_URL: mode === 'development' ? 'http://localhost:3000' : 'https://api.bountyhub.tech',
    VITE_GIPHY_API_KEY: '8tPzDynfDBevgXLsAaPztARWyvWzNLPK',
    VITE_CLOUDINARY_CLOUD_NAME: 'dqobhvk07',
    VITE_CLOUDINARY_UPLOAD_PRESET: 'bountyhub',
    VITE_GITHUB_RELEASES_URL: 'https://github.com/chiku524/bountyhub/releases/latest',
  }
  return {
    plugins: [
      react(),
      {
        name: 'logo-cache-bust-html',
        transformIndexHtml(html) {
          return html.replace(/%VITE_LOGO_VERSION%/g, logoVersion)
        },
      },
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL ?? defaults.VITE_API_URL),
      'import.meta.env.VITE_GIPHY_API_KEY': JSON.stringify(env.VITE_GIPHY_API_KEY ?? defaults.VITE_GIPHY_API_KEY),
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME ?? defaults.VITE_CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET ?? defaults.VITE_CLOUDINARY_UPLOAD_PRESET),
      'import.meta.env.VITE_GITHUB_RELEASES_URL': JSON.stringify(env.VITE_GITHUB_RELEASES_URL ?? defaults.VITE_GITHUB_RELEASES_URL),
      'import.meta.env.VITE_LOGO_VERSION': JSON.stringify(logoVersion),
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