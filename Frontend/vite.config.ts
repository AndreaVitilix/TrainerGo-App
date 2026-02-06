import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // Fondamentale per Docker
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true // Necessario su Windows/Docker per far funzionare l'Hot Reload
    }
  }
})