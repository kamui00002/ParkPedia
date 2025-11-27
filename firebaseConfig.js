// Firebase設定ファイル
// Firebase Consoleから取得した設定値をここに記載してください

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// React Native版のみAsyncStorageをインポート
let AsyncStorage;
try {
  if (Platform.OS !== 'web') {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  }
} catch (error) {
  // AsyncStorageが利用できない場合は無視
  console.warn('AsyncStorage is not available:', error);
}

// Firebase設定オブジェクト
// Firebase Console > プロジェクト設定 > 全般 > あなたのアプリ
// から取得した設定値を以下に記載してください
const firebaseConfig = {
  apiKey: "AIzaSyCQlkTZ43bdJ8wsbZm8h4qrIU_mxjCTXUE",
  authDomain: "parkpedia-app.firebaseapp.com",
  projectId: "parkpedia-app",
  storageBucket: "parkpedia-app.firebasestorage.app",
  messagingSenderId: "118041891633",
  appId: "1:118041891633:ios:25c857a6e7d53dd7d51610"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// 開発環境でのみログ出力
if (__DEV__) {
  console.log('🔥 Firebase初期化完了');
  console.log('🆔 プロジェクトID:', firebaseConfig.projectId);
}

// Authentication（認証）- プラットフォーム別の設定
let auth;
try {
  // Web版ではgetAuthを使用、React Native版ではAsyncStorageを使用
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    // Web版ではエラーを無視してgetAuthを使用
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
}
export { auth };

// Firestore（データベース）
export const db = getFirestore(app);

// Storage（ファイルストレージ）
export const storage = getStorage(app);

export default app;

