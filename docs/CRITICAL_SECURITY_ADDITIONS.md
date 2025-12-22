# 🚨 ParkPedia - 追加の重要セキュリティ対策

**作成日**: 2025年12月19日
**優先度**: CRITICAL ～ HIGH
**対象**: 既存の改善作業に追加すべき重要な観点

---

## 📋 概要

基本的なセキュリティ対策は完了しましたが、以下の追加対策を実施することで、より堅牢なセキュリティ体制を構築できます。

---

## 🔴 CRITICAL（即時対応 - 追加項目）

### C-7. Git履歴からの完全削除 ⚠️⚠️⚠️

**現状**: `serviceAccountKey.json` と `credentials.json` は削除済みですが、Git履歴には残存している可能性があります。

**リスク**: Git履歴から過去のコミットを遡れば、機密情報にアクセス可能。

**対策**: 履歴から完全に削除する必要があります。

#### 実施手順（所要時間: 30分）

```bash
# 1. 現在の履歴を確認
git log --all --full-history --oneline -- serviceAccountKey.json
git log --all --full-history --oneline -- credentials.json

# もし何か出力された場合は以下を実施：

# 2. git-filter-repo をインストール（推奨）
brew install git-filter-repo
# または
pip install git-filter-repo

# 3. 履歴から完全削除
git filter-repo --path serviceAccountKey.json --invert-paths
git filter-repo --path credentials.json --invert-paths

# 4. 強制プッシュ（⚠️ 慎重に！）
git push origin --force --all
git push origin --force --tags

# 5. チームメンバーに通知（もしいれば）
# 全員に以下を実行してもらう：
# git clone <repository-url> <new-directory>
```

**注意事項**:
- ⚠️ **強制プッシュは危険**: 必ずバックアップを取る
- ⚠️ **チーム開発の場合**: 全員にre-cloneを依頼
- ⚠️ **既存のブランチ/PR**: 全て再作成が必要

**代替手段（BFG Repo-Cleaner）**:
```bash
# BFGのインストール
brew install bfg

# 機密ファイルを削除
bfg --delete-files serviceAccountKey.json
bfg --delete-files credentials.json

# 履歴をクリーンアップ
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 強制プッシュ
git push origin --force --all
```

---

### C-8. 秘密情報スキャンの常設

**目的**: 機密情報の再コミットを防止

#### 8-1. GitHub Secret Scanning + Push Protection

**手順**:
1. GitHub リポジトリ設定を開く
2. **Settings** > **Code security and analysis**
3. **Secret scanning** を有効化
4. **Push protection** を有効化（有料プランで利用可能）

**効果**:
- APIキー、トークン等の自動検出
- プッシュ時にブロック
- GitGuardian等との連携

#### 8-2. gitleaks の導入（ローカル + CI）

**ローカルでの設定**:
```bash
# gitleaks のインストール
brew install gitleaks

# スキャン実行
gitleaks detect --source . --verbose

# Pre-commitフックに追加
echo "gitleaks protect --staged --verbose" >> .husky/pre-commit
chmod +x .husky/pre-commit
```

**CI/CDへの追加**:
`.github/workflows/security.yml` を作成:
```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  gitleaks:
    name: GitLeaks Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**`.gitleaksignore` の作成**:
```
# 誤検知を無視
.env.example
QUICK_START_GUIDE.md
```

---

### C-9. Firebase権限の最小化

**現状**: Firebaseプロジェクトの権限が過剰な可能性があります。

#### 9-1. サービスアカウント/IAMの見直し

**手順**:
1. Firebase Console > **プロジェクト設定** > **サービスアカウント**
2. Google Cloud Console に移動
3. **IAM と管理** > **IAM**
4. 各サービスアカウントの権限を確認

**推奨権限設定**:
```
CI/CD用サービスアカウント:
- Firebase Admin SDK Administrator
- Cloud Datastore User（Firestoreのみ）
- Storage Object Admin（Storageのみ）

管理用サービスアカウント:
- Firebase Admin（最小限の管理者権限）

