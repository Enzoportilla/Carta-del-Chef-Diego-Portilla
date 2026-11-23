import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Carta-del-Chef-Diego-Portilla/', // GitHub Pages: el nombre exacto del repo
  plugins: [react()],
  // La carpeta viene montada desde Windows (WSL): sin polling, Vite no ve los cambios.
  server: { host: true, port: 5173, watch: { usePolling: true } },
})
