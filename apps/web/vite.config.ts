import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const appDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@migenda/shared': path.resolve(appDir, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyRes', (proxyRes) => {
            const location = proxyRes.headers.location;
            if (typeof location === 'string' && location.startsWith('http://127.0.0.1:3000/')) {
              proxyRes.headers.location = location.replace(
                'http://127.0.0.1:3000',
                'http://localhost:5173',
              );
            }
          });
        },
      },
    },
  },
});
