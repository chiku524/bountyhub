import { createRequestHandler } from "@remix-run/cloudflare";
import * as build from "./build/server/index.js";

const handleRequest = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => {
    return {
      env: context.env,
      db: context.env.DB, // Pass D1 database to context
    };
  },
});

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
}; 