module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // Console logs - warn in dev, error in production
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Unused variables detection (disabled in favor of TypeScript rule)
    'no-unused-vars': 'off',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Native specific
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',

    // General code quality
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'no-duplicate-imports': 'error',

    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // Prohibit 'any' type usage - enforce type safety
    '@typescript-eslint/no-explicit-any': 'error',
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
};
