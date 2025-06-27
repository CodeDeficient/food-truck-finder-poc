module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true, // Tell ts-jest to use ESM
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Treat .ts and .tsx as ESM
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Handle CSS Modules or other non-JS assets if needed in the future
    // "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/playwright\\.config\\.test\\.ts$",
    "/tests/e2e\\.test\\.ts$",
    "/tests/pipeline\\.e2e\\.test\\.ts$",
    "/tests/pipeline\\.(.*)\\.e2e\\.test\\.ts$"
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
