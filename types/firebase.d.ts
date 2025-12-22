/**
 * ParkPedia - Firebase関連の型定義
 * Firebase認証、Firestore、Storageの型を定義
 */

import { FirebaseApp } from 'firebase/app';
import { Auth, User as FirebaseUser } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

/**
 * Firebase設定情報の型定義
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Firebase初期化後のインスタンス
 */
export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

/**
 * Firebase Auth User の型エイリアス
 */
export type AuthUser = FirebaseUser | null;

/**
 * Firebase Storage エラーコード
 */
export type StorageErrorCode =
  | 'storage/unauthorized'
  | 'storage/canceled'
  | 'storage/unknown'
  | 'storage/object-not-found'
  | 'storage/bucket-not-found'
  | 'storage/project-not-found'
  | 'storage/quota-exceeded'
  | 'storage/unauthenticated'
  | 'storage/invalid-checksum'
  | 'storage/retry-limit-exceeded'
  | 'storage/invalid-event-name'
  | 'storage/invalid-url'
  | 'storage/invalid-argument'
  | 'storage/no-default-bucket'
  | 'storage/cannot-slice-blob'
  | 'storage/server-file-wrong-size';

/**
 * Firebase Storage エラーの型定義
 */
export interface StorageError extends Error {
  code: StorageErrorCode;
  message: string;
  name: string;
}

/**
 * 画像アップロード時のメタデータ
 */
export interface ImageUploadMetadata {
  contentType: string;
  customMetadata?: {
    [key: string]: string;
  };
}

/**
 * ストレージフォルダの型定義
 */
export type StorageFolder = 'parks' | 'reviews' | 'profiles';
