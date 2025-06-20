/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    "bcryptjs",
    "drizzle-orm/d1",
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
}; 