import { createRequestHandler } from '@remix-run/cloudflare';
import * as build from './build/server/index.js';

export default {
  async fetch(request, env, ctx) {
    return createRequestHandler({
      build,
      mode: env.NODE_ENV,
    })(request, env, ctx);
  }
}; 