本番アプリ:
- サービスアカウント不要（クライアントSDK経由）
```

**削除すべき権限**:
- ❌ Owner
- ❌ Editor
- ❌ Viewer（不要な場合）

#### 9-2. サービスアカウントの分離

**推奨構成**:
```
parkpedia-ci@project.iam.gserviceaccount.com
  → CI/CDビルド専用
  → 権限: Firebase Admin SDK Administrator

parkpedia-admin@project.iam.gserviceaccount.com
  → 管理タスク専用（データ移行等）
  → 権限: Firestore/Storage Admin
```

---

### C-10. Firebase App Check導入

**目的**: クライアントアプリの正当性を検証し、不正アクセスを防止

#### 実施手順

**1. Firebase Console での設定**:
```
Firebase Console > プロジェクト設定 > App Check
→ iOS アプリを選択
→ プロバイダ: DeviceCheck（本番）/ Debug（開発）
→ 有効化
```

**2. コードへの統合**:
```bash
# パッケージのインストール
npm install @react-native-firebase/app-check
```

**3. `App.js` に追加**:
```javascript
import appCheck from '@react-native-firebase/app-check';

// App Check の初期化（App起動時）
const initAppCheck = async () => {
  try {
    if (__DEV__) {
      // 開発環境: Debug Token（Firebaseコンソールで取得）
      await appCheck().activate({
        provider: __DEV__ ? 'debug' : 'deviceCheck',
        isTokenAutoRefreshEnabled: true,
      });
    } else {
      // 本番環境: DeviceCheck（iOS）
      await appCheck().activate({
        provider: 'deviceCheck',
        isTokenAutoRefreshEnabled: true,
      });
    }

    if (__DEV__) {
      console.log('✅ App Check有効化完了');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('❌ App Check初期化エラー:', error);
    }
  }
};

// App起動時に実行
useEffect(() => {
  initAppCheck();
}, []);
```

**4. Firebase Console でサービスを保護**:
- Firestore Database: App Check 強制
- Cloud Storage: App Check 強制
- Cloud Functions: App Check 検証追加

**効果**:
- ✅ 正規アプリのみがFirebaseにアクセス可能
- ✅ 不正なクライアントをブロック
- ✅ スクレイピング/クローリング防止

---

### C-11. 関連ルールの穴確認

**Firestoreだけでなく、他のFirebaseサービスも確認が必要**

#### 11-1. Storage Rules の確認

**現在のルールを確認**:
```bash
cat storage.rules
```

**推奨ルール**（`storage.rules`）:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 画像アップロードパス: /images/{folder}/{userId}/{fileName}
    match /images/{folder}/{userId}/{fileName} {
      // 読み取り: 全員可能
      allow read: if true;

      // 書き込み: 認証済みユーザーかつ自分のフォルダのみ
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   // ファイルサイズ制限: 10MB
                   && request.resource.size < 10 * 1024 * 1024
                   // ファイルタイプ制限: 画像のみ
                   && request.resource.contentType.matches('image/.*');
    }

    // その他のパスは全てアクセス禁止
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**デプロイ**:
```bash
# Firebase CLI でデプロイ
firebase deploy --only storage
```

#### 11-2. Cloud Functions の確認（もし使用している場合）

**HTTPエンドポイントの認証**:
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.myFunction = functions.https.onRequest(async (req, res) => {
  // CORS設定
  res.set('Access-Control-Allow-Origin', '*');

  // 認証チェック
  const authToken = req.headers.authorization?.split('Bearer ')[1];
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const uid = decodedToken.uid;

    // 処理...
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

**Callable Functionsの場合**:
```javascript
exports.myCallableFunction = functions.https.onCall(async (data, context) => {
  // 認証チェック（自動）
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = context.auth.uid;

  // 処理...
  return { success: true };
});
```

---

## 🔴 HIGH（1-2週間以内 - 追加項目）

### H-4. プライバシー/データ保護の明文化

**目的**: GDPR、個人情報保護法への対応

#### 実施内容

**1. データ棚卸し**:
```markdown
# 収集データのリスト（PRIVACY_DATA_INVENTORY.md）

