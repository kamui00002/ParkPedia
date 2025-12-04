# 包括的セキュリティ監査レポート

**作成日**: 2025-12-04
**対象アプリ**: ParkPedia
**監査バージョン**: 1.0.7
**監査実施者**: Claude Code Security Audit

---

## エグゼクティブサマリー

このレポートは、ParkPediaアプリケーションの包括的なセキュリティ監査結果をまとめたものです。全6つのカテゴリーで監査を実施し、**1件の高リスク脆弱性**、**5件の中リスク脆弱性**、**4件の低リスク改善項目**を特定しました。

### リスク評価サマリー

| リスクレベル | 件数 | 緊急度 |
|------------|------|--------|
| 🔴 高 (High) | 1 | 即時対応必要 |
| 🟡 中 (Medium) | 5 | 1週間以内 |
| 🟢 低 (Low) | 4 | 1ヶ月以内 |

---

## 1. Firebase Security Rules 監査

### ✅ 良好な点

1. **厳密な認証チェック**
   - すべての書き込み操作で`isAuthenticated()`チェックを実施
   - 所有者検証が適切に実装されている

2. **データ検証の実装**
   - フィールドの型チェック（string, number）
   - 文字数制限（name: 100文字、description: 1000文字など）
   - 範囲チェック（緯度: -90～90、経度: -180～180、rating: 1～5）

3. **不変フィールドの保護**
   - `userId`、`createdAt`、`parkId`などの変更を防止
   - `updatedAt`のサーバータイムスタンプ強制

4. **サブコレクションのセキュリティ**
   - `/users/{userId}/private`は所有者のみアクセス可能
   - `/parks/{parkId}/images`は公園所有者のみ書き込み可能

### ⚠️ 改善推奨事項

#### 🟡 中リスク: Rate Limiting の欠如

**問題**: Firestoreルールにはレート制限がなく、大量のリクエストによる悪用が可能

**推奨対策**:
```javascript
// Firebase Functionsでレート制限を実装
// Cloud Functionsで書き込み前にレート制限チェックを追加
function checkRateLimit(userId, collection) {
  // Redis or Firestore Counterを使用
  // 例: 1時間に10件までの投稿
}
```

**実装優先度**: 中
**実装期限**: 2週間以内

#### 🟢 低リスク: 管理者権限の実装

**問題**: `reports`コレクションの管理機能が未実装

**推奨対策**:
```javascript
// Custom Claimsで管理者権限を追加
function isAdmin() {
  return request.auth.token.admin == true;
}

match /reports/{reportId} {
  allow read: if isAdmin() || resource.data.reportedBy == request.auth.uid;
  allow update, delete: if isAdmin();
}
```

**実装優先度**: 低
**実装期限**: 1ヶ月以内

---

## 2. 認証・認可の脆弱性チェック

### ✅ 良好な点

1. **Firebase Authentication使用**
   - 業界標準の認証システムを使用
   - プラットフォーム別の永続化設定（AsyncStorage for React Native）

2. **認証状態チェック**
   - 各画面で`auth.currentUser`をチェック
   - 未ログイン時の適切なリダイレクト

### ⚠️ 改善推奨事項

#### 🟡 中リスク: セッション管理の強化

**問題**: セッションタイムアウトや強制ログアウト機能がない

**推奨対策**:
1. **自動ログアウトの実装**
```javascript
// 30分間操作がない場合は自動ログアウト
let inactivityTimer;
const TIMEOUT = 30 * 60 * 1000; // 30分

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    auth.signOut();
    Alert.alert('セッションタイムアウト', '再度ログインしてください');
  }, TIMEOUT);
}
```

2. **多重ログイン検知**
   - Firebase Functionsで同一ユーザーの複数セッションを検知
   - 疑わしいログインの通知

**実装優先度**: 中
**実装期限**: 2週間以内

#### 🟢 低リスク: パスワードポリシーの強化

**問題**: Firebase Authenticationのデフォルト設定（6文字以上）を使用

**推奨対策**:
- Firebase Console > Authentication > Settings
  - パスワード最小長: 8文字以上
  - 複雑性要件の追加検討

**実装優先度**: 低
**実装期限**: 1ヶ月以内

---

## 3. データ検証とサニタイゼーション

### ✅ 良好な点

1. **基本的なバリデーション**
   - 必須フィールドのチェック
   - 空文字チェック（`trim()`使用）

