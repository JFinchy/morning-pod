/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"),
    },
  },
  test: {
    clearMocks: true,
    css: true,
    environment: "jsdom",
    // Exclude Playwright test files
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/e2e/**",
      "**/performance/**",
    ],
    globals: true,
    // Mock out performance monitoring by default
    mockReset: true,
    // Standard configuration for normal development
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    restoreMocks: true,
    setupFiles: [path.resolve(__dirname, "../../src/tests/setup.ts")],
  },
});
