// Firebase設定ファイル
// 環境変数から設定値を読み込むように変更（セキュリティ向上）
// 実際の設定値は .env ファイルまたは EAS Secrets で管理

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// React Native版のみAsyncStorageをインポート
// Web以外のすべてのプラットフォーム（iOS、Android）で必要
let AsyncStorage = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    // AsyncStorageが利用できない場合はエラーをログに記録
    if (__DEV__) {
      console.error('CRITICAL: AsyncStorage is not available on native platform:', error);
    }
    // ネイティブ環境でAsyncStorageが利用できない場合は致命的
    throw new Error('AsyncStorage is required for Firebase Auth on iOS/Android');
  }
}

// Firebase設定オブジェクト
// 環境変数から読み込み（app.config.js の extra フィールド経由）
// ローカル開発: .env ファイルから読み込み
// 本番ビルド: EAS Secrets から読み込み
// 注: フォールバック値（||の右側）は使わない。.env / EAS Secrets 必須。
//     値が無い場合は下の missingFields チェックで起動を停止する。
const extra = Constants.expoConfig?.extra || {};
const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

// 設定値の検証（必須フィールドチェック）
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  const errorMsg =
    `Missing Firebase configuration: ${missingFields.join(', ')}. ` +
    'Please check your .env file or EAS Secrets configuration.';
  // 本番環境でもエラーをログに記録（Crashlyticsに送信）
  // 注: API キー等の値そのものは出さず、各フィールドが存在するかの真偽値のみ出力
  console.error('❌ Firebase設定エラー:', errorMsg);
  console.error('Current config (masked):', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey,
    hasAppId: !!firebaseConfig.appId,
    hasStorageBucket: !!firebaseConfig.storageBucket,
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  });
  throw new Error(errorMsg);
}

// Firebase初期化
let app;
try {
  app = initializeApp(firebaseConfig);

  // 開発環境でのみログ出力
  if (__DEV__) {
    console.log('🔥 Firebase初期化完了');
    console.log('🆔 プロジェクトID:', firebaseConfig.projectId);
  }
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // 既に初期化済みの場合は既存のアプリインスタンスを取得
    const { getApp } = require('firebase/app');
    app = getApp();
    if (__DEV__) {
      console.log('🔥 Firebase既存インスタンスを使用');
    }
  } else {
    // 本番環境でもエラーをログに記録
    console.error('Firebase初期化エラー:', error);
    throw error;
  }
}

// Authentication（認証）- プラットフォーム別の設定
let auth;
try {
  // Web版ではgetAuthを使用、React Native版ではAsyncStorageを使用
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // ネイティブ環境ではAsyncStorageが必須
    if (!AsyncStorage) {
      // これは発生してはいけないエラー（上でthrowしているため）
      throw new Error('AsyncStorage is required for native platforms');
    }
    // AsyncStorageを使用してPersistenceを有効化
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    if (__DEV__) {
      console.log('🔐 Firebase Auth初期化完了（AsyncStorage Persistence有効）');
    }
  }
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    if (__DEV__) {
      console.log('🔐 Firebase Auth既存インスタンスを使用');
    }
  } else {
    // その他のエラーは致命的
    // 本番環境でもエラーをログに記録
    console.error('CRITICAL: Firebase Auth初期化エラー:', error);
    throw error;
  }
}
export { auth };

// Firestore（データベース）
export const db = getFirestore(app);

// Storage（ファイルストレージ）
export const storage = getStorage(app);

export default app;
