import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4318',
        changeOrigin: true,
      }
    }
  },
  preview: {
    host: 'localhost',
    strictPort: true,
    port: 4178,
    proxy: {
      '/api': {
        target: 'http://localhost:4318',
        changeOrigin: true,
      }
    }
  }
})
