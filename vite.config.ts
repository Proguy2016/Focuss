import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jspdf'],
    exclude: ['lucide-react'],
  },
  assetsInclude: ['**/*.pdf'], // Allow PDF files to be imported as assets
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
