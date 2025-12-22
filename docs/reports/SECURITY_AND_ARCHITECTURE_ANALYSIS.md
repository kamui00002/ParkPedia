# ParkPedia セキュリティ & アーキテクチャ総合分析レポート

**分析日**: 2025年12月18日
**対象バージョン**: v1.0.26 (iOS buildNumber: 32, Android versionCode: 24)
**分析担当**: Claude Code Explore Agents (並行実行)

---

## エグゼクティブサマリー

ParkPediaは、公園情報共有を目的としたReact Native + Expo + Firebaseアプリケーションです。本分析では、**セキュリティ脆弱性**と**アーキテクチャの課題**を包括的に評価しました。

### 主要な発見

#### ✅ 強み
- **Firestore/Storageセキュリティルールが堅牢**で、適切な権限管理が実装済み
- **App Store審査要件を満たす機能**（アカウント削除、報告、ブロック機能）が実装済み
- **充実したドキュメント**と開発ナレッジベースが整備されている
- **Firebase Crashlytics統合**によるエラー監視体制がある

#### ❌ 重大な課題
- **CRITICAL**: 機密情報（APIキー、秘密鍵）がGit履歴に残存（削除済みだが履歴が危険）
- **HIGH**: 自動テストが完全に欠落（ユニット/統合/E2E）
- **MEDIUM**: Firebase設定がハードコードされており、環境変数で管理されていない
- **MEDIUM**: TypeScriptがほとんど活用されておらず、型安全性が低い

---

## 1. セキュリティ脆弱性分析

### 🚨 CRITICAL（即時対応必須）

#### 1.1 Firebase APIキーのハードコード
- **場所**: `firebaseConfig.js`
- **リスク**: APIキーが公開リポジトリにコミット済み
- **影響**: Firebase プロジェクトへの不正アクセスの可能性（制限付き）
- **対策**:
  ```javascript
  // 環境変数に移行
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ...
  };
  ```
  - Firebase Console でAPIキー制限を設定（ドメイン、アプリID）
  - `.env`ファイルを使用し、`.gitignore`に追加

#### 1.2 serviceAccountKey.json のGit履歴残存
- **場所**: リポジトリルート（削除済みだが履歴に残存）
- **リスク**: 秘密鍵が漏洩済み
- **影響**: Firebase Admin権限での不正操作（データベース全体の読み書き削除）
- **対策**:
  1. **秘密鍵のローテーション**（Firebase Console → プロジェクト設定 → サービスアカウント）
  2. Git履歴から完全削除（`git filter-repo` または `BFG Repo-Cleaner`使用）
  3. 新しい秘密鍵を安全に管理（GitHub Secrets、EAS Secrets）

#### 1.3 credentials.json のGit履歴残存
- **場所**: リポジトリルート（削除済みだが履歴に残存）
- **リスク**: iOS証明書/プロビジョニングプロファイルが漏洩済み
- **影響**: 不正なアプリへの署名、なりすまし
- **対策**:
  1. iOS Distribution Certificate の再発行（Apple Developer Account）
  2. Git履歴から完全削除
  3. 新しい証明書を安全に管理（Fastlane Match、EAS）

### ⚠️ HIGH（1週間以内）

#### 1.4 Firestoreセキュリティルールの列挙脆弱性
- **場所**: `firestore.rules` - `reports`、`favorites`、`blockedUsers`コレクション
- **リスク**: 全ユーザーの報告リスト、お気に入り、ブロックリストが列挙可能
- **影響**: プライバシー侵害、ユーザー行動分析
- **対策**:
  ```javascript
  // 修正前
  match /reports/{reportId} {
    allow list: if request.auth != null;
  }

  // 修正後
  match /reports/{reportId} {
    allow list: if request.auth != null
                && request.query.limit <= 100
                && 'userId' in request.query.orderBy;
  }
  ```

#### 1.5 管理者権限チェックの遅延
- **場所**: `firestore.rules` - 各コレクションの`isAdmin()`関数
- **リスク**: Firestoreクエリのたびに`admins`コレクションを読み取る（パフォーマンス低下）
- **影響**: 大量のリクエストによるコスト増加、DDoS脆弱性
- **対策**: Firebase Authentication Custom Claims を使用
  ```javascript
  // Admin SDK でカスタムクレーム設定
  admin.auth().setCustomUserClaims(uid, { admin: true });

  // Rules で直接チェック
  function isAdmin() {
    return request.auth.token.admin == true;
  }
  ```

