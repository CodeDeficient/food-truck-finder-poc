import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Imports for FlatCompat
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const globals = require('globals'); // Use require for globals
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
// import nextPlugin from "@next/eslint-plugin-next"; // nextPlugin will be pulled by FlatCompat
import eslintConfigPrettier from "eslint-config-prettier";

// Prepare FlatCompat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname, // Important for FlatCompat to find plugins
});

export default tseslint.config(
  // Global ignores - PREVENTION-FOCUSED
  {
    ignores: [
      ".next/",
      "node_modules/",
      "build/",
      "dist/",
      "public/",
      "scripts/", // Ignore scripts directory with JS files
      "lib/database.types.ts", // Ignore auto-generated Supabase types file
      // Ignore test, mock, story, benchmark, example, docs, and markdown files/folders
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "test-*.js",
      "test-*.ts",
      "test-*.tsx",
      "**/*-test.*",
      "**/*-tests.*",
      "tests/**/*",
      "lib/**/*.test.ts",
      "**/__tests__/**",
      "**/*.mock.*",
      "**/*.stories.*",
      "**/*.snap",
      "coverage/",
      "**/*.bench.*",
      "**/*.example.*",
      "docs/**",
      "**/*.md",
      "playwright.config.*.ts",
      "jest.config.ts",
      "setup-tests.*",
      // Configuration files
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
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
      "analyze-complexity-violations.cjs", // Ignore CJS file causing parsing errors
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

  // Next.js specific configurations using FlatCompat
  // These will translate string extends like "plugin:@next/next/recommended"
  // and "next/core-web-vitals" into flat config objects.
  // Note: `eslint-config-next` (which provides 'next' and 'next/core-web-vitals' as extends)
  // should be a dependency, or `@next/eslint-plugin-next` must be resolvable by these strings.
  // Given `@next/eslint-plugin-next` is a dependency, 'plugin:@next/next/recommended' targets it directly.
  // 'next/core-web-vitals' typically comes from `eslint-config-next`. If `eslint-config-next`
  // is not present, this specific extend might fail. The build log warning about plugin
  // detection is the primary target.
  // The Next.js docs show `extends: ['next/core-web-vitals']` which implies `eslint-config-next`.
  // If `eslint-config-next` is not installed, then only `plugin:@next/next/recommended` might work directly.
  // Let's try with what's documented for FlatCompat first.
  // The project has `@next/eslint-plugin-next`.
  // `plugin:@next/next/recommended` is the direct way to get rules from the plugin itself.
  // `next/core-web-vitals` is a preset usually from `eslint-config-next`.
  // For now, let's try to ensure the plugin itself is loaded via its direct preset.
  // And add the core-web-vitals string as per Next.js docs, FlatCompat should handle it if `eslint-config-next` is implicitly available or if the string maps to the plugin.
  ...compat.extends('plugin:@next/next/recommended'),
  ...compat.extends('next/core-web-vitals'),
  // Ensure these are spread in case `compat.extends` returns an array of config objects.
  
  // SonarJS recommended rules
  sonarjs.configs.recommended,

  // Unicorn recommended rules
  unicorn.configs.recommended,

  // Disable sonarjs/different-types-comparison for the hooks directory
  {
    files: ["hooks/**/*.ts", "hooks/**/*.tsx"],
    rules: {
      "sonarjs/different-types-comparison": "off",
    },
  },

  // PREVENTION-FOCUSED RULES CONFIGURATION
  {
    rules: {
      // CRITICAL: Type Safety Prevention (60% of errors)
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/strict-boolean-expressions": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",

      // CRITICAL: Complexity Prevention (25% of errors)
      "sonarjs/cognitive-complexity": ["warn", 25],
      "sonarjs/no-nested-conditional": "error",
      "max-lines-per-function": ["warn", 120],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],

      // CRITICAL: Consistency Prevention (10% of errors)
      "unicorn/no-null": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/require-await": "error",

      // IMPORTANT: Code Quality Prevention
      "sonarjs/no-dead-store": "error",
      "sonarjs/prefer-read-only-props": "error",
      "sonarjs/void-use": "error",
      "sonarjs/no-invariant-returns": "off",

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
  eslintConfigPrettier
);
