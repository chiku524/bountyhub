import { defineConfig } from "vite";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      external: [
        '@remix-run/cloudflare',
        'puppeteer',
        'puppeteer-core'
      ],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'remix-vendor': ['@remix-run/react', '@remix-run/node'],
          'solana-vendor': ['@solana/web3.js', '@solana/spl-token'],
          'wallet-vendor': [
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
            '@solana/wallet-adapter-phantom',
            '@solana/wallet-adapter-solflare'
          ],
          'ui-vendor': ['react-icons/fi', 'react-icons/fa'],
          'utils-vendor': ['bcryptjs', 'zod', 'cloudinary'],
          'drizzle-vendor': ['drizzle-orm', 'drizzle-orm/sqlite-core', 'drizzle-orm/d1'],
        },
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@remix-run/react',
      '@remix-run/node',
      '@remix-run/cloudflare'
    ],
    exclude: [
      'puppeteer',
      'puppeteer-core'
    ]
  },
  server: {
    fs: {
      strict: true,
    },
    hmr: {
      overlay: false
    }
  },
  define: {
    global: 'globalThis',
  },
  ssr: {
    noExternal: ['@remix-run/cloudflare']
  }
});
