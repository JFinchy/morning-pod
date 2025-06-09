import { FlatCompat } from "@eslint/eslintrc";
// @ts-expect-error - No types available for these plugins
import fpPlugin from "eslint-plugin-fp";
// @ts-expect-error - No types available for these plugins
import nPlugin from "eslint-plugin-n";
// @ts-expect-error - No types available for these plugins
import noSecretsPlugin from "eslint-plugin-no-secrets";
// @ts-expect-error - No types available for these plugins
import perfectionistPlugin from "eslint-plugin-perfectionist";
// @ts-expect-error - No types available for these plugins
import promisePlugin from "eslint-plugin-promise";
// @ts-expect-error - No types available for these plugins
import regexpPlugin from "eslint-plugin-regexp";
// @ts-expect-error - No types available for these plugins
import securityPlugin from "eslint-plugin-security";
// @ts-expect-error - No types available for these plugins
import sonarjsPlugin from "eslint-plugin-sonarjs";
// @ts-expect-error - No types available for these plugins
import treeShakingPlugin from "eslint-plugin-tree-shaking";
// @ts-expect-error - No types available for these plugins
import tsdocPlugin from "eslint-plugin-tsdoc";
// @ts-expect-error - No types available for these plugins  
import unicornPlugin from "eslint-plugin-unicorn";
// @ts-expect-error - No types available for these plugins
import vitestPlugin from "eslint-plugin-vitest";
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
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Prettier integration (must come first to prevent conflicts)  
  ...compat.extends("prettier"),
  
  // Core working plugins
  ...compat.plugins("simple-import-sort"),
  ...compat.extends("plugin:testing-library/react"),
  ...compat.extends("plugin:playwright/recommended"),
  
  // Native flat config for modern plugins
  {
    plugins: {
      fp: fpPlugin,
      n: nPlugin,
      "no-secrets": noSecretsPlugin,
      perfectionist: perfectionistPlugin,
      promise: promisePlugin,
      regexp: regexpPlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      "tree-shaking": treeShakingPlugin,
      tsdoc: tsdocPlugin,
      unicorn: unicornPlugin,
      vitest: vitestPlugin,
    },
  },
  
  // Main configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Enhanced TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "brace-style": ["warn", "1tbs", { allowSingleLine: true }],
      "camelcase": ["warn", { properties: "never" }],
      // Useful Standard Style rules (cherry-picked)
      "comma-spacing": "warn",
      // Functional Programming rules (encourage immutability)
      "fp/no-arguments": "warn",
      "fp/no-class": "off", // Allow classes for React components
      "fp/no-delete": "warn",
      "fp/no-events": "off", // Allow events in React
      "fp/no-get-set": "warn",
      "fp/no-let": "off", // Allow let for practical coding

      "fp/no-loops": "warn",
      "fp/no-mutating-assign": "warn",
      "fp/no-mutating-methods": "warn",
      "fp/no-mutation": ["warn", { commonjs: true }],
      "fp/no-nil": "off", // Allow null/undefined when needed
      "fp/no-proxy": "warn",
      "fp/no-rest-parameters": "off", // Allow rest params
      "fp/no-this": "off", // Allow this in React components

      "fp/no-throw": "off", // Allow throwing errors
      "fp/no-unused-expression": "off", // Handled by other rules
      "fp/no-valueof-field": "warn",
      "import/consistent-type-specifier-style": ["warn", "prefer-inline"],
      // Next.js specific overrides
      "import/no-anonymous-default-export": "off", // Next.js pages need default exports
      "import/no-cycle": "warn",
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      // Enhanced import rules
      "import/no-unused-modules": "off", // Can be noisy during development
      "import/no-useless-path-segments": "warn",
      // Replace import/order with simple-import-sort
      "import/order": "off",
      // Enhanced accessibility rules
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",

      "jsx-a11y/role-supports-aria-props": "error",
      "keyword-spacing": "warn",
      // Node.js best practices  
      "n/no-deprecated-api": "error",
      "n/no-extraneous-import": "off", // Handled by import rules
      "n/no-extraneous-require": "off", // Handled by import rules
      "n/no-missing-import": "off", // TypeScript handles this
      "n/no-missing-require": "off", // TypeScript handles this

      "n/no-unpublished-import": "off", // Allow dev dependencies
      "n/no-unpublished-require": "off", // Allow dev dependencies

      "n/no-unsupported-features/es-builtins": "warn",
      "n/no-unsupported-features/es-syntax": "off", // Babel/TypeScript handles this
      "n/no-unsupported-features/node-builtins": "warn",
      "n/prefer-global/buffer": "warn",
      "n/prefer-global/console": "warn",
      "n/prefer-global/process": "warn",
      "n/prefer-global/url": "warn",
      "n/prefer-global/url-search-params": "warn",
      // Enhanced general code quality rules
      "no-console": "warn",
      "no-constant-condition": "warn",
      "no-debugger": "warn",

      "no-else-return": "warn",
      "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1 }],
      "no-nested-ternary": "warn",
      // No secrets rules (prevent sensitive data exposure)
      "no-secrets/no-secrets": ["error", { tolerance: 4.2 }],
      "no-self-compare": "error",
      "no-unneeded-ternary": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "perfectionist/sort-array-includes": "warn",
      "perfectionist/sort-classes": "warn",
      "perfectionist/sort-enums": "warn",
      "perfectionist/sort-exports": "warn",
      // Perfectionist rules (code organization)
      "perfectionist/sort-imports": "off", // Using simple-import-sort instead
      "perfectionist/sort-interfaces": "warn",
      "perfectionist/sort-jsx-props": "warn",
      "perfectionist/sort-maps": "warn",
      "perfectionist/sort-named-imports": "warn",
      "perfectionist/sort-object-types": "warn",
      "perfectionist/sort-objects": "warn",
      "perfectionist/sort-union-types": "warn",
      "perfectionist/sort-variable-declarations": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-const": "error",
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
      "prefer-exponentiation-operator": "warn",
      "prefer-numeric-literals": "warn",
      "prefer-object-spread": "warn",
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "prefer-template": "warn",
      // Promise rules (strict async handling)
      "promise/always-return": "warn",
      "promise/avoid-new": "off", // Sometimes we need new Promise()
      "promise/catch-or-return": "warn",
      "promise/no-callback-in-promise": "warn",
      "promise/no-nesting": "warn",
      "promise/no-new-statics": "error",
      "promise/no-promise-in-callback": "warn",

      "promise/no-return-in-finally": "warn",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/valid-params": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-curly-brace-presence": ["warn", "never"], 
      "react/jsx-fragments": ["warn", "syntax"],
      "react/jsx-no-useless-fragment": "warn",
      // Enhanced React rules
      "react/prop-types": "off", // We use TypeScript for prop validation
      "react/react-in-jsx-scope": "off", // Not needed in Next.js

      "react/self-closing-comp": "warn",
      // RegExp optimization rules
      "regexp/confusing-quantifier": "warn",
      "regexp/control-character-escape": "warn",
      "regexp/negation": "warn",
      "regexp/no-contradiction-with-assertion": "error",
      "regexp/no-control-character": "warn",
      "regexp/no-dupe-disjunctions": "error",
      "regexp/no-empty-alternative": "warn",
      "regexp/no-empty-capturing-group": "warn",
      "regexp/no-empty-character-class": "error",
      "regexp/no-empty-group": "warn",
      "regexp/no-escape-backspace": "warn",
      "regexp/no-invalid-regexp": "error",
      "regexp/no-lazy-ends": "warn",
      "regexp/no-misleading-capturing-group": "warn",
      "regexp/no-misleading-unicode-character": "warn",
      "regexp/no-missing-g-flag": "warn",
      "regexp/no-non-standard-flag": "error",
      "regexp/no-obscure-range": "warn",
      "regexp/no-optional-assertion": "warn",
      "regexp/no-potentially-useless-backreference": "warn",
      "regexp/no-super-linear-backtracking": "error",
      "regexp/no-trivially-nested-assertion": "warn",

      "regexp/no-trivially-nested-quantifier": "warn",

      "regexp/no-unused-capturing-group": "warn",
      "regexp/no-useless-assertions": "warn",
      "regexp/no-useless-backreference": "warn",
      "regexp/no-useless-character-class": "warn",
      "regexp/no-useless-dollar-replacements": "warn",
      "regexp/no-useless-escape": "warn",
      "regexp/no-useless-flag": "warn",
      "regexp/no-useless-lazy": "warn",
      "regexp/no-useless-quantifier": "warn",
      "regexp/no-useless-range": "warn",
      "regexp/no-useless-two-nums-quantifier": "warn",
      "regexp/no-zero-quantifier": "warn",
      "regexp/optimal-lookaround-quantifier": "warn",
      "regexp/optimal-quantifier-concatenation": "warn",
      "regexp/prefer-character-class": "warn",
      "regexp/prefer-d": "warn",
      "regexp/prefer-plus-quantifier": "warn",

      "regexp/prefer-question-quantifier": "warn",
      "regexp/prefer-range": "warn",
      "regexp/prefer-regexp-exec": "warn",
      "regexp/prefer-regexp-test": "warn",
      "regexp/prefer-result-array-groups": "warn",
      "regexp/prefer-star-quantifier": "warn",
      "regexp/prefer-unicode-codepoint-escapes": "warn",
      "regexp/prefer-w": "warn",
      "regexp/require-unicode-regexp": "warn",
      "regexp/simplify-set-operations": "warn",
      "regexp/sort-alternatives": "warn",
      "regexp/sort-character-class-elements": "warn",
      "regexp/sort-flags": "warn",
      "regexp/strict": "warn",
      "regexp/unicode-escape": "warn",

      "regexp/use-ignore-case": "warn",
      // Security rules (prevent common vulnerabilities)
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-object-injection": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-unsafe-regex": "error",

      "simple-import-sort/exports": "warn",
      "simple-import-sort/exports": "warn",
      // Import sorting
      "simple-import-sort/imports": "warn",
      // SonarJS rules (code quality and bug detection)
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-ignored-return": "error",
      "sonarjs/no-inverted-boolean-check": "warn",
      "sonarjs/no-one-iteration-loop": "error",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-same-line-conditional": "error",
      "sonarjs/no-small-switch": "warn",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/no-useless-catch": "error",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-object-literal": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/prefer-while": "warn",
      "space-before-blocks": "warn",
      "space-infix-ops": "warn",
      // TSDoc documentation rules
      "tsdoc/syntax": "warn",
      // Unicorn rules (modern JS best practices - core rules only)
      "unicorn/better-regex": "warn",
      "unicorn/catch-error-name": "warn",
      "unicorn/consistent-destructuring": "warn",
      "unicorn/error-message": "warn",
      "unicorn/escape-case": "warn",
      "unicorn/explicit-length-check": "warn",
      "unicorn/new-for-builtins": "warn",
      "unicorn/no-array-for-each": "warn",
      "unicorn/no-for-loop": "warn",
      "unicorn/no-instanceof-array": "warn",
      "unicorn/no-new-array": "warn",
      "unicorn/no-new-buffer": "warn",
      "unicorn/no-static-only-class": "warn",
      "unicorn/no-useless-undefined": "warn",
      "unicorn/number-literal-case": "warn",
      "unicorn/prefer-array-find": "warn",
      "unicorn/prefer-array-flat": "warn",
      "unicorn/prefer-array-flat-map": "warn",
      "unicorn/prefer-array-index-of": "warn",
      "unicorn/prefer-array-some": "warn",
      "unicorn/prefer-at": "warn",
      "unicorn/prefer-code-point": "warn",
      "unicorn/prefer-date-now": "warn",
      "unicorn/prefer-default-parameters": "warn",
      "unicorn/prefer-includes": "warn",
      "unicorn/prefer-math-trunc": "warn",
      "unicorn/prefer-module": "warn",

      // Tree shaking optimization (disabled - incompatible with ESLint v9)
      // "tree-shaking/no-side-effects-in-initialization": "warn",

      "unicorn/prefer-number-properties": "warn",

      "unicorn/prefer-query-selector": "warn",
      "unicorn/prefer-regexp-test": "warn", 
      "unicorn/prefer-spread": "warn",
      "unicorn/prefer-string-slice": "warn",
      "unicorn/prefer-string-starts-ends-with": "warn",
      "unicorn/prefer-string-trim-start-end": "warn",
      "unicorn/prefer-ternary": "warn",
      "unicorn/prefer-type-error": "warn",
      "unicorn/throw-new-error": "warn",

      "yoda": "warn",
    },
  },

  // File-specific overrides
  {
    files: [
      "**/*.config.{js,mjs,ts}",
      "**/scripts/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Config files might need any
      "@typescript-eslint/no-require-imports": "off", // Allow require in config files
      "no-console": "off", // Allow console in config files
    },
  },

  // Test utility files
  {
    files: [
      "**/test-utils.{js,ts,tsx}",
      "**/tests/test-utils.{js,ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      
      "testing-library/no-node-access": "off",
      "testing-library/no-render-in-setup": "off",
      // Disable testing-library rules for test utilities (they have different patterns)
      "testing-library/prefer-screen-queries": "off",
    },
  },

  // Unit test file specific rules (Vitest)
  {
    files: [
      "**/*.test.{js,ts,tsx}",
      "**/tests/unit/**/*.{js,ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Tests might need any for mocking
      "no-console": "off", // Allow console in tests
      
      // Disable conflicting Playwright rules for unit tests
      "playwright/expect-expect": "off",
      "playwright/no-standalone-expect": "off",
      
      // Vitest-specific rules for unit tests
      "vitest/consistent-test-it": ["warn", { fn: "test" }],
      "vitest/expect-expect": "error",
      "vitest/no-alias-methods": "warn",
      "vitest/no-conditional-expect": "off", // Allow conditional expects in unit tests
      "vitest/no-conditional-in-test": "off", // Allow conditional logic in unit tests 
      "vitest/no-conditional-tests": "error",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-done-callback": "error",
      "vitest/no-duplicate-hooks": "error",
      "vitest/no-focused-tests": "error",
      "vitest/no-identical-title": "error",
      "vitest/no-interpolation-in-snapshots": "error",
      "vitest/no-mocks-import": "error",
      "vitest/no-standalone-expect": "error",
      "vitest/no-test-return-statement": "error",
      "vitest/prefer-called-with": "warn",
      "vitest/prefer-comparison-matcher": "warn",
      "vitest/prefer-equality-matcher": "warn",
      "vitest/prefer-expect-resolves": "warn",
      "vitest/prefer-hooks-on-top": "error",
      "vitest/prefer-mock-promise-shorthand": "warn",
      "vitest/prefer-spy-on": "warn",
      "vitest/prefer-strict-equal": "warn",
      "vitest/prefer-to-be-falsy": "warn",
      "vitest/prefer-to-be-truthy": "warn",
      "vitest/prefer-to-contain": "warn",
      "vitest/prefer-to-have-length": "warn",
      "vitest/require-hook": "off", // Allow top-level describes in unit tests
      "vitest/require-to-throw-message": "warn",
      "vitest/require-top-level-describe": "warn",
      "vitest/valid-describe-callback": "error",
      "vitest/valid-expect": "error",
      "vitest/valid-title": "error",
    },
  },

  // E2E test file specific rules (Playwright)
  {
    files: [
      "**/*.spec.{js,ts,tsx}",
      "**/tests/e2e/**/*.{js,ts,tsx}",
      "**/e2e/**/*.{js,ts,tsx}",
      "**/tests/global-setup.ts",
      "**/tests/synthetic/**/*.{js,ts,tsx}",
      "**/tests/performance/**/*.{js,ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Tests might need any for mocking
      "no-console": "off", // Allow console in tests
      
      // Allow networkidle in E2E tests (legacy but still functional)
      "playwright/no-networkidle": "off",
      "testing-library/no-render-in-setup": "off",
      
      "testing-library/no-wait-for-multiple-assertions": "off",
      "testing-library/prefer-find-by": "off",
      // Disable testing-library rules for E2E tests (Playwright doesn't use React Testing Library)
      "testing-library/prefer-screen-queries": "off",
      "vitest/no-standalone-expect": "off", // Playwright expects work differently
      
      // Disable conflicting Vitest rules for E2E tests
      "vitest/require-hook": "off", // Playwright has different structure
    },
  },

  // Playwright specific rules
  {
    files: ["**/e2e/**/*.{js,ts}", "**/*.spec.ts"],
    rules: {
      "playwright/expect-expect": "error",
      "playwright/no-element-handle": "warn", 
      "playwright/no-page-pause": "error",
    },
  },

  // API routes specific rules (enhanced security for server-side code)
  {
    files: ["src/app/api/**/*.{js,ts}"],
    rules: {
      "no-console": "off", // API routes might need console for logging
      
      "no-secrets/no-secrets": ["error", { tolerance: 3.5 }], // Stricter for APIs
      "security/detect-eval-with-expression": "error", // No eval in APIs
      "security/detect-non-literal-require": "error", // Prevent dynamic requires
      // Enhanced security for API routes
      "security/detect-object-injection": "error", // Critical for APIs
      "security/detect-possible-timing-attacks": "error", // Prevent timing attacks
      
      // Enhanced SonarJS rules for APIs
      "sonarjs/cognitive-complexity": ["error", 10], // Stricter complexity for APIs
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-ignored-return": "error",
    },
  },
];

export default eslintConfig;