import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devPort = Number(env.VITE_PORT || env.PORT || 5173)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173)
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8080'
  return {
    plugins: [react()],
    server: {
      port: devPort,
      proxy: {
        '/api': apiBase
      }
    },
    preview: {
      port: previewPort
    }
  }
})
