import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    sequence: { concurrent: false },
    fileParallelism: false
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
