// ErrorBoundary コンポーネントのテスト

import React from 'react';
import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import ErrorBoundary from '../ErrorBoundary';

// Crashlytics をモック
jest.mock('@react-native-firebase/crashlytics', () => ({
  __esModule: true,
  default: () => ({
    recordError: jest.fn(),
    log: jest.fn(),
  }),
}));

// Platform をモック
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(dict => dict.ios),
}));

// エラーをスローするテスト用コンポーネント
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Normal content</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // コンソールエラーを抑制（テスト中にエラーが表示されるのを防ぐ）
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should render children when there is no error', () => {
    const tree = renderer.create(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    const instance = tree.getInstance();
    expect(instance.state.hasError).toBe(false);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('should render error UI when an error occurs', () => {
    const tree = renderer.create(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const instance = tree.getInstance();
    expect(instance.state.hasError).toBe(true);

    const json = tree.toJSON();
    expect(json).toBeTruthy();
    // エラーメッセージが含まれていることを確認
    const jsonString = JSON.stringify(json);
    expect(jsonString).toMatch(/予期しないエラーが発生しました/i);
  });

  it('should show error details in development mode', () => {
    const originalDev = __DEV__;
    global.__DEV__ = true;

    const tree = renderer.create(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const json = tree.toJSON();
    const jsonString = JSON.stringify(json);
    expect(jsonString).toMatch(/エラー詳細/i);

    global.__DEV__ = originalDev;
  });

  it('should reset error state when reset button is pressed', () => {
    const tree = renderer.create(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const instance = tree.getInstance();
    expect(instance.state.hasError).toBe(true);

    // リセットボタンを押す
    instance.handleReset();

    // エラー状態がリセットされる
    expect(instance.state.hasError).toBe(false);
    expect(instance.state.error).toBe(null);
  });
});
