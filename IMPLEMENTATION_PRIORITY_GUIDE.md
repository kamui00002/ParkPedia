# 実装優先度ガイド

**最終更新**: 2025-12-04
**対象**: ParkPedia セキュリティ強化 & 運用自動化

---

## 📋 概要

このガイドは、包括的セキュリティ監査の結果に基づく実装タスクを、優先度順にまとめたものです。

**関連ドキュメント**:
- [COMPREHENSIVE_SECURITY_AUDIT_REPORT.md](./COMPREHENSIVE_SECURITY_AUDIT_REPORT.md) - 詳細な監査結果
- [OPERATIONS_AUTOMATION_PLAN.md](./OPERATIONS_AUTOMATION_PLAN.md) - 自動化プラン

---

## ✅ 完了済み（2025-12-04）

### 🔴 最高優先度 - node-forge脆弱性の修正

- [x] `npm audit fix --force` 実行
- [x] 脆弱性: 0件に削減（1件 high → 0件）
- [x] package.json / package-lock.json 更新

**結果**: すべての既知の脆弱性を解決しました ✅

---

## 🚀 次のステップ（実装順）

### フェーズ1: 即時対応（24時間以内）

#### ✅ 完了
- [x] node-forge脆弱性修正
- [x] GitHub Actions: Security Audit ワークフロー作成
- [x] 自動化スクリプト: firebase-error-monitor.js 作成

#### ⬜ 残タスク
なし（すべて完了）

---

### フェーズ2: 短期対応（1週間以内）

#### 1. クライアント側入力検証の強化 🟡 中リスク

**対象ファイル**:
- `screens/AddReviewScreen.js`
- `screens/AddParkScreen.js`
- `screens/MyPageScreen.js`

**実装内容**:

##### AddReviewScreen.js

```javascript
// screens/AddReviewScreen.js の handleSubmit 関数を更新

const handleSubmit = async () => {
  // 既存: 評価チェック
  if (rating === 0) {
    Alert.alert('エラー', '星評価を選択してください');
    return;
  }

  // 既存: 空コメントチェック
  if (comment.trim() === '') {
    Alert.alert('エラー', 'コメントを入力してください');
    return;
  }

  // 🆕 追加: 文字数上限チェック
  if (comment.length > 1000) {
    Alert.alert('エラー', 'コメントは1000文字以内で入力してください');
    return;
  }

  // 🆕 追加: 危険なパターンチェック
  const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=/i;
  if (dangerousPatterns.test(comment)) {
    Alert.alert('エラー', '不正な文字が含まれています');
    return;
  }

  // ... 既存の送信処理
};
```

##### AddParkScreen.js

```javascript
// screens/AddParkScreen.js の handleSubmit 関数に追加

const handleSubmit = async () => {
  // 🆕 追加: 公園名の検証
  if (name.trim().length === 0) {
    Alert.alert('エラー', '公園名を入力してください');
    return;
  }

  if (name.length > 100) {
    Alert.alert('エラー', '公園名は100文字以内で入力してください');
    return;
  }

  // 🆕 追加: 住所の検証
  if (address.trim().length === 0) {
    Alert.alert('エラー', '住所を入力してください');
    return;
  }

  if (address.length > 300) {
    Alert.alert('エラー', '住所は300文字以内で入力してください');
    return;
  }

  // 🆕 追加: 説明の検証（オプショナル）
  if (description && description.length > 1000) {
    Alert.alert('エラー', '説明は1000文字以内で入力してください');
    return;
  }

  // 🆕 追加: 危険なパターンチェック
  const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=/i;
  if (
    dangerousPatterns.test(name) ||
    dangerousPatterns.test(address) ||
    dangerousPatterns.test(description)
  ) {
    Alert.alert('エラー', '不正な文字が含まれています');
    return;
  }

  // ... 既存の送信処理
};
```

**実装時間**: 30分
**テスト時間**: 30分
**合計**: 1時間

**テストケース**:
```javascript
// テスト1: 正常系
{
  name: "中央公園",
  address: "東京都渋谷区代々木1-2-3",
  description: "広い芝生があります",
  // ✅ 成功
}

// テスト2: 文字数超過
{
  comment: "あ".repeat(1001),
  // ❌ "コメントは1000文字以内で入力してください"
}

// テスト3: XSSパターン
{
  name: "<script>alert('XSS')</script>公園",
  // ❌ "不正な文字が含まれています"
}

// テスト4: 境界値
{
  comment: "あ".repeat(1000),
  // ✅ 成功（ちょうど1000文字）
}
```

