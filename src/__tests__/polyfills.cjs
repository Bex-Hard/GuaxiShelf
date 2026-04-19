/**
 * Polyfills for jsdom — run via jest.config.cjs `setupFiles`.
 *
 * react-router-dom v7 uses TextEncoder/TextDecoder internally.
 * jsdom does not provide them, but Node.js ≥ 11 does (in `util`).
 */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
