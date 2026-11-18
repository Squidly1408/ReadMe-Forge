import { defineConfig } from "vite";

// Relative base so the build works at any path (e.g. GitHub Pages project sites).
export default defineConfig({
  base: "./",
  build: { target: "es2020" },
});
