import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'https://connectsouq.sundukpay.com';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/cs-network': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
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