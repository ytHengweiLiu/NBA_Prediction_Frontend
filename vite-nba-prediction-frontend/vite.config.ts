import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { createProxyMiddleware } from "http-proxy-middleware";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/dev": {
        target: "https://j25ls96ohb.execute-api.us-east-1.amazonaws.com",
        changeOrigin: true,
        secure: false,
        ws: true,
        // rewrite: (path) => path.replace(/^\/dev/, ""),
      },
    },
    port: 3000,
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "https://j25ls96ohb.execute-api.us-east-1.amazonaws.com",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
