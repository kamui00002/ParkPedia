// Firebase Storage 画像アップロードユーティリティ
// 匿名ユーザーにも対応

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebaseConfig';

/**
 * 画像をFirebase Storageにアップロード
 * @param {string} imageUri - ローカルの画像URI
 * @param {string} folder - フォルダ名 ('parks', 'reviews', 'profiles')
 * @returns {Promise<string>} ダウンロードURL
 */
export const uploadImageToStorage = async (imageUri, folder = 'parks') => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('ログインが必要です');
  }

  // 匿名ユーザーでもUIDは存在する
  const userId = currentUser.uid;

  try {
    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomId}.jpg`;

    // 正しいパス構造: /images/{folder}/{userId}/{fileName}
    const storageRef = ref(storage, `images/${folder}/${userId}/${fileName}`);

    // ローカルファイルをBlobに変換
    const response = await fetch(imageUri);
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
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    
    // エラーメッセージを分かりやすく
    if (error.code === 'storage/unauthorized') {
      throw new Error('アップロード権限がありません。ログイン状態を確認してください。');
    } else if (error.code === 'storage/canceled') {
      throw new Error('アップロードがキャンセルされました');
    } else if (error.code === 'storage/unknown') {
      throw new Error('アップロード中に不明なエラーが発生しました');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('画像のアップロードに失敗しました');
    }
  }
};

/**
 * 複数の画像をアップロード
 * @param {string[]} imageUris - ローカルの画像URIの配列
 * @param {string} folder - フォルダ名
 * @returns {Promise<string[]>} ダウンロードURLの配列
 */
export const uploadMultipleImages = async (imageUris, folder = 'parks') => {
  try {
    const uploadPromises = imageUris.map(uri => uploadImageToStorage(uri, folder));
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('複数画像アップロードエラー:', error);
    throw error;
  }
};



