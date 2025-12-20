import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devPort = Number(env.VITE_PORT || env.PORT || 5173)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173)
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8080'
  const host = env.VITE_HOST ? (env.VITE_HOST === 'true' ? true : env.VITE_HOST) : true
  const allowedHosts = env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',').map(s => s.trim()).filter(Boolean) : (true as any)
  const base = env.VITE_BASE || '/'
  return {
    plugins: [react()],
    base,
    server: {
      port: devPort,
      host,
      allowedHosts,
      proxy: {
        '/api': apiBase
      }
    },
    preview: {
      port: previewPort,
      host,
      allowedHosts
    }
  }
})
