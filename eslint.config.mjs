import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    plugins: ["fp", "no-secrets", "testing-library"],
  }),
  {
    rules: {
      // Functional programming rules - make them warnings instead of errors
      "fp/no-loops": "warn",
      "fp/no-mutation": "warn",

      // Security rules
      "no-secrets/no-secrets": "warn",

      // Allow console in development
      "no-console": "warn",

      // Prefer const assertions
      "prefer-const": "error",

      // Be more permissive with unused variables for development
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],

      // Allow any type for rapid development (but warn)
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow unused imports (they might be used for types)
      "@typescript-eslint/no-unused-imports": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      // Test-specific rule overrides - be very permissive
      "playwright/missing-playwright-await": "off",
      "testing-library/no-node-access": "off",
      "testing-library/no-await-sync-query": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "fp/no-mutation": "off",
      "fp/no-loops": "off",
      "no-console": "off",
      "no-secrets/no-secrets": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      // JavaScript files - be more permissive
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
