// Firebase設定ファイル
// Firebase Consoleから取得した設定値をここに記載してください

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase設定オブジェクト
// Firebase Console > プロジェクト設定 > 全般 > あなたのアプリ
// から取得した設定値を以下に記載してください
const firebaseConfig = {
  apiKey: "AIzaSyA9SSLSvpeX1IHm8-ZaVX9MOJes52If9vE",
  authDomain: "parkpedia-app.firebaseapp.com",
  projectId: "parkpedia-app",
  storageBucket: "parkpedia-app.firebasestorage.app",
  messagingSenderId: "118041891633",
  appId: "1:118041891633:web:b2e8681fa2ae32f6d51610"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

console.log('🔥 Firebase初期化完了');
console.log('🆔 プロジェクトID:', firebaseConfig.projectId);
console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
console.log('📱 App Name:', app.name);

// Authentication（認証）- React Native用の設定
// initializeAuthは既に初期化されている場合にエラーを出す可能性があるため、
// エラーハンドリングを追加
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Auth初期化完了（initializeAuth）');
} catch (error) {
  // 既に初期化されている場合はgetAuthを使用
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('✅ Auth初期化完了（getAuth - 既に初期化済み）');
  } else {
    throw error;
  }
}
export { auth };

// Firestore（データベース）
export const db = getFirestore(app);
console.log('💾 Firestore初期化完了');
console.log('💾 Firestore DB:', db ? '接続済み' : '未接続');
console.log('📂 Firestore App:', db.app.name);
console.log('🆔 プロジェクトID:', db.app.options.projectId);

// Storage（ファイルストレージ）
export const storage = getStorage(app);

export default app;