### ⚠️ 改善推奨事項

#### 🟡 中リスク: クライアント側の入力検証不足

**問題**: サーバー側（Firestore Rules）のみで検証、クライアント側の検証が不十分

**影響**:
- 無駄なネットワークリクエスト
- ユーザビリティの低下（エラーがサーバーから返るまで待つ）

**推奨対策**:

**AddReviewScreen.js** (screens/AddReviewScreen.js:86-96):
```javascript
const handleSubmit = async () => {
  // 既存の検証
  if (rating === 0) {
    Alert.alert('エラー', '星評価を選択してください');
    return;
  }

  // 追加: コメント長チェック
  if (comment.trim() === '') {
    Alert.alert('エラー', 'コメントを入力してください');
    return;
  }

  // 🔴 追加必要: 文字数上限チェック
  if (comment.length > 1000) {
    Alert.alert('エラー', 'コメントは1000文字以内で入力してください');
    return;
  }

  // 🔴 追加必要: XSSパターンチェック
  const dangerousPatterns = /<script|<iframe|javascript:|onerror=/i;
  if (dangerousPatterns.test(comment)) {
    Alert.alert('エラー', '不正な文字が含まれています');
    return;
  }

  // ... 送信処理
};
```

**AddParkScreen.js**にも同様の検証を追加:
```javascript
// 公園名の検証
if (name.trim().length === 0 || name.length > 100) {
  Alert.alert('エラー', '公園名は1〜100文字で入力してください');
  return;
}

// 住所の検証
if (address.trim().length === 0 || address.length > 300) {
  Alert.alert('エラー', '住所は1〜300文字で入力してください');
  return;
}

// 説明の検証（オプショナル）
if (description && description.length > 1000) {
  Alert.alert('エラー', '説明は1000文字以内で入力してください');
  return;
}
```

**実装優先度**: 中
**実装期限**: 1週間以内

#### 🟡 中リスク: HTMLサニタイゼーションの欠如

**問題**: ユーザー入力をそのまま表示、XSSのリスク

**推奨対策**:
```bash
npm install dompurify
```

```javascript
import DOMPurify from 'dompurify';

// レビュー表示時
const sanitizedComment = DOMPurify.sanitize(review.comment);
```

**実装優先度**: 中
**実装期限**: 1週間以内

---

## 4. 依存パッケージの脆弱性

### 🔴 高リスク: node-forge 脆弱性

**検出結果**:
```json
{
  "name": "node-forge",
  "severity": "high",
  "vulnerabilities": [
    {
      "id": "GHSA-554w-wpv2-vw27",
      "title": "ASN.1 Unbounded Recursion",
      "severity": "high"
    },
    {
      "id": "GHSA-5gfm-wpxj-wjgq",
      "title": "ASN.1 Validator Desynchronization",
      "severity": "high",
      "cvss": 8.6
    },
    {
      "id": "GHSA-65ch-62r8-g69g",
      "title": "ASN.1 OID Integer Truncation",
      "severity": "moderate"
    }
  ],
  "range": "<=1.3.1",
  "fixAvailable": true
}
```

**影響**:
- 悪意のあるASN.1データによるDoS攻撃
- 証明書検証のバイパス

**推奨対策**:
```bash
# 即時実行
npm audit fix --force

# または手動でアップデート
npm update node-forge
```

**実装優先度**: 🔴 最高
**実装期限**: 即時（24時間以内）

### 🟢 低リスク: 定期的な依存関係の更新

**推奨対策**:
1. **月次の脆弱性スキャン**
```bash
npm audit
npm outdated
```

2. **Dependabotの設定**
   - GitHub Settings > Security > Dependabot
   - 自動PR作成を有効化

**実装優先度**: 低
**実装期限**: 1週間以内（設定のみ）

---

## 5. APIキーとシークレットの管理

### ⚠️ 改善推奨事項

#### 🟡 中リスク: Firebase APIキーのハードコード

**問題**: `firebaseConfig.js`にAPIキーが直接記載されている

