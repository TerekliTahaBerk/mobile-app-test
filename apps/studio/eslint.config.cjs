const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * The studio is a web app, but it lints under the same config as the mobile
 * workspace so one repository does not grow two opinions about its own code.
 */
module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