### ⚠️ MEDIUM（2週間以内）

#### 1.6 弱いパスワードポリシー
- **場所**: `screens/LoginScreen.js`
- **リスク**: 短いパスワード（6文字以上）、複雑さ要件なし
- **影響**: ブルートフォース攻撃、辞書攻撃の成功率上昇
- **対策**:
  ```javascript
  // 最小12文字、大文字・小文字・数字・記号を含む
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  ```

#### 1.7 コメント長制限なし
- **場所**: `screens/AddReviewScreen.js`
- **リスク**: 極端に長いコメント投稿によるメモリ消費、DoS攻撃
- **影響**: アプリクラッシュ、Firestoreコスト増加
- **対策**:
  ```javascript
  const MAX_COMMENT_LENGTH = 1000;
  if (comment.trim().length > MAX_COMMENT_LENGTH) {
    Alert.alert('エラー', `コメントは ${MAX_COMMENT_LENGTH} 文字以内です`);
    return;
  }
  ```

#### 1.8 メール列挙攻撃
- **場所**: `screens/LoginScreen.js`
- **リスク**: エラーコード（`auth/user-not-found`）がユーザーに表示される
- **影響**: 有効なメールアドレスの発見に利用可能
- **対策**:
  ```javascript
  // 汎用エラーメッセージを表示
  Alert.alert('エラー', 'ログインに失敗しました。もう一度お試しください。');
  // 開発環境のみ詳細表示
  if (__DEV__) {
    console.error('ログインエラー:', error.code);
  }
  ```

#### 1.9 個人情報のCrashlytics送信
- **場所**: `App.js` - Crashlytics初期化
- **リスク**: UID（個人識別情報）がCrashlyticsに送信される
- **影響**: GDPR等の規制違反の可能性
- **対策**:
  ```javascript
  // ハッシュ化して送信
  import { sha256 } from 'js-sha256';
  crashlytics().setUserId(sha256(currentUser.uid));
  ```

### ℹ️ LOW（監視・将来対応）

#### 1.10 AdMobユニットIDの公開
- **場所**: `adConfig.js`
- **リスク**: クリック詐欺の対象になる可能性（低）
- **対策**: Google AdMobの不正クリック検出機能に依存（現状維持可）

#### 1.11 ログ出力に機密情報
- **場所**: 複数ファイル（`__DEV__`チェック付き）
- **リスク**: 開発環境のみだが、ビルドに含まれる可能性
- **対策**: 本番ビルドで`console.*`を完全に削除（Babel設定）

---

## 2. アーキテクチャ分析

### 2.1 コードアーキテクチャ

#### ディレクトリ構造
```
ParkPedia/
├── screens/          # 画面コンポーネント（10ファイル）
├── components/       # 再利用可能コンポーネント（6ファイル）
├── utils/           # ユーティリティ関数（3ファイル）
├── docs/            # ドキュメント
├── App.js           # エントリーポイント
├── firebaseConfig.js # Firebase設定
├── adConfig.js      # AdMob設定
└── package.json
```

**評価**: ✅ **良好** - シンプルで分かりやすい構造

**改善点**:
- `services/` ディレクトリを作成してAPI呼び出しを集約
- `hooks/` ディレクトリでカスタムフックを管理
- `constants/` ディレクトリで定数を管理

#### コンポーネント設計

**実装状況**:
- ✅ 関数コンポーネント + Hooks
- ✅ ErrorBoundary 実装済み
- ❌ PropTypes または TypeScript型定義が不足
- ❌ コンポーネント単位のテストなし

**課題**:
- **型安全性が低い**（TypeScript導入済みだが未活用）
- **テスタビリティが低い**（ビジネスロジックとUIが密結合）

#### 状態管理

**実装方法**:
- ローカル状態: `useState`
- グローバル状態: Context API（未使用、各画面で個別管理）
- 永続化: AsyncStorage（最近見た公園のみ）
- サーバー状態: Firebase Realtime Listeners