**現在のコード** (firebaseConfig.js:24-31):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCQlkTZ43bdJ8wsbZm8h4qrIU_mxjCTXUE",
  authDomain: "parkpedia-app.firebaseapp.com",
  projectId: "parkpedia-app",
  storageBucket: "parkpedia-app.firebasestorage.app",
  messagingSenderId: "118041891633",
  appId: "1:118041891633:ios:25c857a6e7d53dd7d51610"
};
```

**注意**: Firebase Web APIキーは公開されることを前提としていますが、ベストプラクティスとして環境変数を使用すべきです。

**推奨対策**:

1. **環境変数の設定**
```bash
# .env.local を作成（.gitignoreに追加）
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCQlkTZ43bdJ8wsbZm8h4qrIU_mxjCTXUE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=parkpedia-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=parkpedia-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=parkpedia-app.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=118041891633
EXPO_PUBLIC_FIREBASE_APP_ID=1:118041891633:ios:25c857a6e7d53dd7d51610
```

2. **firebaseConfig.jsの更新**
```javascript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};
```

3. **Firebase Consoleでのセキュリティ強化**
   - API制限の設定
   - 許可されたドメインの設定
   - Firebase App Checkの有効化

**実装優先度**: 中
**実装期限**: 1週間以内

#### 🟢 低リスク: AdMob Publisher IDの管理

**問題**: `app-ads.txt`がGitHub Pagesで公開されている（正常）

**推奨対策**:
- AdMob Consoleでアプリの認証状況を定期確認
- 不正使用の監視

**実装優先度**: 低
**実装期限**: 月次確認

---

## 6. XSS・インジェクション攻撃対策

### ✅ 良好な点

1. **React Nativeの自動エスケープ**
   - `<Text>`コンポーネントがデフォルトでエスケープ

2. **Firestore使用**
   - NoSQLのため従来のSQLインジェクションのリスクなし

### ⚠️ 改善推奨事項

#### 🟢 低リスク: WebViewのセキュリティ強化

**問題**: `react-native-webview`を使用（TermsOfServiceScreenなど）

**推奨対策**:
```javascript
<WebView
  source={{ uri: 'https://example.com' }}
  // セキュリティ設定を追加
  javaScriptEnabled={false}  // 必要な場合のみtrue
  domStorageEnabled={false}
  startInLoadingState={true}
  scalesPageToFit={true}
  // サードパーティCookieをブロック
  thirdPartyCookiesEnabled={false}
  // HTTPSのみ許可
  originWhitelist={['https://*']}
/>
```

**実装優先度**: 低
**実装期限**: 1ヶ月以内

---

## 優先度別アクションプラン

### 🔴 即時対応（24時間以内）

1. **node-forge脆弱性の修正**
   ```bash
   npm audit fix --force
   git add package.json package-lock.json
   git commit -m "fix: Update node-forge to resolve high severity vulnerabilities"
   git push
   ```

### 🟡 短期対応（1週間以内）

1. **クライアント側入力検証の強化**
   - AddReviewScreen.jsの検証追加
   - AddParkScreen.jsの検証追加

2. **Firebase APIキーの環境変数化**
   - .envファイル作成
   - firebaseConfig.js更新
   - .gitignore更新

3. **HTMLサニタイゼーションの実装**
   - dompurifyのインストールと設定

### 🟡 中期対応（2週間以内）

1. **セッション管理の強化**
   - 自動ログアウトの実装
   - 多重ログイン検知

2. **Dependabotの設定**
   - GitHub設定

### 🟢 長期対応（1ヶ月以内）

1. **管理者機能の実装**
   - Custom Claims設定
   - 管理画面の開発

2. **WebViewセキュリティ強化**
3. **パスワードポリシー更新**

---

## 継続的なセキュリティ対策

### 日次タスク
- ❌ 不要（自動化推奨）

### 週次タスク
- Firebase Consoleでの異常アクティビティ確認
- エラーログの確認

### 月次タスク
- 依存パッケージの脆弱性スキャン（`npm audit`）
- Firebase Security Rulesの見直し
- アクセスログの分析

### 四半期タスク
- セキュリティ監査の実施
- ペネトレーションテスト（可能であれば）

---

## まとめ

ParkPediaアプリケーションは、基本的なセキュリティ対策が実装されていますが、いくつかの重要な改善項目があります。特に、**node-forge脆弱性の即時修正**と**クライアント側入力検証の強化**を優先的に実施することを強く推奨します。

このレポートの対策を実施することで、アプリケーションのセキュリティレベルを大幅に向上させることができます。

---

**次のアクション**: `OPERATIONS_AUTOMATION_PLAN.md`を参照して、運用自動化の実装を開始してください。
