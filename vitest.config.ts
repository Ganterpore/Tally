import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts: the app build pulls in the PWA plugin (service worker
// generation, manifest, etc.) which the pure-logic unit tests have no use for.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
