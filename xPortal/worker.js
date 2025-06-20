import * as remix from './build/index.js';

export default {
  async fetch(request, env, ctx) {
    return remix.entry.server(request, env, ctx);
  }
}; 