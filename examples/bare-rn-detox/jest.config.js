module.exports = {
  preset: '@react-native/jest-preset',
  // e2e/ and e2e-demo/ are Detox tests, run by `detox test` (or Baton).
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e'],
};
