const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e.test.ts',
    '<rootDir>/tests/pipeline.*.e2e.test.ts',
    '<rootDir>/tests/playwright.config.test.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@supabase/supabase-js|@supabase/realtime-js|@supabase/auth-helpers-nextjs|@supabase/ssr|@google/genai|@radix-ui/react-toast|@radix-ui/react-dialog|@radix-ui/react-dropdown-menu|@radix-ui/react-popover|@radix-ui/react-tooltip|@radix-ui/react-select|@radix-ui/react-slider|@radix-ui/react-switch|@radix-ui/react-tabs|@radix-ui/react-toggle|@radix-ui/react-toggle-group|@radix-ui/react-accordion|@radix-ui/react-alert-dialog|@radix-ui/react-aspect-ratio|@radix-ui/react-avatar|@radix-ui/react-checkbox|@radix-ui/react-collapsible|@radix-ui/react-context-menu|@radix-ui/react-hover-card|@radix-ui/react-label|@radix-ui/react-menubar|@radix-ui/react-navigation-menu|@radix-ui/react-progress|@radix-ui/react-radio-group|@radix-ui/react-scroll-area|@radix-ui/react-select|@radix-ui/react-separator|@radix-ui/react-slider|@radix-ui/react-slot|@radix-ui/react-switch|@radix-ui/react-tabs|@radix-ui/react-toast|@radix-ui/react-toggle|@radix-ui/react-toggle-group|@radix-ui/react-tooltip|cmdk|date-fns|embla-carousel-react|input-otp|js-cookie|leaflet|lucide-react|next-themes|react-day-picker|react-hook-form|react-leaflet|react-resizable-panels|recharts|sonner|tailwind-merge|tailwindcss-animate|vaul|web-vitals|zod)/)',
  ],
};

module.exports = createJestConfig(customJestConfig);