**評価**: ⚠️ **シンプルだが拡張性に課題**

**推奨**:
- 中規模以上なら **React Query** または **Zustand** 導入
- Firebase状態管理の一元化

### 2.2 テスト戦略

#### 現状: ❌ **テストが完全に欠落**

- ユニットテスト: 0個
- 統合テスト: 0個
- E2Eテスト: 0個
- カバレッジ: 0%

#### 推奨実装（優先順）

| 優先度 | テスト種別 | 推奨ツール | 対象 |
|--------|----------|----------|------|
| **高** | ユニットテスト | Jest + React Native Testing Library | utils/, components/ |
| **高** | 統合テスト | Jest + @testing-library/react-native | screens/ |
| **中** | E2Eテスト | Detox または Maestro | 主要ユーザーフロー |
| **中** | ビジュアルリグレッション | Chromatic または Percy | UI コンポーネント |

**実装例**:
```javascript
// utils/__tests__/imageUploader.test.js
import { uploadImage } from '../imageUploader';

describe('uploadImage', () => {
  it('should upload image successfully', async () => {
    const mockUri = 'file:///path/to/image.jpg';
    const result = await uploadImage(mockUri, 'testUserId', 'parks');
    expect(result).toMatch(/^https:\/\/firebasestorage/);
  });
});
```

### 2.3 CI/CDパイプライン

#### 現状: ⚠️ **限定的**

**実装済み**:
- ✅ GitHub Actions: `security-audit.yml`（npm audit、毎週月曜日実行）

**不足**:
- ❌ 自動ビルド（EAS Build）
- ❌ 自動テスト実行
- ❌ Lint/Format チェック（ESLint, Prettier）
- ❌ 自動デプロイ（App Store/Google Play）
- ❌ Pull Request チェック

#### 推奨実装

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  eas-build:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
      - run: eas build --platform all --non-interactive
```

### 2.4 監視・ロギング

#### 実装済み
- ✅ **Firebase Crashlytics**: クラッシュレポート、エラー記録
- ✅ **ErrorBoundary**: React エラー捕捉
- ✅ **Console logging**: 開発環境（`__DEV__`チェック付き）

#### 不足
- ❌ **アナリティクス**: Firebase Analytics 未導入
- ❌ **パフォーマンス監視**: Firebase Performance Monitoring 未導入
- ❌ **ユーザー行動追跡**: イベントログなし
- ❌ **リアルタイムエラー通知**: Slack/Discord連携なし

#### 推奨実装
```javascript
// Firebase Analytics 導入
import analytics from '@react-native-firebase/analytics';

// イベント記録
await analytics().logEvent('park_viewed', {
  park_id: parkId,
  park_name: parkName,
});

// スクリーン追跡
await analytics().logScreenView({
  screen_name: 'ParkDetail',
  screen_class: 'ParkDetailScreen',
});
```

### 2.5 パフォーマンス最適化

#### 実装状況

**実装済み**:
- ✅ AsyncStorage キャッシング（最近見た公園）
- ✅ Firebase オフラインキャッシュ（自動）
- ✅ 画像の遅延読み込み（React Native Image 標準）

**不足**:
- ❌ **画像最適化**: 圧縮、リサイズなし（5-10MBまで許可）
- ❌ **コード分割**: React.lazy 未使用
- ❌ **仮想化リスト**: FlatList の最適化不足（全件読み込み）
- ❌ **メモ化**: useMemo/useCallback の使用が限定的（検出: 少数）

#### パフォーマンス課題

| 項目 | 現状 | 推奨 |
|------|------|------|
| 公園リスト読み込み | 全件（無制限） | ページネーション（20件ずつ） |
| 画像サイズ | 最大10MB | 圧縮後500KB以下 |
| レビュー読み込み | 全件 | Lazy loading |
| 検索 | クライアント側フィルタ | Algolia または Firestore複合インデックス |

#### 推奨実装
```javascript
// 画像圧縮（アップロード前）
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }], // 横幅1024pxにリサイズ
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};

