import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Allows: import X from '@/components/...'
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Forward all /api calls to Express in development
      '/api': {
        target:       apiUrl,
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir:    'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ['react', 'react-dom', 'react-router-dom'],
          charts:   ['recharts'],
          query:    ['@tanstack/react-query'],
        },
      },
    },
  },
});
