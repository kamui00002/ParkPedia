import { uploadImageToStorage, uploadMultipleImages } from '../imageUploader';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../firebaseConfig';

// Firebase Storage のモック
jest.mock('firebase/storage');
jest.mock('../../firebaseConfig');

describe('imageUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // グローバル fetch のモックをリセット
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      })
    );
  });

  describe('uploadImageToStorage', () => {
    it('ログインしていない場合はエラーをスローする', async () => {
      auth.currentUser = null;

      await expect(uploadImageToStorage('file:///test.jpg', 'parks')).rejects.toThrow(
        'ログインが必要です'
      );
    });

    it('正常に画像をアップロードして URL を返す', async () => {
      // ユーザーがログインしている状態をモック
      auth.currentUser = { uid: 'test-user-123' };

      // Firebase Storage のモック設定
      const mockStorageRef = { path: 'images/parks/test-user-123/image.jpg' };
      ref.mockReturnValue(mockStorageRef);
      uploadBytes.mockResolvedValue({});
      getDownloadURL.mockResolvedValue('https://storage.example.com/image.jpg');

      const result = await uploadImageToStorage('file:///test.jpg', 'parks');

      // 正しいパスで ref が呼ばれたかを確認
      expect(ref).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/^images\/parks\/test-user-123\/\d+_.+\.jpg$/)
      );

      // uploadBytes が呼ばれたことを確認
      expect(uploadBytes).toHaveBeenCalledWith(mockStorageRef, expect.any(Blob), {
        contentType: 'image/jpeg',
      });

      // ダウンロード URL が取得されたことを確認
      expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(result).toBe('https://storage.example.com/image.jpg');
    });

    it('fetch が失敗した場合はエラーをスローする', async () => {
      auth.currentUser = { uid: 'test-user-123' };

      // fetch が失敗するようにモック
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        })
      );

      await expect(uploadImageToStorage('file:///test.jpg', 'parks')).rejects.toThrow(
        '画像の読み込みに失敗しました'
      );
    });

    it('アップロード権限がない場合は適切なエラーメッセージを返す', async () => {
      auth.currentUser = { uid: 'test-user-123' };

      const mockStorageRef = { path: 'images/parks/test-user-123/image.jpg' };
      ref.mockReturnValue(mockStorageRef);

      // Firebase Storage が unauthorized エラーを返すようにモック
      const storageError = new Error('Unauthorized');
      storageError.code = 'storage/unauthorized';
      uploadBytes.mockRejectedValue(storageError);

      await expect(uploadImageToStorage('file:///test.jpg', 'parks')).rejects.toThrow(
        'アップロード権限がありません。ログイン状態を確認してください。'
      );
    });

    it('アップロードがキャンセルされた場合は適切なエラーメッセージを返す', async () => {
      auth.currentUser = { uid: 'test-user-123' };

      const mockStorageRef = { path: 'images/parks/test-user-123/image.jpg' };
      ref.mockReturnValue(mockStorageRef);

      // Firebase Storage が canceled エラーを返すようにモック
      const storageError = new Error('Canceled');
      storageError.code = 'storage/canceled';
      uploadBytes.mockRejectedValue(storageError);

      await expect(uploadImageToStorage('file:///test.jpg', 'parks')).rejects.toThrow(
        'アップロードがキャンセルされました'
      );
    });
  });

  describe('uploadMultipleImages', () => {
    it('複数の画像を正常にアップロードする', async () => {
      auth.currentUser = { uid: 'test-user-123' };

      const mockStorageRef = { path: 'images/parks/test-user-123/image.jpg' };
      ref.mockReturnValue(mockStorageRef);
      uploadBytes.mockResolvedValue({});
      getDownloadURL
        .mockResolvedValueOnce('https://storage.example.com/image1.jpg')
        .mockResolvedValueOnce('https://storage.example.com/image2.jpg')
        .mockResolvedValueOnce('https://storage.example.com/image3.jpg');

      const imageUris = ['file:///test1.jpg', 'file:///test2.jpg', 'file:///test3.jpg'];

      const results = await uploadMultipleImages(imageUris, 'parks');

      expect(results).toEqual([
        'https://storage.example.com/image1.jpg',
        'https://storage.example.com/image2.jpg',
        'https://storage.example.com/image3.jpg',
      ]);
      expect(uploadBytes).toHaveBeenCalledTimes(3);
    });

    it('1つでもアップロードが失敗したらエラーをスローする', async () => {
      auth.currentUser = { uid: 'test-user-123' };

      const mockStorageRef = { path: 'images/parks/test-user-123/image.jpg' };
      ref.mockReturnValue(mockStorageRef);

      // 2番目のアップロードが失敗するようにモック
      uploadBytes
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValueOnce({});

      getDownloadURL.mockResolvedValue('https://storage.example.com/image.jpg');

      const imageUris = ['file:///test1.jpg', 'file:///test2.jpg', 'file:///test3.jpg'];

      await expect(uploadMultipleImages(imageUris, 'parks')).rejects.toThrow();
    });

    it('空の配列を渡した場合は空の配列を返す', async () => {
      auth.currentUser = { uid: 'test-user-123' };

      const results = await uploadMultipleImages([], 'parks');

      expect(results).toEqual([]);
      expect(uploadBytes).not.toHaveBeenCalled();
    });
  });
});
