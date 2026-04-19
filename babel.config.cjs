/**
 * Babel config for Jest ONLY.
 * The `env.test` block is active when NODE_ENV=test (set automatically by Jest).
 * Vite uses @rolldown/plugin-babel with its own inline config, so this file
 * does not interfere with the dev/build pipeline.
 */
module.exports = {
  env: {
    test: {
      presets: [
        // Transform modern JS → CommonJS so Jest (Node) can load it
        ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
        // Transform JSX with the automatic React 17+ runtime
        ['@babel/preset-react', { runtime: 'automatic' }],
        // Strip TypeScript types
        ['@babel/preset-typescript'],
      ],
    },
  },
};
