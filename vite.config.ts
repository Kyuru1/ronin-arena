import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "/ronin-arena/",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      // Backend coop (server/index.js) alcancavel pelo browser sem usar localhost.
      "/coop-ws": {
        target: "ws://127.0.0.1:3001",
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
