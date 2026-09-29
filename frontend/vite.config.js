import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import sirv from 'sirv'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      //"/api": "https://bitwebapp-24.onrender.com",
      "/api": "http://localhost:8000",
    },
  },
  plugins: [react(),
    {
      name: 'serve-live-public-in-preview',
      configurePreviewServer(server) {
        // This serves the LIVE 'public' folder at the root level
        server.middlewares.use(
          sirv(resolve(__dirname, 'public'), {
            dev: true,
            etag: false,
            extensions: [] 
          })
        )
      }
    }],
  preview: {
    host: true,
    port: 3000,
    proxy: {
      //"/api": "https://bitwebapp-24.onrender.com",
      "/api": "http://localhost:8000",
    },
  },
});

