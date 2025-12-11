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
// IMPORTANT: クラッシュ修正のため、一時的に無効化
export const AD_ENABLED = false;

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

// 広告表示設定
export const AD_SETTINGS = {
  banner: {
    enabled: true,  // バナー広告を有効にする
    height: 50,     // バナー広告の高さ（ピクセル）
  },
};

// 広告プレースホルダーの背景色
export const AD_PLACEHOLDER_COLOR = '#FFE5E5';
