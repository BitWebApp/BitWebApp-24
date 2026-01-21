import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 80,
    proxy: {
      //"/api": "https://bitwebapp-24.onrender.com",
      "/api": "http://localhost:3000",
    },
  },
  plugins: [react()],
});
