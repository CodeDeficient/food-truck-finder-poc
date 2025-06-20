import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const globals = require('globals'); // Use require for globals
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores - PREVENTION-FOCUSED
  {
    ignores: [
      ".next/",
      "node_modules/",
      "build/",
      "dist/",
      "public/",
      // "scripts/", // Temporarily allow scripts for execution
      "lib/database.types.ts", // Ignore auto-generated Supabase types file
      // Temporarily ignore test files while focusing on main application code
      "**/*.test.ts",
      "**/*.test.tsx",
      "tests/**/*",
      "lib/**/*.test.ts",
      "playwright.config.*.ts",
      "jest.config.ts",
      "setup-tests.*",
      "test-*.js",
      // Configuration files
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
      "coverage/",
      // Legacy files that cause parsing errors
      "setup-tests.cjs",
      "setup-tests.js",
      "test-enhanced-pipeline-api.js",
      "test-enhanced-pipeline.js",
      "test-pipeline-simple.js",
      "playwright.config.test.ts",
      // Quality gate reports
      "eslint-*.json",
      "quality-report.json",
    ],
  },

  // Base ESLint recommended rules
  tseslint.configs.base, // More foundational than eslint.configs.recommended for tseslint.config
  
  // TypeScript configurations
  ...tseslint.configs.recommendedTypeChecked, // Includes recommended and recommended-requiring-type-checking
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"], // Adjusted to match old config
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true }, // From old config
      },
    },
  },

  // Next.js specific configurations
  // These replace 'next/core-web-vitals'
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
    languageOptions: { // Next.js specific globals
        globals: {
            ...globals.browser,
            React: "readonly", // Example, Next.js preset handles this
        }
    }
  },
  
  // SonarJS recommended rules
  sonarjs.configs.recommended,

  // Unicorn recommended rules
  unicorn.configs.recommended,

  // PREVENTION-FOCUSED RULES CONFIGURATION
  {
    rules: {
      // CRITICAL: Type Safety Prevention (60% of errors)
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",

      // CRITICAL: Complexity Prevention (25% of errors)
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-nested-conditional": "error",
      "max-lines-per-function": ["error", 50],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],

      // CRITICAL: Consistency Prevention (10% of errors)
      "unicorn/no-null": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/require-await": "error",

      // IMPORTANT: Code Quality Prevention
      "sonarjs/no-dead-store": "error",
      "sonarjs/prefer-read-only-props": "error",
      "sonarjs/void-use": "error",

      // Filename case configuration
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": [
        "error",
        {
          "cases": {
            "camelCase": true,
            "pascalCase": true,
          },
          "ignore": [
            /^README\.md$/,
            /^next-env\.d\.ts$/,
            /^postcss\.config\.mjs$/,
            /^tailwind\.config\.ts$/,
            /^next\.config\.mjs$/,
            /^jest\.config\.ts$/,
            /^CODEBASE_RULES\.md$/,
            /^DASHBOARD_PLAN\.md$/,
            /^RISKS\.md$/,
            /^WBS_CHECKLIST\.md$/,
            /^LINTING_PREVENTION_FRAMEWORK\.md$/,
            /^SYSTEMATIC_ERROR_PREVENTION\.md$/
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    },
  },

  // Prettier - must be last to override other formatting rules
  eslintConfigPrettier,

  // Override for JavaScript files (including .cjs)
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      parserOptions: {
        project: null, // Do not use tsconfig.json for JS/CJS files
      },
      globals: { // Add Node.js globals for CJS files
        ...require('globals').node, // Using require for globals
      }
    },
    rules: {
      // Disable TypeScript-specific rules that don't apply to JS
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-var-requires": "off", // Allow require in CJS
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-array-delete": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-duplicate-type-constituents": "off",
      "@typescript-eslint/no-implied-eval": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-unsafe-unary-minus": "off"
    }
  }
);
