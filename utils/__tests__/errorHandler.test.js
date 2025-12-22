// エラーハンドリングユーティリティのテスト

import { classifyError, getErrorMessage, handleError, ErrorType } from '../errorHandler';

describe('classifyError', () => {
  it('should classify auth errors', () => {
    const error = { code: 'auth/user-not-found' };
    expect(classifyError(error)).toBe(ErrorType.AUTH);
  });

  it('should classify permission errors', () => {
    const error = { code: 'permission-denied' };
    expect(classifyError(error)).toBe(ErrorType.PERMISSION);
  });

  it('should classify network errors', () => {
    const error = { code: 'unavailable' };
    expect(classifyError(error)).toBe(ErrorType.NETWORK);
  });

  it('should classify unknown errors', () => {
    const error = { message: 'Unknown error' };
    expect(classifyError(error)).toBe(ErrorType.UNKNOWN);
  });
});

describe('getErrorMessage', () => {
  it('should return network error message', () => {
    const error = { code: 'unavailable' };
    const result = getErrorMessage(error);
    expect(result.title).toBe('接続エラー');
    expect(result.message).toContain('インターネット接続');
  });

  it('should return permission error message', () => {
    const error = { code: 'permission-denied' };
    const result = getErrorMessage(error);
    expect(result.title).toBe('権限エラー');
    expect(result.message).toContain('権限');
  });

  it('should return auth error message with specific code', () => {
    const error = { code: 'auth/user-not-found' };
    const result = getErrorMessage(error);
    expect(result.title).toBe('認証エラー');
    expect(result.message).toContain('メールアドレス');
  });

  it('should return default error message for unknown errors', () => {
    const error = { message: 'Unknown error' };
    const result = getErrorMessage(error);
    expect(result.title).toBe('エラー');
    expect(result.message).toBeTruthy();
  });
});

describe('handleError', () => {
  it('should call showAlert with error message', () => {
    const error = { code: 'unavailable' };
    const showAlert = jest.fn();

    handleError(error, 'TestContext', showAlert);

    expect(showAlert).toHaveBeenCalledWith('接続エラー', expect.any(String));
  });

  it('should return error message object', () => {
    const error = { code: 'permission-denied' };
    const result = handleError(error, 'TestContext');

    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('message');
  });
});
