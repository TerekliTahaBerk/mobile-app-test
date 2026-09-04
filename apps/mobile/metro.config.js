const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// expo-sqlite uses a WebAssembly worker on web. Metro only bundles extensions
// listed as assets, so the production export must opt in to `.wasm` files.
config.resolver.assetExts.push('wasm');

module.exports = config;
