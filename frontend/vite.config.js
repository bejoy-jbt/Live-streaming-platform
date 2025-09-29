import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      global: 'globalThis',       // polyfill `global`
      process: 'process/browser', // polyfill `process`
      buffer: 'buffer'            // polyfill `Buffer`
    }
  },
  define: {
    'process.env': {}  // optional, prevents process.env errors
  },
  build: {
    outDir: 'dist'
  }
});
