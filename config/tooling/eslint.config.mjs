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
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // React specific rules
      "react/prop-types": "off", // We use TypeScript for prop validation
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import/Export rules
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-unused-modules": "off", // Can be noisy during development

      // General code quality
      "no-console": "warn",
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",

      // Accessibility (basic checks)
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
    },
  },
  {
    files: [
      "**/*.config.{js,mjs,ts}",
      "**/scripts/**",
      "**/*.test.{js,ts,tsx}",
    ],
    rules: {
      "no-console": "off", // Allow console in config files and tests
    },
  },
];

export default eslintConfig;
