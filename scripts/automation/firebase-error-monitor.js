#!/usr/bin/env node

/**
 * Firebase Error Monitor
 *
 * Firebaseのエラーログを監視し、異常を検知したら通知を送る
 *
 * 使用方法:
 *   node firebase-error-monitor.js
 *
 * 環境変数:
 *   FIREBASE_SERVICE_ACCOUNT - サービスアカウントJSONのパス
 *   SLACK_WEBHOOK_URL - Slack Webhook URL
 *   ERROR_THRESHOLD - エラー閾値（デフォルト: 10）
 */

const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');

// 設定
const CONFIG = {
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccount.json',
  slackWebhook: process.env.SLACK_WEBHOOK_URL,
  errorThreshold: parseInt(process.env.ERROR_THRESHOLD || '10', 10),
  timeRangeHours: 24,
};

// Firebase Admin初期化
function initializeFirebase() {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(CONFIG.serviceAccountPath, 'utf8')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.firestore();
}

// エラーログを取得
async function getErrorLogs(db) {
  const hoursAgo = new Date(Date.now() - CONFIG.timeRangeHours * 60 * 60 * 1000);

  try {
    // エラーログコレクションがある場合
    const errorLogsRef = db.collection('errorLogs');
    const snapshot = await errorLogsRef
      .where('timestamp', '>=', hoursAgo)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const errors = [];
    snapshot.forEach(doc => {
      errors.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return errors;
  } catch (error) {
    console.error('エラーログの取得に失敗:', error);
    return [];
  }
}

// エラーを分類
function categorizeErrors(errors) {
  const categories = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  errors.forEach(error => {
    const severity = error.severity?.toLowerCase() || 'low';
    const message = error.message || '';

    // 重大度の判定
    if (
      severity === 'critical' ||
      message.includes('crash') ||
      message.includes('fatal')
    ) {
      categories.critical.push(error);
    } else if (
      severity === 'error' ||
      severity === 'high' ||
      message.includes('failed') ||
      message.includes('exception')
    ) {
      categories.high.push(error);
    } else if (severity === 'warning' || severity === 'medium') {
      categories.medium.push(error);
    } else {
      categories.low.push(error);
    }
  });

  return categories;
}

// Slack通知を送信
async function sendSlackNotification(categories, totalErrors) {
  if (!CONFIG.slackWebhook) {
    console.log('⚠️  SLACK_WEBHOOK_URLが設定されていません');
    return;
  }

  const message = {
    text: '🚨 Firebase エラー検知',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Firebase エラー検知',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*総エラー数:*\n${totalErrors}`,
          },
          {
            type: 'mrkdwn',
            text: `*期間:*\n過去${CONFIG.timeRangeHours}時間`,
          },
          {
            type: 'mrkdwn',
            text: `*🔴 Critical:*\n${categories.critical.length}`,
          },
          {
            type: 'mrkdwn',
            text: `*🟠 High:*\n${categories.high.length}`,
          },
        ],
      },
      {
        type: 'divider',
      },
    ],
  };

  // 最新の重要なエラーを追加
  const topErrors = [
    ...categories.critical.slice(0, 3),
    ...categories.high.slice(0, 2),
  ];

  if (topErrors.length > 0) {
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*最近の重要なエラー:*',
      },
    });

    topErrors.forEach((error, index) => {
      const timestamp = error.timestamp?.toDate
        ? error.timestamp.toDate().toLocaleString('ja-JP')
        : 'N/A';

      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${index + 1}. *${error.severity || 'ERROR'}*\n\`${
            error.message || 'No message'
          }\`\n_${timestamp}_`,
        },
      });
    });
  }

  message.blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '詳細は Firebase Console で確認してください',
    },
  });

  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.slackWebhook);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Slack通知を送信しました');
          resolve(data);
        } else {
          console.error('❌ Slack通知の送信に失敗:', res.statusCode, data);
          reject(new Error(`Slack notification failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', error => {
      console.error('❌ Slack通知エラー:', error);
      reject(error);
    });

    req.write(JSON.stringify(message));
    req.end();
  });
}

// メイン処理
async function main() {
  console.log('🔍 Firebase Error Monitor 起動');
  console.log(`期間: 過去${CONFIG.timeRangeHours}時間`);
  console.log(`閾値: ${CONFIG.errorThreshold}件`);

  try {
    const db = initializeFirebase();
    const errors = await getErrorLogs(db);

    console.log(`📊 取得したエラー数: ${errors.length}件`);

    if (errors.length === 0) {
      console.log('✅ エラーは検出されませんでした');
      return;
    }

    const categories = categorizeErrors(errors);

    console.log('📈 エラー分類:');
    console.log(`  🔴 Critical: ${categories.critical.length}件`);
    console.log(`  🟠 High: ${categories.high.length}件`);
    console.log(`  🟡 Medium: ${categories.medium.length}件`);
    console.log(`  🟢 Low: ${categories.low.length}件`);

    // 閾値チェック
    const criticalAndHigh = categories.critical.length + categories.high.length;
    const shouldNotify =
      errors.length > CONFIG.errorThreshold || criticalAndHigh > 0;

    if (shouldNotify) {
      console.log('⚠️  エラー閾値を超過、通知を送信します');
      await sendSlackNotification(categories, errors.length);
    } else {
      console.log('✅ エラー数は閾値以下です');
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// エラーログ記録用のヘルパー関数（アプリ側で使用）
async function logError(db, error, context = {}) {
  try {
    await db.collection('errorLogs').add({
      message: error.message || String(error),
      stack: error.stack,
      severity: context.severity || 'error',
      context: context,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: context.userAgent,
      userId: context.userId,
    });
  } catch (e) {
    console.error('エラーログの記録に失敗:', e);
  }
}

// 直接実行された場合
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ 完了');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  main,
  getErrorLogs,
  categorizeErrors,
  sendSlackNotification,
  logError,
};
