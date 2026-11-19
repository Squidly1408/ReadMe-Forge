import { defineConfig } from "vite";
import { resolve } from "node:path";

// Relative base so the build works at any path (e.g. GitHub Pages project sites).
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        privacy: resolve(__dirname, "privacy.html"),
        terms: resolve(__dirname, "terms.html"),
      },
    },
  },
});
