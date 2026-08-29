import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { contentApi } from './content-api';

/**
 * The studio runs against the app's own source: the curriculum contracts and
 * both content gates are imported from `apps/mobile`, never copied. One
 * validator means the tool cannot approve content the app would reject.
 */
export default defineConfig({
  plugins: [react(), contentApi()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, '..', 'mobile', 'src') },
  },
  server: { port: 5174 },
});
