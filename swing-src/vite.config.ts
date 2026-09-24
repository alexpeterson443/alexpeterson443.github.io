import { defineConfig } from 'vite';

// Built into ../swing so GitHub Pages serves it at /swing/ with no build step on the server.
export default defineConfig({
  base: './',
  build: {
    outDir: '../swing',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
} as never);
