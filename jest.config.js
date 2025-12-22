module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|expo-constants|expo-image-picker|expo-location|expo-status-bar|expo-updates|expo-font|react-native-google-mobile-ads|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-vector-icons|react-native-webview|firebase|@firebase)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/vendor/**',
    '!jest.config.js',
    '!jest-setup.js',
    '!babel.config.js',
    '!metro.config.js',
    '!**/ios/**',
    '!**/android/**',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^react-native$': 'react-native',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^expo-image-manipulator$': '<rootDir>/__mocks__/expo-image-manipulator.js',
  },
  globals: {
    __DEV__: true,
  },
};
