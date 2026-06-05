// Standalone SPA build for the Capacitor APK.
// Bypasses TanStack Start (SSR) and emits a plain client bundle into dist-apk/.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: path.resolve(__dirname, "src/routes"),
      generatedRouteTree: path.resolve(__dirname, "src/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  root: path.resolve(__dirname, "apk"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist-apk"),
    emptyOutDir: true,
    target: "es2020",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
