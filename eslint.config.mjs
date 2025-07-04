import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const globals = require('globals'); // Use require for globals
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import nextPlugin from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores - PREVENTION-FOCUSED
  {
    ignores: [
      '.next/',
      'node_modules/',
      'build/',
      'dist/',
      'public/',
      'scripts/', // Ignore scripts directory with JS files
      'lib/database.types.ts', // Ignore auto-generated Supabase types file
      // Ignore test, mock, story, benchmark, example, docs, and markdown files/folders
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'test-*.js',
      'test-*.ts',
      'test-*.tsx',
      '**/*-test.*',
      '**/*-tests.*',
      'tests/**/*',
      'lib/**/*.test.ts',
      '**/__tests__/**',
      '**/*.mock.*',
      '**/*.stories.*',
      '**/*.snap',
      'coverage/',
      '**/*.bench.*',
      '**/*.example.*',
      'docs/**',
      '**/*.md',
      'playwright.config.*.ts',
      'jest.config.ts',
      'setup-tests.*',
      // Configuration files
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      // Legacy files that cause parsing errors
      'setup-tests.cjs',
      'setup-tests.js',
      'test-enhanced-pipeline-api.js',
      'test-enhanced-pipeline.js',
      'test-pipeline-simple.js',
      'playwright.config.test.ts',
      // Quality gate reports
      'eslint-*.json',
      'quality-report.json',
      'analyze-complexity-violations.cjs', // Ignore CJS file causing parsing errors
    ],
  },

  // Base ESLint recommended rules
  tseslint.configs.base, // More foundational than eslint.configs.recommended for tseslint.config

  // TypeScript configurations
  ...tseslint.configs.recommendedTypeChecked, // Includes recommended and recommended-requiring-type-checking
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'], // Adjusted to match old config
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true }, // From old config
      },
    },
  },

  // Next.js specific configurations
  // These replace 'next/core-web-vitals'
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    languageOptions: {
      // Next.js specific globals
      globals: {
        ...globals.browser,
        React: 'readonly', // Example, Next.js preset handles this
      },
    },
  },

  // SonarJS recommended rules
  sonarjs.configs.recommended,

  // Unicorn recommended rules
  unicorn.configs.recommended,

  // Import plugin configuration
  {
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true, // try to resolve '@types' even if it's not in 'main'
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      'import/no-duplicates': 'error',
      // 'import/order': [
      //   'warn',
      //   {
      //     groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      //     'newlines-between': 'always',
      //     alphabetize: { order: 'asc', caseInsensitive: true },
      //   },
      // ],
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
          customGroups: { // Optional: more granular control if needed
            value: {
              react: ['react', 'react-*'],
              next: ['next', 'next-*'],
            },
          },
          newlinesBetween: 'always',
        },
      ],
      // Add specific SonarJS duplication rules if not covered by recommended, though they usually are.
      // 'sonarjs/no-duplicate-string': ['warn', 5], // Example: detect 5+ duplicate strings
      // 'sonarjs/no-identical-functions': 'warn', // Already in recommended
    },
  },

  // Disable sonarjs/different-types-comparison for the hooks directory
  {
    files: ['hooks/**/*.ts', 'hooks/**/*.tsx'],
    rules: {
      'sonarjs/different-types-comparison': 'off',
    },
  },

  // PREVENTION-FOCUSED RULES CONFIGURATION
  {
    rules: {
      // CRITICAL: Type Safety Prevention (60% of errors)
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // CRITICAL: Complexity Prevention (25% of errors)
      'sonarjs/cognitive-complexity': ['warn', 25],
      'sonarjs/no-nested-conditional': 'error',
      'max-lines-per-function': ['warn', 120],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],

      // CRITICAL: Consistency Prevention (10% of errors)
      'unicorn/no-null': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'error',

      // IMPORTANT: Code Quality Prevention
      'sonarjs/no-dead-store': 'error',
      'sonarjs/prefer-read-only-props': 'error',
      'sonarjs/void-use': 'error',
      'sonarjs/no-invariant-returns': 'off',

      // Filename case configuration
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
          ignore: [
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
            /^SYSTEMATIC_ERROR_PREVENTION\.md$/,
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // Prettier - must be last to override other formatting rules
  eslintConfigPrettier,
);
