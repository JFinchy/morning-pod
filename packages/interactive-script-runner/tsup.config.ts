import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points
  entry: ["src/index.ts", "src/cli.ts"],

  // Output formats - both ESM and CommonJS
  format: ["esm", "cjs"],

  // Generate TypeScript declarations
  dts: true,

  // Code splitting for better tree shaking
  splitting: true,

  // Source maps for debugging
  sourcemap: true,

  // Clean dist folder before build
  clean: true,

  // Minify for production
  minify: process.env.NODE_ENV === "production",

  // Bundle dependencies (keep external for better compatibility)
  external: ["@clack/prompts", "@inquirer/prompts"],

  // Platform-specific builds
  platform: "node",

  // Target Node.js 18+
  target: "node18",

  // Preserve shebang for CLI
  banner: {
    js: "#!/usr/bin/env node",
  },

  // Output file naming
  outDir: "dist",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },

  // Tree shaking
  treeshake: true,

  // Keep function names for better debugging
  keepNames: true,
});
