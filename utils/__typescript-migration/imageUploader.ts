/**
 * Firebase Storage 画像アップロードユーティリティ
 * 匿名ユーザーにも対応
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebaseConfig';
import { StorageFolder, StorageError } from '../types/firebase';
import { compressImage } from './imageCompressor';

/**
 * 画像をFirebase Storageにアップロード
 * @param imageUri - ローカルの画像URI
 * @param folder - フォルダ名 ('parks', 'reviews', 'profiles')
 * @returns ダウンロードURL
 * @throws エラーが発生した場合はErrorをスロー
 */
export const uploadImageToStorage = async (
  imageUri: string,
  folder: StorageFolder = 'parks'
): Promise<string> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('ログインが必要です');
  }

  // 匿名ユーザーでもUIDは存在する
  const userId: string = currentUser.uid;

  try {
    // パフォーマンス最適化: アップロード前に画像を圧縮
    let processedImageUri = imageUri;
    try {
      processedImageUri = await compressImage(imageUri, {
        maxWidth: 1200,
        maxHeight: 1200,
        compress: 0.8,
      });
    } catch (compressError) {
      if (__DEV__) {
        console.warn('画像圧縮に失敗しました。元の画像をアップロードします:', compressError);
      }
      // 圧縮に失敗した場合は元の画像を使用
      processedImageUri = imageUri;
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomId}.jpg`;

    // 正しいパス構造: /images/{folder}/{userId}/{fileName}
    const storageRef = ref(storage, `images/${folder}/${userId}/${fileName}`);

    // ローカルファイルをBlobに変換
    const response = await fetch(processedImageUri);
    if (!response.ok) {
      throw new Error('画像の読み込みに失敗しました');
    }

    const blob = await response.blob();

    // Content Typeを設定（画像ファイルであることを明示）
    const metadata = {
      contentType: 'image/jpeg',
    };

    // Firebase Storageにアップロード
    await uploadBytes(storageRef, blob, metadata);

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error: unknown) {
    if (__DEV__) {
      console.error('画像アップロードエラー:', error);
    }

    // エラーメッセージを分かりやすく
    const storageError = error as StorageError;

    if (storageError.code === 'storage/unauthorized') {
      throw new Error('アップロード権限がありません。ログイン状態を確認してください。');
    } else if (storageError.code === 'storage/canceled') {
      throw new Error('アップロードがキャンセルされました');
    } else if (storageError.code === 'storage/unknown') {
      throw new Error('アップロード中に不明なエラーが発生しました');
    } else if (error instanceof Error && error.message) {
      throw error;
    } else {
      throw new Error('画像のアップロードに失敗しました');
    }
  }
};

/**
 * 複数の画像をアップロード
 * @param imageUris - ローカルの画像URIの配列
 * @param folder - フォルダ名
 * @returns ダウンロードURLの配列
 * @throws エラーが発生した場合はErrorをスロー
 */
export const uploadMultipleImages = async (
  imageUris: string[],
  folder: StorageFolder = 'parks'
): Promise<string[]> => {
  try {
    const uploadPromises = imageUris.map(uri => uploadImageToStorage(uri, folder));
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error: unknown) {
    if (__DEV__) {
      console.error('複数画像アップロードエラー:', error);
    }
    throw error;
  }
};