// ページネーション
const [lastVisible, setLastVisible] = useState(null);
const parksQuery = query(
  collection(db, 'parks'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
if (lastVisible) {
  parksQuery = query(parksQuery, startAfter(lastVisible));
}
```

---

## 3. 不足している機能・要素

### 3.1 エラーハンドリング

#### 実装済み
- ✅ ErrorBoundary
- ✅ Crashlytics
- ✅ 認証エラー処理
- ✅ Firestore エラー処理

#### 不足
- ❌ **グローバルエラーハンドラ**（API呼び出し全体をカバーしない）
- ❌ **Retry ロジック**（ネットワークエラー時の自動リトライなし）
- ❌ **Circuit Breaker パターン**（連続失敗時のサーキット遮断なし）
- ❌ **エラーレポート**（Crashlytics以外の選択肢なし）

### 3.2 オフライン対応

#### 実装済み
- ✅ AsyncStorage（最近見た公園のみ）
- ✅ Firebase オフラインキャッシュ（自動）

#### 不足
- ❌ **Offline-first アーキテクチャ**
- ❌ **同期キュー**（オフライン中の操作を記録・後で同期）
- ❌ **Offline indicator**（ユーザーへの通知なし）
- ❌ **オフラインモード**（読み取りのみ、書き込み不可）

#### 推奨実装
- React Query + Offline Plugin
- Redux Offline
- WatermelonDB（ローカルデータベース）

### 3.3 多言語対応（i18n）

#### 現状: ❌ **未実装**（日本語のみハードコード）

#### 推奨実装
```javascript
// react-i18next 導入
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en.json') },
      ja: { translation: require('./locales/ja.json') },
    },
    lng: 'ja',
    fallbackLng: 'en',
  });

// 使用例
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('welcome')}</Text>
```

### 3.4 アクセシビリティ

#### 実装済み
- ✅ SafeAreaProvider
- ✅ 読みやすいフォントサイズ（12-20）
- ✅ 基本的な色コントラスト

#### 不足
- ❌ **accessibilityLabel**: 0個（検出されず）
- ❌ **VoiceOver/TalkBack 対応**
- ❌ **テキストスケール対応**（`allowFontScaling`の明示的設定なし）
- ❌ **キーボードナビゲーション**（標準機能のみ）
- ❌ **WCAG 2.1 準拠**（未検証）

#### 推奨実装
```javascript
// アクセシビリティ対応
<TouchableOpacity
  accessible={true}
  accessibilityLabel="公園を検索"
  accessibilityHint="タップして検索画面を開きます"
  accessibilityRole="button"
>
  <Text>検索</Text>
</TouchableOpacity>
```

### 3.5 その他の不足機能

| 機能 | 状態 | 優先度 | 推奨実装 |
|------|------|--------|----------|
| **プッシュ通知** | なし | 中 | Expo Notifications, FCM |
| **リアルタイム更新** | 限定的 | 中 | Firestore onSnapshot 強化 |
| **ペジネーション** | なし | 高 | Firestore Query 改善 |
| **高度な検索** | 簡易的 | 中 | Algolia または Firestore複合インデックス |
| **ソーシャル機能** | 限定的 | 低 | フォロー、シェア機能 |
| **A/B Testing** | なし | 低 | Firebase Remote Config |
| **Payment Integration** | なし | 低 | Stripe, Square |
| **バージョン管理表示** | app.json のみ | 低 | CodePush, Expo Updates |

---

## 4. 実装すべき機能（優先度別）

### 🔴 優先度: CRITICAL（即時対応）

#### C-1. セキュリティ脆弱性の修正
- **期間**: 1週間
- **担当**: バックエンドエンジニア、セキュリティエンジニア
- **内容**:
  1. serviceAccountKey.json のローテーションとGit履歴削除
  2. credentials.json のローテーションとGit履歴削除
  3. Firebase設定の環境変数化
  4. APIキー制限設定（Firebase Console）
  5. Firestoreセキュリティルールの修正（列挙脆弱性）

**実装手順**:
```bash
# 1. Git履歴から機密情報を削除
git filter-repo --path serviceAccountKey.json --invert-paths
git filter-repo --path credentials.json --invert-paths
git push --force

# 2. Firebase秘密鍵のローテーション
# Firebase Console → プロジェクト設定 → サービスアカウント → 新しい秘密鍵を生成

