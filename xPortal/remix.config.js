/** @type {import('@remix-run/dev').AppConfig} */
export default {
  appDirectory: "app",
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    "bcryptjs",
    "drizzle-orm/d1",
    "@solana/web3.js",
    "@solana/spl-token",
    "@coral-xyz/anchor",
  ],
  browserNodeBuiltinsPolyfill: {
    modules: {
      buffer: true,
      crypto: true,
      stream: true,
      util: true,
      process: true,
      events: true,
      path: true,
      os: true,
      fs: false,
      net: true,
      tls: true,
      url: true,
      querystring: true,
      http: true,
      https: true,
      zlib: true,
    },
  },
  // Add optimization settings
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
  },
  // Optimize for Cloudflare Workers
  serverMinify: false,
  // Add Cloudflare Workers specific settings
  serverPlatform: "neutral",
  // Use a different build target
  serverBuildPath: "build/server/index.js",
}; 