---

#### 2. Firebase APIキーの環境変数化 🟡 中リスク

**手順**:

1. `.env.local` ファイル作成（ルートディレクトリ）
```bash
# .env.local
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCQlkTZ43bdJ8wsbZm8h4qrIU_mxjCTXUE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=parkpedia-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=parkpedia-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=parkpedia-app.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=118041891633
EXPO_PUBLIC_FIREBASE_APP_ID=1:118041891633:ios:25c857a6e7d53dd7d51610
```

2. `.gitignore` に追加
```bash
# Add to .gitignore
.env.local
.env*.local
```

3. `firebaseConfig.js` を更新
```javascript
// firebaseConfig.js

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 開発環境での検証
if (__DEV__) {
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error(
      '🔴 Missing Firebase config:',
      missingVars.join(', ')
    );
    console.error('Please check your .env.local file');
  }
}
```

4. Firebase Consoleでセキュリティ強化
   - Firebase Console > Project Settings > General
   - 「App check」を有効化（推奨）
   - 許可されたドメインを設定

**実装時間**: 20分
**テスト時間**: 10分
**合計**: 30分

---

#### 3. HTMLサニタイゼーションの実装 🟡 中リスク

**手順**:

1. パッケージのインストール
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

2. サニタイゼーションユーティリティ作成

`utils/sanitize.js`:
```javascript
import DOMPurify from 'dompurify';

/**
 * ユーザー入力をサニタイズ
 * @param {string} dirty - サニタイズする文字列
 * @param {Object} options - DOMPurifyオプション
 * @returns {string} サニタイズされた文字列
 */
export function sanitizeInput(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultOptions = {
    ALLOWED_TAGS: [], // HTMLタグをすべて除去
    ALLOWED_ATTR: [], // 属性をすべて除去
    KEEP_CONTENT: true, // タグは除去するがコンテンツは保持
  };

  return DOMPurify.sanitize(dirty, { ...defaultOptions, ...options });
}

/**
 * 表示用のサニタイズ（安全なHTMLは許可）
 */
export function sanitizeForDisplay(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}
```

3. コンポーネントでの使用

`screens/ParkDetailScreen.js`:
```javascript
import { sanitizeForDisplay } from '../utils/sanitize';

// レビュー表示部分
<Text style={styles.reviewComment}>
  {sanitizeForDisplay(review.comment)}
</Text>
```

**実装時間**: 30分
**テスト時間**: 20分
**合計**: 50分

---

### フェーズ3: 中期対応（2週間以内）

#### 1. セッション管理の強化 🟡 中リスク

**実装内容**:

`utils/sessionManager.js`:
```javascript
import { auth } from '../firebaseConfig';
import { Alert } from 'react-native';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30分
let inactivityTimer = null;

/**
 * 非アクティブタイマーをリセット
 */
export function resetInactivityTimer() {
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    handleSessionTimeout();
  }, INACTIVITY_TIMEOUT);
}

/**
 * セッションタイムアウト処理
 */
function handleSessionTimeout() {
  if (auth.currentUser) {
    auth.signOut();
    Alert.alert(
      'セッションタイムアウト',
      '30分間操作がなかったため、自動的にログアウトしました。',
      [{ text: 'OK' }]
    );
  }
}

/**
 * タイマーを停止
 */
export function stopInactivityTimer() {
  clearTimeout(inactivityTimer);
}

/**
 * アプリ全体で使用
 */
export function initializeSessionManager() {
  resetInactivityTimer();

  // ユーザーアクティビティでタイマーリセット
  const events = [
    'onTouchStart',
    'onPress',
    'onScroll',
  ];

  // React Navigationのナビゲーションイベントでもリセット
  return {
    resetInactivityTimer,
    stopInactivityTimer,
  };
}
```

`App.js` に追加:
```javascript
import { initializeSessionManager } from './utils/sessionManager';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const { resetInactivityTimer, stopInactivityTimer } = initializeSessionManager();

    return () => {
      stopInactivityTimer();
    };
  }, []);

  // ... 既存のコード
}
```

**実装時間**: 1時間
**テスト時間**: 30分
**合計**: 1.5時間

---

#### 2. Dependabotの設定 🟢 低リスク

**手順**:

1. `.github/dependabot.yml` を作成:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 5
    reviewers:
      - "kamui00002"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
```

2. GitHub Settings で有効化
   - Settings > Security > Dependabot alerts: ON
   - Settings > Security > Dependabot security updates: ON

**実装時間**: 10分
**テスト時間**: なし（自動）
**合計**: 10分

---

### フェーズ4: 長期対応（1ヶ月以内）

#### 1. 管理者機能の実装 🟢 低リスク

**Firebase Functions** で実装:

`functions/admin.js`:
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * ユーザーに管理者権限を付与
 */
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // 呼び出し元が既に管理者かチェック
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can add other admins'
    );
  }

  const { uid } = data;
  await admin.auth().setCustomUserClaims(uid, { admin: true });

  return { message: `Success! ${uid} is now an admin.` };
});

/**
 * レポートの一覧取得（管理者のみ）
 */
exports.getReports = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can view reports'
    );
  }

  const snapshot = await admin
    .firestore()
    .collection('reports')
    .where('status', '==', 'pending')
    .get();

  const reports = [];
  snapshot.forEach(doc => {
    reports.push({ id: doc.id, ...doc.data() });
  });

  return reports;
});
```

**実装時間**: 2時間
**テスト時間**: 1時間
**合計**: 3時間

---

## 📊 実装タイムライン

```
週1 (12/4-12/8):
  - [✅] node-forge脆弱性修正 (完了)
  - [✅] GitHub Actions設定 (完了)
  - [ ] クライアント側入力検証 (1時間)
  - [ ] 環境変数化 (30分)
  - [ ] HTMLサニタイゼーション (50分)

週2 (12/9-12/15):
  - [ ] セッション管理強化 (1.5時間)
  - [ ] Dependabot設定 (10分)

週3-4 (12/16-12/31):
  - [ ] 管理者機能実装 (3時間)
  - [ ] WebViewセキュリティ強化 (1時間)
  - [ ] パスワードポリシー更新 (Firebase Console)

合計実装時間: 約8-10時間
```

---

## 🧪 テスト計画

### 単体テスト

各機能の実装後、以下をテスト:

1. **入力検証**
   - 正常系: 有効な入力
   - 異常系: 空文字、長すぎる文字列、XSSパターン
   - 境界値: 最大文字数

2. **環境変数**
   - `.env.local` なしで起動 → エラー検知
   - `.env.local` ありで起動 → 正常動作

3. **サニタイゼーション**
   - `<script>alert('XSS')</script>` → タグ除去
   - `<b>太字</b>` → 許可されたタグは保持

### 統合テスト

1. **ローカルテスト**
   ```bash
   npm start
   # iOSシミュレータでテスト
   ```

2. **TestFlight配信**
   ```bash
   eas build --platform ios
   eas submit -p ios --latest
   ```

3. **本番デプロイ前チェックリスト**
   - [ ] すべての単体テストが通過
   - [ ] TestFlightで動作確認
   - [ ] セキュリティ脆弱性: 0件
   - [ ] ビルド成功

---

## 📈 進捗トラッキング

### GitHub Projects

プロジェクトボードを作成して進捗管理:

1. **To Do**
   - クライアント側入力検証
   - 環境変数化
   - HTMLサニタイゼーション

2. **In Progress**
   - (現在の作業)

3. **Done**
   - node-forge脆弱性修正 ✅
   - GitHub Actions設定 ✅
   - セキュリティ監査レポート作成 ✅

---

## 💡 Tips

### 効率的な実装順序

1. **依存関係のないタスクから**
   - 入力検証、サニタイゼーションは独立
   - 並行して実装可能

2. **小さくリリース**
   - 1つの機能ごとにコミット
   - TestFlightで段階的にテスト

3. **自動化を優先**
   - GitHub Actionsで定期実行
   - 手動タスクを最小化

---

## 🆘 問題が発生した場合

### ロールバック手順

```bash
# 直前のコミットに戻す
git reset --hard HEAD~1

# 特定のファイルのみ戻す
git checkout HEAD~1 -- path/to/file.js

# リモートから最新を取得
git pull origin main
```

### サポート

- **GitHub Issues**: バグ報告・質問
- **セキュリティ問題**: security@example.com（緊急）
- **ドキュメント**: このリポジトリの `.md` ファイル

---

**次のアクション**: フェーズ2のタスクから開始してください。すべての必要な情報はこのガイドに記載されています。