# 3. iOS証明書の再発行
# Apple Developer Account → Certificates → 新しいDistribution Certificateを作成

# 4. 環境変数設定
npm install --save-dev dotenv
# .env ファイル作成
echo "FIREBASE_API_KEY=your-api-key" > .env
echo ".env" >> .gitignore

# 5. EAS Secrets 設定
eas secret:create --scope project --name FIREBASE_API_KEY --value your-api-key
```

### 🔴 優先度: HIGH（1-2週間以内）

#### H-1. 自動テストの導入
- **期間**: 2週間
- **担当**: フロントエンドエンジニア
- **内容**:
  1. Jest + React Native Testing Library のセットアップ
  2. utils/ のユニットテスト作成（カバレッジ80%以上）
  3. components/ のコンポーネントテスト作成
  4. screens/ の統合テスト作成（主要フロー）
  5. CI/CDパイプラインに統合

**実装手順**:
```bash
# 1. 依存関係インストール
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# 2. package.json に追加
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}

# 3. jest.config.js 作成
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
};
```

#### H-2. CI/CDパイプラインの構築
- **期間**: 1週間
- **担当**: DevOpsエンジニア
- **内容**:
  1. GitHub Actions で自動テスト実行
  2. ESLint/Prettier チェック
  3. Pull Request チェック（必須）
  4. EAS Build 自動化（main ブランチへのマージ時）
  5. TestFlight/Internal Testing への自動デプロイ

#### H-3. TypeScript の段階的導入
- **期間**: 3週間（段階的）
- **担当**: フロントエンドエンジニア
- **内容**:
  1. utils/ から段階的に型定義追加
  2. components/ の型定義
  3. screens/ の型定義
  4. strict モード有効化

**実装例**:
```typescript
// utils/imageUploader.ts
export const uploadImage = async (
  uri: string,
  userId: string,
  folder: 'parks' | 'reviews'
): Promise<string> => {
  // 実装
};

