import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct configuration that keeps Tailwind working
// and prevents Leaflet.css parse errors
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {},
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    hmr: { overlay: false },
  },
  // ✅ The key fix: don't transform 3rd-party CSS (like leaflet)
  build: {
    rollupOptions: {},
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
