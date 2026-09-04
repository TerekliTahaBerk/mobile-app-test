const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['coverage/*', 'dist/*'],
  },
  {
    files: ['src/modules/**/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'Domain code must remain framework-independent.' },
            { name: 'react-native', message: 'Domain code must remain framework-independent.' },
            { name: 'expo', message: 'Domain code must remain framework-independent.' },
            { name: 'expo-router', message: 'Navigation belongs outside the domain layer.' },
            { name: 'expo-sqlite', message: 'SQLite belongs in infrastructure adapters.' },
          ],
          patterns: [
            {
              group: [
                'expo-*',
                '@expo/*',
                '@react-native/*',
                '@/modules/*/application/**',
                '@/modules/*/infrastructure/**',
                '@/modules/*/ui/**',
                '@/shared/platform/**',
                '@/shared/ui/**',
              ],
              message: 'Domain code may only depend on pure domain/shared utilities.',
            },
          ],
        },
      ],
    },
  },
]);
