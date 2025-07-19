import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const globals = require('globals'); // Use require for globals
const espree = require('espree');
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import nextPlugin from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // 1. Global ignores - PREVENTION-FOCUSED
  {
    ignores: [
      '.next/',
      'jscpd-report/',
      'node_modules/',
      '.claude-thoughts/',
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
      'delete-file.cjs',
      'filter-eslint-errors.cjs',
      'jest.setup.js',
      'temp-lint-analyzer.cjs',
      'test-pipeline-simple.js',
      'playwright.config.test.ts',
      'jest.config.*',
      'lib/utils/typeGuards.js',
      'pretty-print-json.cjs', // Ignore script causing parsing errors
      // Quality gate reports
      'eslint-*.json',
      'quality-report.json',
      'analyze-complexity-violations.cjs', // Ignore CJS file causing parsing errors
    ],
  },

  // 2. Base configurations applied to all linted files
  tseslint.configs.base,
  sonarjs.configs.recommended,
  unicorn.configs.recommended,

  // 3. TypeScript specific configurations (Type-Aware)
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Rules that require type information
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // 4. Configuration for JavaScript and CommonJS files (NOT Type-Aware)
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      parser: espree,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Add any JS-specific, non-type-aware rules here
    },
  },

  // 5. Next.js specific configurations
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
    },
  },

  // 6. Global rules for all file types (Complexity, Consistency, etc.)
  {
    rules: {
      // Complexity Prevention
      'sonarjs/cognitive-complexity': ['warn', 25],
      'sonarjs/no-nested-conditional': 'error',
      'max-lines-per-function': ['warn', 120],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],

      // Consistency Prevention
      'unicorn/no-null': 'warn',

      // Code Quality Prevention
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
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // 7. Specific Overrides
  {
    files: ['hooks/**/*.ts', 'hooks/**/*.tsx'],
    rules: {
      'sonarjs/different-types-comparison': 'off',
    },
  },
  {
    files: ['components/admin/dashboard/TrucksPage.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  {
    files: ['app/admin/food-trucks/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  {
    files: ['hooks/realtime/**/*.ts', 'hooks/realtime/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: ['components/TruckCard.tsx'],
    rules: {
      'sonarjs/different-types-comparison': 'off',
    },
  },

  {
    files: ['hooks/useTruckCard.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  {
    files: ['hooks/realtime/**/*.ts', 'hooks/realtime/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },

  // 8. Prettier - must be last to override other formatting rules
  eslintConfigPrettier,
);