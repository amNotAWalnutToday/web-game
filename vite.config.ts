import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: 'https://amnotawalnuttoday.github.io/web-game/',
  build: {
    outDir: 'build'
  },
  server: {
    hmr: { overlay: false }
  }
})
