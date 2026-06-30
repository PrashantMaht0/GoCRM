import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Add this define block to polyfill 'global' for SockJS
  define: {
    global: 'window',
  },
})