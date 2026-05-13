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
// PP-H3: Crashlytics ロード結果をモジュールスコープでキャッシュ。
// ロード失敗を空 catch で握り潰すと、logError を呼んでも本番ですべての
// エラー報告が消える「連鎖 silent fail」を防ぐ。
let _crashlyticsModule = null;
let _crashlyticsLoadAttempted = false;
let _crashlyticsLoadError = null;

const _ensureCrashlytics = () => {
  if (_crashlyticsLoadAttempted) return _crashlyticsModule;
  _crashlyticsLoadAttempted = true;
  if (__DEV__ || typeof require === 'undefined') return null;
  try {
    _crashlyticsModule = require('@react-native-firebase/crashlytics').default;
    return _crashlyticsModule;
  } catch (loadErr) {
    _crashlyticsLoadError = loadErr;
    // production でも消えない経路でロード失敗を可視化 (__DEV__ ガード外)
    // ESLint が走る場合は eslint-disable-next-line no-console を行頭に入れる
    console.error('[errorHandler] Crashlytics module load failed:', loadErr?.message ?? loadErr);
    return null;
  }
};

export const logError = (error, context = '') => {
  if (__DEV__) console.error(`[${context}] エラー:`, error);

  // 本番環境ではCrashlyticsに送信
  if (!__DEV__) {
    const crashlytics = _ensureCrashlytics();
    if (crashlytics) {
      try {
        crashlytics().recordError(error);
        crashlytics().log(`Context: ${context}`);
      } catch (sendErr) {
        // recordError 自体の失敗も silent にしない
        console.error(
          '[errorHandler] Crashlytics recordError failed:',
          sendErr?.message ?? sendErr
        );
      }
    }
    // _crashlyticsLoadError は _ensureCrashlytics 内で既にログ済
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
