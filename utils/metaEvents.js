// utils/metaEvents.js
// Meta (Facebook) App Events のラッパー
// react-native-fbsdk-next の AppEventsLogger を安全にラップする。
// - Expo Go / web では no-op (require が失敗するため try/catch でガード)
// - SDK 未初期化のときも no-op
// - 値の検証 (空文字、長すぎる文字列、null/undefined) を行う
//
// 使い方:
//   import { metaEvents } from '../utils/metaEvents';
//   metaEvents.logViewedContent(parkId, parkName);
//
// 注意:
// - イベント名は FBSDK の標準名 (fb_mobile_*) を使うと Events Manager に
//   自動的に標準イベントとして表示される
// - カスタムパラメータは fb_*_id, fb_search_string 等の標準キーを優先
// - パラメータ値は最大 100 文字 (Meta 仕様)

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// AppEventsLogger を安全に取得 (失敗しても落ちない)
import { logError } from './errorHandler';

let AppEventsLogger = null;
let isAvailable = false;

function getLogger() {
  if (isAvailable) return AppEventsLogger;
  if (Platform.OS === 'web') return null;
  // Expo Go では fbsdk のネイティブモジュールが存在しない
  if (Constants.appOwnership === 'expo') return null;

  try {
    const fbsdk = require('react-native-fbsdk-next');
    if (fbsdk && fbsdk.AppEventsLogger) {
      AppEventsLogger = fbsdk.AppEventsLogger;
      isAvailable = true;
      return AppEventsLogger;
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[MetaEvents] fbsdk module unavailable:', err.message);
    }
  }
  return null;
}

// 文字列を Meta 仕様 (最大100文字, 制御文字なし) にトリム
function sanitize(value, max = 100) {
  if (value == null) return undefined;
  const str = String(value)
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
  if (str.length === 0) return undefined;
  return str.length > max ? str.slice(0, max) : str;
}

// 数値を妥当範囲にクランプ
function sanitizeNumber(value, min = 0, max = 1e9) {
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.min(Math.max(num, min), max);
}

// ベースの logEvent ラッパー (例外を握りつぶす)
function safeLogEvent(eventName, params, valueToSum) {
  const logger = getLogger();
  if (!logger) return;

  try {
    // params から undefined を除去
    const clean = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') clean[k] = v;
      });
    }

    if (valueToSum !== undefined) {
      logger.logEvent(eventName, valueToSum, clean);
    } else {
      logger.logEvent(eventName, clean);
    }

    if (__DEV__) {
      console.log('[MetaEvents]', eventName, clean, valueToSum ?? '');
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[MetaEvents] logEvent failed:', eventName, err.message);
    }
    // PP-H5: production でも logError を呼ぶ。
    // Meta 広告コンバージョン計測欠落の silent fail を可視化。
    try {
      logError(err, `metaEvents.logEvent(${eventName})`);
    } catch {}
  }
}

export const metaEvents = {
  /**
   * SDK が利用可能か (ネイティブビルドで初期化済みか)
   */
  isReady() {
    return !!getLogger();
  },

  /**
   * アプリ起動完了 (App.js の Meta SDK 初期化完了直後に 1 回だけ呼ぶ)
   * FBSDK 標準: fb_mobile_activate_app
   */
  logActivatedApp() {
    safeLogEvent('fb_mobile_activate_app', {});
  },

  /**
   * 新規登録完了
   * @param {string} method - 'email' | 'anonymous' など
   */
  logCompletedRegistration(method = 'email') {
    safeLogEvent('fb_mobile_complete_registration', {
      fb_registration_method: sanitize(method),
    });
  },

  /**
   * コンテンツ閲覧 (公園詳細などを開いた)
   * @param {string} contentId - 例: park ID
   * @param {string} contentName - 例: 公園名
   * @param {string} contentType - 例: 'park'
   */
  logViewedContent(contentId, contentName, contentType = 'park') {
    safeLogEvent('fb_mobile_content_view', {
      fb_content_id: sanitize(contentId),
      fb_content_type: sanitize(contentType),
      fb_content_name: sanitize(contentName),
    });
  },

  /**
   * 検索
   * @param {string} searchString - 検索クエリ
   */
  logSearched(searchString) {
    const q = sanitize(searchString);
    if (!q) return; // 空クエリは送らない
    safeLogEvent('fb_mobile_search', {
      fb_search_string: q,
    });
  },

  /**
   * 評価/レビュー投稿
   * @param {string} contentId - park ID
   * @param {number} rating - 1-5
   */
  logRated(contentId, rating) {
    const r = sanitizeNumber(rating, 1, 5);
    safeLogEvent(
      'fb_mobile_rate',
      {
        fb_content_id: sanitize(contentId),
        fb_content_type: 'park',
        fb_max_rating_value: 5,
      },
      r
    );
  },

  /**
   * 投稿系コンバージョン (公園を新規追加など、コンバージョン目的にしたい高価値アクション)
   * FBSDK 標準: fb_mobile_submit_application
   */
  logSubmittedApplication(contentId, contentType = 'park') {
    safeLogEvent('fb_mobile_submit_application', {
      fb_content_id: sanitize(contentId),
      fb_content_type: sanitize(contentType),
    });
  },

  /**
   * チュートリアル完了 (オンボーディング、初回起動時)
   * FBSDK 標準: fb_mobile_tutorial_completion
   */
  logCompletedTutorial(success = true) {
    safeLogEvent('fb_mobile_tutorial_completion', {
      fb_success: success ? '1' : '0',
    });
  },
};

export default metaEvents;
