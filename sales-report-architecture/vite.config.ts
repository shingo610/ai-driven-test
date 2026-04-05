import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = command === 'build' ? './' : '/'
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5180,
      strictPort: false,
      open: '/sales-report',
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 4180,
      strictPort: false,
      open: '/sales-report',
    },
  }
})
