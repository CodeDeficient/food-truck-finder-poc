import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const globals = require('globals'); // Use require for globals
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores from your old config
  {
    ignores: [
      ".next/",
      "node_modules/",
      "build/",
      "dist/",
      "public/",
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
      // Assuming these are in the root or should be ignored globally
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
      "coverage/",
      // Ignore CommonJS and plain JS files that cause parsing errors
      "setup-tests.cjs",
      "setup-tests.js",
      "test-enhanced-pipeline-api.js",
      "test-enhanced-pipeline.js",
      "test-pipeline-simple.js",
      "playwright.config.test.ts", // Empty test file
      // Specific files from old ignorePatterns that might not be covered by above
      // (e.g., if they are not *.config.*)
      // We can add more specific ignores if needed.
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

  // Your custom rules and overrides
  {
    rules: {
      "unicorn/prevent-abbreviations": "off", // As per your old config
      "unicorn/filename-case": [
        "error",
        {
          "cases": {
            "camelCase": true,
            "pascalCase": true,
          },
          // For flat config, ignores are typically handled globally or per-config object.
          // This rule's 'ignore' option might still work for specific filenames.
          // If these are top-level files, they might need to be listed in the global ignores
          // or this rule might need a more specific `files` pattern in this config block.
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
            /^WBS_CHECKLIST\.md$/
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
