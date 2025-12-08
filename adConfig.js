/**
 * AdMob広告設定
 *
 * このファイルでは、AdMob広告の設定を管理します。
 * - 広告の有効/無効を切り替え
 * - 広告ユニットIDを管理
 */

// 広告を有効にするかどうか
// テスト中は false、本番環境では true に設定
// 注意: Expo Go環境では広告モジュールが利用できないため、
//       AdBannerコンポーネント内で自動的に無効化されます
export const AD_ENABLED = true;

// AdMob広告ユニットID
export const AD_UNIT_IDS = {
  // バナー広告（ホーム画面など）
  banner: 'ca-app-pub-5237930968754753/1172496343',

  // 今後追加する広告フォーマット用
  // interstitial: 'ca-app-pub-5237930968754753/XXXXXXXXXX',
  // rewarded: 'ca-app-pub-5237930968754753/XXXXXXXXXX',
};

// テスト用の設定
export const AD_TEST_MODE = __DEV__; // 開発環境では自動的にテストモード
