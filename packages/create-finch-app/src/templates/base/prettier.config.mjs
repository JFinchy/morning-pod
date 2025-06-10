/** @type {import('prettier').Config} */
const config = {
  // Core formatting
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  trailingComma: "es5",

  // JavaScript/TypeScript
  arrowParens: "always",
  bracketSpacing: true,
  endOfLine: "lf",
  printWidth: 80,
  quoteProps: "as-needed",

  // JSX
  bracketSameLine: false,
  jsxSingleQuote: false,

  // Plugin configurations
  plugins: ["prettier-plugin-tailwindcss"],

  // File-specific overrides
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        printWidth: 100,
        proseWrap: "always",
      },
    },
    {
      files: ["*.json"],
      options: {
        tabWidth: 2,
      },
    },
  ],
};

export default config;
