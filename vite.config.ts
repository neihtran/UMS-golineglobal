import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      // Proxy to mock server (port 5001) by default for development
      // When real backend is running on port 5000, change this to 'http://localhost:5000'
      '/api': {
        target: process.env.VITE_USE_REAL_API === 'true'
          ? 'http://localhost:5000'
          : 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
