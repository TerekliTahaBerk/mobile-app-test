const preset = require('jest-expo/jest-preset');
const path = require('node:path');

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
    '^expo-modules-core$': path.join(
      path.dirname(require.resolve('expo/package.json')),
      'node_modules/expo-modules-core/src/index.ts',
    ),
    '^expo-modules-core/(.*)$': path.join(
      path.dirname(require.resolve('expo/package.json')),
      'node_modules/expo-modules-core/$1',
    ),
    '^@/assets/(.*)$': assetAlias,
    '^@/(.*)$': srcAlias,
    ...rest,
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Only *.test.* files are suites, so __tests__/support can hold helpers.
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 58,
      functions: 69,
      lines: 68,
      statements: 68,
    },
  },
};
