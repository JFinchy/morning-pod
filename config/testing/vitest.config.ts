/// <reference types="vitest" />
import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "../../src/tests/setup.ts")],
    css: true,
    // Mock out performance monitoring by default
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    // Standard configuration for normal development
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
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
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../src"),
    },
  },
});
