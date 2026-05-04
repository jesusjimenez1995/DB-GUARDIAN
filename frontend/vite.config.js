import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react-router/') || id.includes('react-router-dom')) return 'routing';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('react-quill')) return 'editor';
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('react-countup')) return 'countup';
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) return 'markdown';
          if (id.includes('dompurify')) return 'security';
          if (id.includes('lucide-react')) return 'icons';
          return 'vendor';
        }
      }
    }
  }
});
