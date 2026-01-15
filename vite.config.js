import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/administrative-divisions/',
  plugins: [react()],
  resolve: {
    alias: {
      jquery: "jquery/dist/jquery.js",
    },
  },
  optimizeDeps: {
    include: ["jquery"],
  },
})
