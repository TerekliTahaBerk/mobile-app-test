// The safe-area insets that Screen and BottomAction read are native values, so
// tests use the library's own mock instead of a provider wrapper per test.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
