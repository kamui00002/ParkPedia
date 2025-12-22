// 統一されたエラーハンドリングユーティリティ
// ユーザーフレンドリーなエラーメッセージの提供

/**
 * エラータイプ
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN',
}

/**
 * エラーメッセージの型定義
 */
export interface ErrorMessage {
  title: string;
  message: string;
}

/**
 * Firebase エラーの型定義
 */
interface FirebaseError extends Error {
  code?: string;
  message: string;
}

/**
 * エラーを分類
 */
export const classifyError = (error: unknown): ErrorType => {
  if (!error) return ErrorType.UNKNOWN;

  const firebaseError = error as FirebaseError;

  // Firebase エラーコード
  if (firebaseError.code) {
    if (firebaseError.code.startsWith('auth/')) {
      return ErrorType.AUTH;
    }
    if (
      firebaseError.code === 'permission-denied' ||
      firebaseError.code === 'storage/unauthorized'
    ) {
      return ErrorType.PERMISSION;
    }
    if (firebaseError.code === 'unavailable' || firebaseError.code === 'network-request-failed') {
      return ErrorType.NETWORK;
    }
  }

  // エラーメッセージから判定
  const message = firebaseError.message?.toLowerCase() || '';
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
 * 認証エラーの詳細メッセージを取得
 */
const getAuthErrorMessage = (error: FirebaseError): string => {
  if (!error.code) {
    return '認証に失敗しました。もう一度お試しください。';
  }

  const authErrorMessages: Record<string, string> = {
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
 * ユーザーフレンドリーなエラーメッセージを取得
 */
export const getErrorMessage = (error: unknown): ErrorMessage => {
  const errorType = classifyError(error);
  const firebaseError = error as FirebaseError;

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
        message: getAuthErrorMessage(firebaseError),
      };

    case ErrorType.VALIDATION:
      return {
        title: '入力エラー',
        message: firebaseError.message || '入力内容を確認してください。',
      };

    default:
      return {
        title: 'エラー',
        message:
          firebaseError.message ||
          '予期しないエラーが発生しました。しばらく待ってから再試行してください。',
      };
  }
};

/**
 * エラーをログに記録
 */
export const logError = (error: unknown, context: string = ''): void => {
  if (__DEV__) {
    console.error(`[${context}] エラー:`, error);
  }

  // 本番環境ではCrashlyticsに送信
  if (!__DEV__ && typeof require !== 'undefined') {
    try {
      const crashlytics = require('@react-native-firebase/crashlytics').default;
      crashlytics().recordError(error as Error);
      crashlytics().log(`Context: ${context}`);
    } catch {
      // Crashlyticsが利用できない場合は無視
    }
  }
};

/**
 * Alert表示関数の型定義
 */
type ShowAlertFunction = (title: string, message: string) => void;

/**
 * エラーを処理してユーザーに表示
 */
export const handleError = (
  error: unknown,
  context: string = '',
  showAlert: ShowAlertFunction | null = null
): ErrorMessage => {
  // エラーをログに記録
  logError(error, context);

  // ユーザーに表示
  if (showAlert) {
    const { title, message } = getErrorMessage(error);
    showAlert(title, message);
  }

  return getErrorMessage(error);
};
