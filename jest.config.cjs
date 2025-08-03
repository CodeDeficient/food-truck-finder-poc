const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/(test|spec)/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e.test.ts',
    '<rootDir>/tests/pipeline.*.e2e.test.ts',
    '<rootDir>/tests/playwright.config.test.ts',
    '<rootDir>/dist/',
    '<rootDir>/.next/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@supabase/supabase-js|@supabase/realtime-js|@supabase/auth-helpers-nextjs|@supabase/ssr|@google/genai|@radix-ui/.*|cmdk|date-fns|embla-carousel-react|input-otp|js-cookie|leaflet|lucide-react|next-themes|react-day-picker|react-hook-form|react-leaflet|react-resizable-panels|recharts|sonner|tailwind-merge|tailwindcss-animate|vaul|web-vitals|zod)/)',
  ],
};

module.exports = createJestConfig(config);
