// Extends Jest's `expect` with custom DOM matchers:
// toBeInTheDocument, toHaveValue, toHaveAttribute, etc.
import '@testing-library/jest-dom';

// @testing-library/react calls cleanup() automatically via its own
// afterEach hook, so we do not need to call it manually.

// Reset localStorage before each test so state does not bleed between suites.
beforeEach(() => {
  localStorage.clear();
});