// components/AdBanner.tsx
interface AdBannerProps {
  adType: 'banner' | 'interstitial';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ adType, onAdLoaded }) => {
  // 実装
};
```

### 🟡 優先度: MEDIUM（1ヶ月以内）

#### M-1. パフォーマンス最適化
- **期間**: 2週間
- **内容**:
  1. 画像圧縮（アップロード前にリサイズ＋圧縮）
  2. ページネーション実装（公園リスト、レビューリスト）
  3. FlatList 最適化（`getItemLayout`, `removeClippedSubviews`）
  4. useMemo/useCallback の適切な使用

#### M-2. アクセシビリティ対応
- **期間**: 1週間
- **内容**:
  1. 全てのインタラクティブ要素に `accessibilityLabel` 追加
  2. VoiceOver/TalkBack テスト
  3. テキストスケール対応（Dynamic Type）
  4. 色コントラスト検証（WCAG AA準拠）

#### M-3. 多言語対応（i18n）
- **期間**: 2週間
- **内容**:
  1. react-i18next 導入
  2. 日本語翻訳キー抽出
  3. 英語翻訳作成
  4. 言語切り替えUI実装

#### M-4. オフライン対応強化
- **期間**: 2週間
- **内容**:
  1. React Query 導入
  2. オフラインキャッシュ戦略実装
  3. オフラインインジケーター追加
  4. 同期キュー実装（オフライン時の操作を保存）

### 🟢 優先度: LOW（2ヶ月以内）

#### L-1. Firebase Analytics 導入
- **期間**: 3日
- **内容**: ユーザー行動追跡、イベントログ

#### L-2. Firebase Performance Monitoring 導入
- **期間**: 2日
- **内容**: アプリパフォーマンス監視

#### L-3. プッシュ通知機能
- **期間**: 1週間
- **内容**: Expo Notifications または FCM

#### L-4. 高度な検索機能
- **期間**: 1週間
- **内容**: Algolia 導入、全文検索

---

## 5. 実装ロードマップ（3ヶ月計画）

### Week 1-2: セキュリティ緊急対応
- [ ] C-1: セキュリティ脆弱性の修正
- [ ] Git履歴から機密情報削除
- [ ] 秘密鍵ローテーション
- [ ] 環境変数化

### Week 3-4: テスト基盤構築
- [ ] H-1: 自動テストの導入
- [ ] Jest セットアップ
- [ ] ユニットテスト作成（utils/）
- [ ] コンポーネントテスト作成

### Week 5-6: CI/CD構築
- [ ] H-2: CI/CDパイプライン構築
- [ ] GitHub Actions 設定
- [ ] 自動ビルド・デプロイ

### Week 7-9: TypeScript導入
- [ ] H-3: TypeScript 段階的導入
- [ ] utils/ 型定義
- [ ] components/ 型定義
- [ ] screens/ 型定義

### Week 10-11: パフォーマンス最適化
- [ ] M-1: パフォーマンス最適化
- [ ] 画像圧縮
- [ ] ページネーション
- [ ] FlatList 最適化

### Week 12: アクセシビリティ & 多言語
- [ ] M-2: アクセシビリティ対応
- [ ] M-3: 多言語対応（i18n）

---

## 6. 推奨ツール・ライブラリ

### セキュリティ
- **GitGuardian**: シークレットスキャン（GitHub連携）
- **Snyk**: 依存関係脆弱性スキャン
- **dotenv**: 環境変数管理

### テスト
- **Jest**: ユニットテスト
- **React Native Testing Library**: コンポーネントテスト
- **Detox** または **Maestro**: E2Eテスト
- **Chromatic**: ビジュアルリグレッションテスト

### 開発体験
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット
- **Husky**: Git hooks（pre-commit, pre-push）
- **lint-staged**: Staged files のみLint

### パフォーマンス
- **React Query**: サーバー状態管理、キャッシング
- **Zustand** または **Jotai**: グローバル状態管理
- **expo-image-manipulator**: 画像圧縮・リサイズ
- **react-native-fast-image**: 画像キャッシング

### 多言語・アクセシビリティ
- **react-i18next**: 多言語対応
- **@react-native-aria/**: アクセシビリティ支援

### 監視・分析
- **Firebase Analytics**: ユーザー行動分析
- **Firebase Performance Monitoring**: パフォーマンス監視
- **Sentry**: エラー追跡（Crashlyticsの代替）

---

## 7. コスト見積もり

### 開発工数（概算）

| フェーズ | 期間 | 人数 | 工数 |
|---------|------|------|------|
| セキュリティ対応 | 2週間 | 2名 | 20人日 |
| テスト基盤構築 | 2週間 | 2名 | 20人日 |
| CI/CD構築 | 1週間 | 1名 | 5人日 |
| TypeScript導入 | 3週間 | 2名 | 30人日 |
| パフォーマンス最適化 | 2週間 | 2名 | 20人日 |
| アクセシビリティ | 1週間 | 1名 | 5人日 |
| 多言語対応 | 2週間 | 2名 | 20人日 |
| **合計** | **12週間** | - | **120人日** |

### 外部サービスコスト（月額）

| サービス | 用途 | 月額コスト |
|---------|------|----------|
| Firebase Blaze Plan | Backend | $25-50（使用量次第） |
| EAS Build | ビルド自動化 | $0（無料枠内） |
| Algolia（オプション） | 高度な検索 | $1/1000リクエスト |
| Sentry（オプション） | エラー追跡 | $0-26（無料枠内） |
| **合計** | - | **$25-100** |

---

## 8. 結論

ParkPedia は、**基本的な機能は実装されているが、品質保証・保守性・セキュリティの面で重大な課題**を抱えています。

### 即時対応が必要な項目（CRITICAL）
1. **機密情報の完全削除とローテーション**（1週間以内）
2. **環境変数による設定管理**（1週間以内）

### 中期的に対応すべき項目（HIGH）
1. **自動テストの導入**（2週間以内）
2. **CI/CDパイプラインの構築**（1週間以内）
3. **TypeScript の段階的導入**（3週間以内）

### 長期的な改善項目（MEDIUM-LOW）
1. パフォーマンス最適化
2. アクセシビリティ対応
3. 多言語対応
4. オフライン対応強化

---

**次のステップ**: 本レポートを基に、開発チームと優先順位を協議し、実装計画を策定してください。

**作成者**: Claude Code Explore Agents
**レビュー**: 必要に応じてセキュリティエンジニアによるレビュー推奨