## 個人情報
- ユーザーID（Firebase Auth UID）
- メールアドレス（任意）
- 表示名（任意）
- プロフィール画像（任意）

## 位置情報
- 公園登録時の位置情報（緯度経度）
- 検索時の現在地（デバイスに保存、サーバー送信なし）

## 利用データ
- レビュー内容（テキスト、評価）
- お気に入り公園
- 訪問履歴
- 最近見た公園（デバイスローカルのみ）

## 技術データ
- Firebase Crashlytics（匿名化されたクラッシュレポート）
- Firebase Analytics（匿名化された利用統計）
```

**2. 保持期間の定義**:
```markdown
# データ保持期間ポリシー

## アクティブユーザー
- ユーザーデータ: アカウント削除まで保持
- レビュー: アカウント削除後も匿名化して保持
- 位置情報: 公園情報と紐付けて永続保持

## 削除されたアカウント
- ユーザープロフィール: 即時削除
- レビュー: 匿名化（「削除されたユーザー」として表示）
- お気に入り/訪問履歴: 即時削除
- ブロックリスト: 即時削除

## ログ/分析データ
- Crashlytics: 90日間
- Analytics: 14ヶ月間（Firebase標準）
```

**3. アカウント削除機能の強化**:

`screens/MyPageScreen.js` に以下を追加:
```javascript
const deleteAccount = async () => {
  Alert.alert(
    'アカウント削除',
    'アカウントを削除すると、全てのデータが削除されます。この操作は取り消せません。',
    [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除する',
        style: 'destructive',
        onPress: async () => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            // 1. Firestoreのユーザーデータを削除
            await deleteDoc(doc(db, 'users', currentUser.uid));

            // 2. お気に入り/訪問履歴を削除
            const favoritesQuery = query(
              collection(db, 'favorites'),
              where('userId', '==', currentUser.uid)
            );
            const favoritesSnapshot = await getDocs(favoritesQuery);
            const deletePromises = favoritesSnapshot.docs.map(doc =>
              deleteDoc(doc.ref)
            );
            await Promise.all(deletePromises);

            // 3. レビューを匿名化（削除はしない）
            const reviewsQuery = query(
              collection(db, 'reviews'),
              where('userId', '==', currentUser.uid)
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const anonymizePromises = reviewsSnapshot.docs.map(doc =>
              updateDoc(doc.ref, {
                userName: '削除されたユーザー',
                userId: 'deleted-user',
              })
            );
            await Promise.all(anonymizePromises);

            // 4. Firebase Authアカウントを削除
            await currentUser.delete();

            Alert.alert('完了', 'アカウントが削除されました');
            navigation.replace('Login');
          } catch (error) {
            if (__DEV__) {
              console.error('アカウント削除エラー:', error);
            }
            Alert.alert('エラー', 'アカウント削除に失敗しました');
          }
        },
      },
    ]
  );
};
```

**4. プライバシーポリシーの更新**:
`PRIVACY_POLICY.md` に以下を追加:
```markdown
## データの削除
ユーザーはいつでもアカウントを削除できます。削除すると：
- ユーザープロフィール情報は即座に削除されます
- お気に入りや訪問履歴は即座に削除されます
- 投稿したレビューは匿名化され、「削除されたユーザー」として表示されます

