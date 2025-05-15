import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"


// https://vite.dev/config/
/*************  ✨ Windsurf Command 🌟  *************/
/*************  ✨ Windsurf Command 🌟  *************/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 7000,
    open: true,
  }
})
 