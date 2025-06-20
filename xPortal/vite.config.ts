import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: true,
    rollupOptions: {
      external: ['@remix-run/cloudflare']
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@remix-run/react',
      '@remix-run/node',
      '@remix-run/cloudflare',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-wallets',
      '@solana/web3.js'
    ],
    exclude: ['@remix-run/dev']
  },
  server: {
    fs: {
      strict: true,
    },
    hmr: {
      overlay: false
    }
  },
});