## データの保持期間
- アクティブユーザーのデータ: アカウント削除まで
- 削除されたアカウント: 即時削除
- クラッシュレポート: 90日間
- 分析データ: 14ヶ月間
```

---

### H-5. TypeScript強化の具体案

**目的**: 段階的に型安全性を向上させる

#### 5-1. tsconfig.json の段階的strict化

**Phase 1（今すぐ）**:
```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": false,
    "strict": false
  }
}
```

**Phase 2（1週間後）**:
```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strict": false
  }
}
```

**Phase 3（1ヶ月後）**:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

#### 5-2. ESLint 型対応ルールの追加

`.eslintrc.js` に追加:
```javascript
module.exports = {
  extends: [
    '@react-native',
    'prettier',
    'plugin:@typescript-eslint/recommended', // 追加
  ],
  plugins: [
    'prettier',
    '@typescript-eslint', // 追加
  ],
  rules: {
    // 既存ルール...

    // TypeScript固有ルール
    '@typescript-eslint/no-explicit-any': 'error', // any禁止
    '@typescript-eslint/explicit-function-return-type': 'off', // 戻り値型は推論でOK
    '@typescript-eslint/explicit-module-boundary-types': 'off', // export関数も推論でOK
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],

    // anyの増殖を止める
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
  },
};
```

#### 5-3. 既存コードの段階的移行計画

**Week 1-2: utils/ の完全TypeScript化**
```
utils/imageUploader.ts ✅ (完了)
utils/adminUtils.js → utils/adminUtils.ts
utils/dateFormatter.js → utils/dateFormatter.ts
```

**Week 3-4: components/ の完全TypeScript化**
```
components/AdBanner.js → components/AdBanner.tsx
components/ErrorBoundary.js → components/ErrorBoundary.tsx
components/FilterDrawer.js → components/FilterDrawer.tsx
```

**Week 5-8: screens/ の完全TypeScript化**
```
screens/HomeScreen.js → screens/HomeScreen.tsx
screens/ParkDetailScreen.js → screens/ParkDetailScreen.tsx
screens/LoginScreen.js → screens/LoginScreen.tsx
（優先度順に実施）
```

---

## 📊 追加タスクの優先度マトリクス

| タスク | 優先度 | 難易度 | 所要時間 | 実施者 |
|--------|--------|--------|----------|--------|
| C-7. Git履歴削除 | 🔴 CRITICAL | 中 | 30分 | **ユーザー** |
| C-8. gitleaks導入 | 🔴 CRITICAL | 低 | 1時間 | **エージェント** |
| C-9. Firebase権限見直し | 🔴 CRITICAL | 中 | 1時間 | **ユーザー** |
| C-10. App Check導入 | 🔴 CRITICAL | 中 | 2時間 | **エージェント+ユーザー** |
| C-11. ルール穴確認 | 🔴 CRITICAL | 低 | 30分 | **ユーザー** |
| H-4. プライバシー対応 | 🔴 HIGH | 高 | 1週間 | **エージェント+ユーザー** |
| H-5. TypeScript強化 | 🔴 HIGH | 中 | 1ヶ月 | **エージェント** |

---

## 🤖 エージェントで自動実行可能なタスク

以下のタスクはエージェントで自動実行できます：

1. ✅ **gitleaks の設定**
   - `.gitleaksignore` 作成
   - `.github/workflows/security.yml` 作成
   - `.husky/pre-commit` に追加

2. ✅ **App Check の基本設定**
   - パッケージインストール
   - コード追加（`App.js`）

3. ✅ **Storage Rules の改善**
   - `storage.rules` 更新

4. ✅ **TypeScript段階的移行**
   - `tsconfig.json` 更新
   - `.eslintrc.js` 更新
   - utils/の型定義追加

5. ✅ **プライバシー対応コードの追加**
   - アカウント削除機能の実装
   - データ棚卸しドキュメントの作成

---

## 👤 ユーザーが対応すべきタスク

以下はFirebase Console等での手動操作が必要です：

1. **Git履歴の完全削除**（慎重に実施）
2. **Firebase権限の見直し**（IAM設定）
3. **App Check の有効化**（Firebase Console）
4. **Storage Rules のデプロイ**（Firebase Console）
5. **GitHub Secret Scanning の有効化**

---

## 🎯 次のステップ

### 今すぐ実施（CRITICAL）
1. Git履歴から機密情報を完全削除
2. gitleaksを導入（エージェントに依頼可能）
3. Firebase権限を見直し

### 1週間以内（HIGH）
4. App Checkを導入
5. Storage Rulesを改善
6. プライバシー対応を実装

### 1ヶ月以内（MEDIUM）
7. TypeScriptをstrict化
8. 全コードのTypeScript移行

---

**最終更新**: 2025年12月19日
**次回レビュー**: 各タスク完了後
