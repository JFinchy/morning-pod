/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

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
    fileParallelism: false,
    globals: true,
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    // Mock out performance monitoring by default
    mockReset: true,
    // Reduce resource usage for Mac M1X - performance optimized
    pool: "threads",
    poolOptions: {
      threads: {
        isolate: false,
        singleThread: true,
      },
    },
    restoreMocks: true,
    setupFiles: [path.resolve(__dirname, "../../src/tests/setup.ts")],
  },
});
