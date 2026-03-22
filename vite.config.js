import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/lessons': { target: 'http://localhost:3000', changeOrigin: true },
      '/orders': { target: 'http://localhost:3000', changeOrigin: true },
      '/search': { target: 'http://localhost:3000', changeOrigin: true },
      '/images': { target: 'http://localhost:3000', changeOrigin: true }
    }
  }
});
