import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignored files
  {
    ignores: [
      ".next/**",
      "node_modules/**", 
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      ".vercel/**",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Prettier integration (must come first to prevent conflicts)  
  ...compat.extends("prettier"),
  
  // Core working plugins
  ...compat.plugins("simple-import-sort"),
{{#if hasTesting}}  ...compat.extends("plugin:testing-library/react"),
  ...compat.extends("plugin:playwright/recommended"),{{/if}}
  
  // Main configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Code quality rules
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      "no-console": "warn",
      "no-debugger": "warn",

      // Import rules
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "import/order": "off", // Using simple-import-sort instead
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",

      // React rules
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-curly-brace-presence": ["warn", "never"], 
      "react/jsx-fragments": ["warn", "syntax"],
      "react/jsx-no-useless-fragment": "warn",
      "react/prop-types": "off", // We use TypeScript
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/self-closing-comp": "warn",

      // Next.js specific
      "import/no-anonymous-default-export": "off", // Next.js pages need default exports
    },
  },

  // File-specific overrides
  {
    files: [
      "**/*.config.{js,mjs,ts}",
      "**/scripts/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

{{#if hasTesting}}  // Test file specific rules
  {
    files: [
      "**/*.test.{js,ts,tsx}",
      "**/*.spec.{js,ts,tsx}",
      "**/tests/**/*.{js,ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Tests might need any for mocking
      "no-console": "off", // Allow console in tests
    },
  },{{/if}}
];

export default eslintConfig;