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
    port: 5173,
    host: true, // Cho phép truy cập từ máy khác cùng mạng LAN
    allowedHosts: true, // Cho phép mọi host (cần thiết khi dùng host: true)
    proxy: {
      // Forward /api requests to backend during local development.
      // In production, deploy behind nginx with same proxy config.
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
