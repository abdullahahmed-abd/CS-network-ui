import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'https://unbarrable-semidivisive-rolanda.ngrok-free.dev';

export default defineConfig({
  plugins: [react()],
  base: '/', // <-- Change this
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy /profile-operations → ngrok backend (bypasses CORS preflight)
      '/cs-network/profile-operations': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        },
      },
      // Proxy /uploads → ngrok backend (for images — browsers can't send custom headers)
      '/uploads': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        },
      },
      // Proxy /meetings → ngrok backend
      '/meetings': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})