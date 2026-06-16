import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Lokale KI (Ollama, OpenAI-kompatibel) ohne CORS aus dem Browser
      // erreichbar machen: /lokale-ki/... -> http://localhost:11434/...
      '/lokale-ki': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/lokale-ki/, ''),
      },
    },
  },
})
