// techninja15/oh/OH-b1080e347a4efc90cbac30edcf63317a40f51da3/client/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ❌ REMOVE the 'server' block which contains the local proxy setup
  /*
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  */
})