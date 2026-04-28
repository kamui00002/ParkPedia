/**
 * ParkPedia E2E テスト
 * Detox を使用したエンドツーエンドテスト
 */
/* global device, element, by, waitFor */

describe('ParkPedia App', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Firestoreのネットワークリクエスト中の同期問題を回避
    await device.disableSynchronization();
  });

  afterAll(async () => {
    await device.enableSynchronization();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // アプリのローディングを待つ（少し待機）
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  describe('アプリ起動', () => {
    it('アプリが正常に起動する', async () => {
      // ホーム画面のタイトルが表示されることを確認
      await expect(element(by.id('app-title'))).toBeVisible();
    });
  });

  describe('ホーム画面', () => {
    it('検索バーが表示される', async () => {
      await waitFor(element(by.id('search-input')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('公園リストが表示される', async () => {
      // 公園リストコンテナが存在することを確認
      await waitFor(element(by.id('park-list')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('フィルターボタンが表示される', async () => {
      await waitFor(element(by.id('filter-button')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('マイページボタンが表示される', async () => {
      await waitFor(element(by.id('mypage-button')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('検索機能', () => {
    it('検索バーにテキストを入力できる', async () => {
      await waitFor(element(by.id('search-input')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).typeText('公園');
    });

    it('検索後も公園リストが存在する', async () => {
      await waitFor(element(by.id('search-input')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).typeText('公園');
      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 2000));
      // 公園リストが存在することを確認
      await expect(element(by.id('park-list'))).toExist();
    });
  });

  describe('ナビゲーション', () => {
    it('マイページボタンをタップできる', async () => {
      await waitFor(element(by.id('mypage-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('mypage-button')).tap();
      // 未ログイン時はアラートが表示される
      await new Promise(resolve => setTimeout(resolve, 1000));
      // アラートのボタンをタップして閉じる
      try {
        await element(by.label('キャンセル')).tap();
      } catch {
        // アラートが表示されなかった場合は無視
      }
    });
  });

  describe('フィルター機能', () => {
    it('フィルタードロワーを開ける', async () => {
      await waitFor(element(by.id('filter-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('filter-button')).tap();
      await waitFor(element(by.id('filter-drawer')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('フィルタードロワーを閉じれる', async () => {
      await waitFor(element(by.id('filter-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('filter-button')).tap();
      await waitFor(element(by.id('filter-drawer')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('filter-close-button')).tap();
      await waitFor(element(by.id('filter-drawer')))
        .not.toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('公園詳細画面', () => {
    it('公園をタップすると詳細画面に遷移する', async () => {
      // Firestoreからデータがロードされるまで待つ
      await waitFor(element(by.id('park-card-0')))
        .toBeVisible()
        .withTimeout(20000);
      await element(by.id('park-card-0')).tap();
      // 詳細画面のヘッダーが表示されることを確認
      await waitFor(element(by.text('公園詳細')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
