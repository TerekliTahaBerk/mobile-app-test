const preset = require('jest-expo/jest-preset');

/**
 * The preset derives `@/*` and `@/assets/*` from tsconfig, but emits `@/*`
 * first, so asset requires resolve into `src/`. Re-emit the map with the more
 * specific rule ahead of it, keeping every other preset mapping intact.
 */
const { '^@/(.*)$': srcAlias, '^@/assets/(.*)$': assetAlias, ...rest } = preset.moduleNameMapper;

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/assets/(.*)$': assetAlias,
    '^@/(.*)$': srcAlias,
    ...rest,
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
