import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      '/api': {
        target: 'http://apis-censo.eba-xday2ijd.us-east-1.elasticbeanstalk.com/api',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://apis-censo.eba-xday2ijd.us-east-1.elasticbeanstalk.com/api/sanctum',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
