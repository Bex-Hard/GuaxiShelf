/** @type {import('jest').Config} */
module.exports = {
  // Use jsdom to simulate a browser environment (window, document, localStorage…)
  testEnvironment: 'jsdom',

  // Polyfills that must exist BEFORE any test module is evaluated.
  // react-router-dom v7 uses TextEncoder/TextDecoder which jsdom does not provide.
  setupFiles: ['<rootDir>/src/__tests__/polyfills.cjs'],

  // Run @testing-library/jest-dom AFTER Jest's expect is ready so custom
  // matchers like toBeInTheDocument() are available in every test file.
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // babel-jest handles .ts/.tsx → CJS transformation for Node
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },

  // CSS Modules → identity-obj-proxy returns the class name as a string
  // (e.g. styles.title → 'title'), so assertions on className still work.
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Static asset imports (images, SVGs) return a plain string stub
    '\\.(png|jpg|jpeg|gif|svg|ico|webp)$': '<rootDir>/src/__tests__/__mocks__/fileMock.cjs',
  },

  // Only pick up files inside src/__tests__/
  testMatch: ['<rootDir>/src/__tests__/**/*.test.{ts,tsx}'],

  // Show individual test names in the output
  verbose: true,

  // Clear mock state (calls, instances, results) before every test
  clearMocks: true,
};
