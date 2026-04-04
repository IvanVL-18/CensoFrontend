import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      '/api': {
        target: 'http://apis-censo.test',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://apis-censo.test',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
