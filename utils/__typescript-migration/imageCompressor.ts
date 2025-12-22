// 画像圧縮・リサイズユーティリティ
// パフォーマンス最適化: アップロード前の画像処理

import * as ImageManipulator from 'expo-image-manipulator';

/**
 * 画像圧縮オプション
 */
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  compress?: number;
}

/**
 * 画像情報の型定義
 */
interface ImageInfo {
  uri: string;
  width: number;
  height: number;
}

/**
 * 画像を圧縮・リサイズ
 */
export const compressImage = async (
  imageUri: string,
  options: CompressImageOptions = {}
): Promise<string> => {
  const { maxWidth = 1024, maxHeight = 1024, compress = 0.7 } = options;

  try {
    // 画像情報を取得
    const imageInfo = (await ImageManipulator.manipulateAsync(imageUri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    })) as ImageInfo;

    // リサイズが必要かチェック
    const needsResize = imageInfo.width > maxWidth || imageInfo.height > maxHeight;

    if (needsResize) {
      // アスペクト比を保ちながらリサイズ
      const aspectRatio = imageInfo.width / imageInfo.height;
      let resizeWidth = maxWidth;
      let resizeHeight = maxHeight;

      if (aspectRatio > 1) {
        // 横長
        resizeHeight = maxWidth / aspectRatio;
      } else {
        // 縦長
        resizeWidth = maxHeight * aspectRatio;
      }

      // リサイズと圧縮を実行
      const manipResult = (await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: resizeWidth, height: resizeHeight } }],
        {
          compress,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      )) as ImageInfo;

      if (__DEV__) {
        console.log(
          `画像を圧縮: ${imageInfo.width}x${imageInfo.height} → ${manipResult.width}x${manipResult.height}`
        );
      }

      return manipResult.uri;
    } else {
      // リサイズ不要の場合は圧縮のみ
      const manipResult = (await ImageManipulator.manipulateAsync(imageUri, [], {
        compress,
        format: ImageManipulator.SaveFormat.JPEG,
      })) as ImageInfo;

      return manipResult.uri;
    }
  } catch (error) {
    if (__DEV__) {
      console.error('画像圧縮エラー:', error);
    }
    // エラー時は元の画像URIを返す
    return imageUri;
  }
};

/**
 * 複数の画像を圧縮
 */
export const compressMultipleImages = async (
  imageUris: string[],
  options: CompressImageOptions = {}
): Promise<string[]> => {
  try {
    const compressPromises = imageUris.map(uri => compressImage(uri, options));
    const compressedUris = await Promise.all(compressPromises);
    return compressedUris;
  } catch (error) {
    if (__DEV__) {
      console.error('複数画像圧縮エラー:', error);
    }
    // エラー時は元の画像URIを返す
    return imageUris;
  }
};
