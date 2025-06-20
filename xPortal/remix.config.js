/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    "bcryptjs",
    "mongodb",
    "drizzle-orm",
    "drizzle-orm/sqlite-core",
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
      net: false,
      tls: false,
    },
  },
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
  },
}; 