import path from 'path'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

function getFileVersion(relativePath: string): string {
  try {
    const filePath = path.resolve(__dirname, relativePath)
    const content = readFileSync(filePath, 'utf-8')
    return createHash('sha256').update(content).digest('hex').slice(0, 12)
  } catch {
    return String(Date.now())
  }
}

const logoVersion = getFileVersion('public/logo.svg')
const faviconVersion = getFileVersion('public/favicon.svg')
const appVersion = JSON.parse(
  readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
).version as string

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaults = {
    VITE_API_URL: mode === 'development' ? 'http://localhost:8788' : 'https://api.bountyhub.tech',
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
          return html
            .replace(/%VITE_LOGO_VERSION%/g, logoVersion)
            .replace(/__FAVICON_VERSION__/g, faviconVersion)
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
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor'
            }
            if (
              id.includes('node_modules/@solana/') ||
              id.includes('node_modules/@coral-xyz/')
            ) {
              return 'solana'
            }
          },
        },
      },
    },
    server: {
      port: 5173,
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