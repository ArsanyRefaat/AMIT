import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from "kimi-plugin-inspect-react"

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  // Dev-only: avoid shipping inspect UI to production (can confuse mobile caching / overlay quirks).
  plugins: [...(mode === "development" ? [inspectAttr()] : []), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
