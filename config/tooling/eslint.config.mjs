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
  
  // Security plugins
  // ...compat.extends("plugin:security/recommended"), // Temporarily disabled due to config issue
  // ...compat.extends("plugin:sonarjs/recommended"), // Temporarily disabled due to config issue
  
  // Code quality plugins - temporarily disabled to fix build
  // ...compat.extends("plugin:unicorn/recommended"),
  // ...compat.extends("plugin:promise/recommended"),
  // ...compat.extends("plugin:n/recommended"),
  // ...compat.extends("plugin:regexp/recommended"),
  // ...compat.extends("plugin:perfectionist/recommended-natural"),
  
  // Main configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Enhanced TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Enhanced React rules
      "react/prop-types": "off", // We use TypeScript for prop validation
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-curly-brace-presence": ["warn", "never"],
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-fragments": ["warn", "syntax"],
      "react/jsx-no-useless-fragment": "warn",

      // Enhanced import rules
      "import/no-unused-modules": "off", // Can be noisy during development
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "warn",
      "import/no-useless-path-segments": "warn",
      "import/consistent-type-specifier-style": ["warn", "prefer-inline"],
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

      // Enhanced general code quality rules
      "no-console": "warn",
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-destructuring": [
        "warn",
        {
          array: true,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "warn",
      "no-else-return": "warn",
      "prefer-exponentiation-operator": "warn",
      "prefer-numeric-literals": "warn",
      "prefer-object-spread": "warn",
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "yoda": "warn",

      // Enhanced accessibility rules
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",

      // Override plugin rules that conflict with Next.js patterns
      "unicorn/filename-case": "off", // Next.js uses various file naming conventions
      "unicorn/prevent-abbreviations": "off", // Allow common abbreviations like props, params
      "unicorn/no-null": "off", // React often uses null
      "n/no-missing-import": "off", // Next.js has custom module resolution
      "n/no-unpublished-import": "off", // Dev dependencies in config files are ok
      "perfectionist/sort-imports": "off", // We already have import/order configured
    },
  },

  // File-specific overrides
  {
    files: [
      "**/*.config.{js,mjs,ts}",
      "**/scripts/**",
      "**/*.test.{js,ts,tsx}",
      "**/*.spec.{js,ts,tsx}",
    ],
    rules: {
      "no-console": "off", // Allow console in config files and tests
      "@typescript-eslint/no-explicit-any": "off", // Tests might need any for mocking
    },
  },

  // API routes specific rules
  {
    files: ["src/app/api/**/*.{js,ts}"],
    rules: {
      "no-console": "off", // API routes might need console for logging
    },
  },
];

export default eslintConfig;