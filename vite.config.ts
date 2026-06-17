import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import jscPlugin from '@builder.io/vite-plugin-jsx-loc'

export default defineConfig({
  base: '/portfolio-dashboard/',
  plugins: [react(), jscPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'client/index.html',
    },
  },
  server: {
    middlewareMode: false,
  },
})
