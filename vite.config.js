import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: 'https://github.com/CopaCabana21/administrative-divisions',
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
