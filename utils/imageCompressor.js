// 画像圧縮・リサイズユーティリティ
// パフォーマンス最適化: アップロード前の画像処理

import * as ImageManipulator from 'expo-image-manipulator';

/**
 * 画像を圧縮・リサイズ
 * @param {string} imageUri - ローカルの画像URI
 * @param {Object} options - 圧縮オプション
 * @param {number} options.maxWidth - 最大幅（デフォルト: 1024）
 * @param {number} options.maxHeight - 最大高さ（デフォルト: 1024）
 * @param {number} options.compress - 圧縮率 0-1（デフォルト: 0.7）
 * @returns {Promise<string>} 圧縮後の画像URI
 */
export const compressImage = async (imageUri, options = {}) => {
  const { maxWidth = 1024, maxHeight = 1024, compress = 0.7 } = options;

  try {
    // 画像情報を取得
    const imageInfo = await ImageManipulator.manipulateAsync(imageUri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });

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
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: resizeWidth, height: resizeHeight } }],
        {
          compress,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      if (__DEV__)
        console.log(
          `画像を圧縮: ${imageInfo.width}x${imageInfo.height} → ${manipResult.width}x${manipResult.height}`
        );

      return manipResult.uri;
    } else {
      // リサイズ不要の場合は圧縮のみ
      const manipResult = await ImageManipulator.manipulateAsync(imageUri, [], {
        compress,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return manipResult.uri;
    }
  } catch (error) {
    if (__DEV__) console.error('画像圧縮エラー:', error);
    // エラー時は元の画像URIを返す
    return imageUri;
  }
};

/**
 * 複数の画像を圧縮
 * @param {string[]} imageUris - 画像URIの配列
 * @param {Object} options - 圧縮オプション
 * @returns {Promise<string[]>} 圧縮後の画像URIの配列
 */
export const compressMultipleImages = async (imageUris, options = {}) => {
  try {
    const compressPromises = imageUris.map(uri => compressImage(uri, options));
    const compressedUris = await Promise.all(compressPromises);
    return compressedUris;
  } catch (error) {
    if (__DEV__) console.error('複数画像圧縮エラー:', error);
    // エラー時は元の画像URIを返す
    return imageUris;
  }
};
