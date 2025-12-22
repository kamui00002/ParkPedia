// 統一されたエラーハンドリングユーティリティ
// ユーザーフレンドリーなエラーメッセージの提供

/**
 * エラータイプ
 */
export const ErrorType = {
  NETWORK: 'NETWORK',
  PERMISSION: 'PERMISSION',
  VALIDATION: 'VALIDATION',
  AUTH: 'AUTH',
  UNKNOWN: 'UNKNOWN',
};

/**
 * エラーを分類
 * @param {Error} error - エラーオブジェクト
 * @returns {string} エラータイプ
 */
export const classifyError = error => {
  if (!error) return ErrorType.UNKNOWN;

  // Firebase エラーコード
  if (error.code) {
    if (error.code.startsWith('auth/')) {
      return ErrorType.AUTH;
    }
    if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
      return ErrorType.PERMISSION;
    }
    if (error.code === 'unavailable' || error.code === 'network-request-failed') {
      return ErrorType.NETWORK;
    }
  }

  // エラーメッセージから判定
  const message = error.message?.toLowerCase() || '';
  if (message.includes('network') || message.includes('接続')) {
    return ErrorType.NETWORK;
  }
  if (message.includes('permission') || message.includes('権限')) {
    return ErrorType.PERMISSION;
  }
  if (message.includes('validation') || message.includes('検証')) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.UNKNOWN;
};

/**
 * ユーザーフレンドリーなエラーメッセージを取得
 * @param {Error} error - エラーオブジェクト
 * @returns {Object} { title: string, message: string }
 */
export const getErrorMessage = error => {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.NETWORK:
      return {
        title: '接続エラー',
        message: 'インターネット接続を確認してから、もう一度お試しください。',
      };

    case ErrorType.PERMISSION:
      return {
        title: '権限エラー',
        message: 'この操作を実行する権限がありません。ログイン状態を確認してください。',
      };

    case ErrorType.AUTH:
      return {
        title: '認証エラー',
        message: getAuthErrorMessage(error),
      };

    case ErrorType.VALIDATION:
      return {
        title: '入力エラー',
        message: error.message || '入力内容を確認してください。',
      };

    default:
      return {
        title: 'エラー',
        message:
          error.message || '予期しないエラーが発生しました。しばらく待ってから再試行してください。',
      };
  }
};

/**
 * 認証エラーの詳細メッセージを取得
 * @param {Error} error - エラーオブジェクト
 * @returns {string} エラーメッセージ
 */
const getAuthErrorMessage = error => {
  if (!error.code) {
    return '認証に失敗しました。もう一度お試しください。';
  }

  const authErrorMessages = {
    'auth/user-not-found': 'このメールアドレスは登録されていません。',
    'auth/wrong-password': 'パスワードが正しくありません。',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/too-many-requests':
      'ログイン試行回数が多すぎます。しばらく待ってから再試行してください。',
    'auth/network-request-failed': 'ネットワーク接続を確認してから、もう一度お試しください。',
    'auth/user-disabled': 'このアカウントは無効化されています。',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
    'auth/weak-password': 'パスワードが弱すぎます。6文字以上で設定してください。',
  };

  return authErrorMessages[error.code] || '認証に失敗しました。もう一度お試しください。';
};

/**
 * エラーをログに記録
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 */
export const logError = (error, context = '') => {
  if (__DEV__) console.error(`[${context}] エラー:`, error);

  // 本番環境ではCrashlyticsに送信
  if (!__DEV__ && typeof require !== 'undefined') {
    try {
      const crashlytics = require('@react-native-firebase/crashlytics').default;
      crashlytics().recordError(error);
      crashlytics().log(`Context: ${context}`);
    } catch {
      // Crashlyticsが利用できない場合は無視
    }
  }
};

/**
 * エラーを処理してユーザーに表示
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 * @param {Function} showAlert - Alert表示関数（Alert.alertなど）
 */
export const handleError = (error, context = '', showAlert = null) => {
  // エラーをログに記録
  logError(error, context);

  // ユーザーに表示
  if (showAlert) {
    const { title, message } = getErrorMessage(error);
    showAlert(title, message);
  }

  return getErrorMessage(error);
};
