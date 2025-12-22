# Firebase App Check セットアップガイド

## 概要

Firebase App Check は、アプリケーションからのリクエストが正規のものであることを検証するセキュリティ機能です。
不正なクライアントやボットからのアクセスを防ぎ、Firebase リソース（Firestore、Storage、Functions など）を保護します。

## 実装状況

ParkPedia には以下の App Check 設定が実装されています：

- **開発環境**: Debug Provider（デバッグトークンを使用）
- **本番環境（iOS）**: DeviceCheck / App Attest
- **本番環境（Android）**: Play Integrity API

## セットアップ手順

### 1. Firebase Console での基本設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. ParkPedia プロジェクトを選択
3. 左メニューから「App Check」を選択
4. 「始める」ボタンをクリック

### 2. iOS アプリの設定（DeviceCheck / App Attest）

#### 2.1 App Attest の有効化（推奨）

1. App Check ページで iOS アプリを選択
2. 「App Attest」を選択
3. 「登録」ボタンをクリック
4. 「有効にする」をクリック

**注意点**：
- App Attest は iOS 14 以降で利用可能
- iOS 13 以下のデバイスでは自動的に DeviceCheck にフォールバック
- Apple Developer アカウントが必要

#### 2.2 DeviceCheck のフォールバック

App Attest が利用できない環境（iOS 13 以下）では、自動的に DeviceCheck が使用されます。
追加の設定は不要です。

### 3. Android アプリの設定（Play Integrity API）

#### 3.1 Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. ParkPedia のプロジェクトを選択
3. 「API とサービス」→「ライブラリ」に移動
4. 「Play Integrity API」を検索
5. 「有効にする」をクリック

#### 3.2 Firebase Console での登録

1. Firebase Console の App Check ページに戻る
2. Android アプリを選択
3. 「Play Integrity」を選択
4. 「登録」ボタンをクリック
5. 「有効にする」をクリック

**注意点**：
- Google Play Console にアプリが登録されている必要があります
- 内部テストトラックでも動作します

### 4. デバッグトークンの設定（開発環境）

開発中は実デバイス/シミュレータでテストするために、デバッグトークンを登録する必要があります。

#### 4.1 デバッグトークンの取得

##### iOS の場合

1. アプリを開発モードでビルド・実行
   ```bash
   npx expo run:ios
   ```

2. Xcode のコンソールまたはターミナルに以下のようなログが表示されます：
   ```
   [Firebase/AppCheck][I-FAC001001] App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

3. このトークンをコピー

##### Android の場合

1. アプリを開発モードでビルド・実行
   ```bash
   npx expo run:android
   ```

2. Logcat に以下のようなログが表示されます：
   ```
   D/FirebaseAppCheck: App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

3. このトークンをコピー

**ヒント**：ログが見つからない場合は、以下のコマンドでフィルタリングできます：

```bash
# iOS（Xcode以外でログを確認する場合）
npx react-native log-ios | grep "App Check debug token"

# Android
adb logcat | grep "App Check debug token"
```

#### 4.2 Firebase Console への登録

1. Firebase Console の「App Check」ページに移動
2. 対象のアプリ（iOS または Android）を選択
3. 「デバッグトークン」タブをクリック
4. 「トークンを追加」をクリック
5. 取得したトークンを貼り付け
6. わかりやすい名前を付ける（例：「yoshidoのMacBook」「テストデバイスPixel7」）
7. 「保存」をクリック

**重要**：
- デバッグトークンは開発者ごと、デバイスごとに異なります
- チームメンバーそれぞれが自分のデバイスのトークンを登録する必要があります
- デバッグトークンは定期的にローテーションすることを推奨

### 5. Firebase サービスでの App Check 適用

App Check を有効にしただけでは保護されません。各 Firebase サービスで明示的に適用する必要があります。

#### 5.1 Firestore での適用

1. Firebase Console で「Firestore Database」を選択
2. 「ルール」タブを開く
3. App Check を適用したいルールに以下を追加：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // App Check を要求する例
    match /parks/{parkId} {
      allow read: if request.auth != null && request.resource.data.isApproved == true;
      allow create: if request.auth != null
                    && request.time < timestamp.date(2025, 1, 1) // App Check移行期間
                    || request.app.check.isValid(); // App Check適用後
    }

    // より厳密な例（App Check必須）
    match /sensitiveData/{document} {
      allow read, write: if request.auth != null && request.app.check.isValid();
    }
  }
}
```

4. 「公開」をクリック

**推奨アプローチ**：
- 段階的に導入（最初は `|| request.app.check.isValid()` でオプショナル）
- 十分なテスト後に `&& request.app.check.isValid()` で必須化

#### 5.2 Storage での適用

1. Firebase Console で「Storage」を選択
2. 「ルール」タブを開く
3. App Check を適用：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /parks/{parkId}/{allPaths=**} {
      allow read: if request.auth != null && request.app.check.isValid();
      allow write: if request.auth != null && request.app.check.isValid();
    }
  }
}
```

4. 「公開」をクリック

#### 5.3 Realtime Database での適用（使用している場合）

```json
{
  "rules": {
    ".read": "auth != null && appCheck.token.valid == true",
    ".write": "auth != null && appCheck.token.valid == true"
  }
}
```

#### 5.4 Cloud Functions での適用（使用している場合）

Functions の実装で以下のように App Check を検証：

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.myFunction = functions.https.onCall(async (data, context) => {
  // App Check検証
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called from an App Check verified app.'
    );
  }

  // 処理を続行
  // ...
});
```

### 6. エンフォースメントの設定

App Check には2つのモードがあります：

#### 6.1 監視モード（Monitoring Mode）- 推奨初期設定

- App Check トークンがない/無効なリクエストも許可
- メトリクスのみ収集（Firebase Console で確認可能）
- 本番環境への影響なくテスト可能

**設定方法**：
1. Firebase Console の「App Check」ページ
2. 「APIs」タブを選択
3. 各サービス（Firestore、Storage など）で「監視モード」を選択

#### 6.2 エンフォースモード（Enforcement Mode）

- App Check トークンがない/無効なリクエストを拒否
- 本番環境での完全な保護

**設定方法**：
1. 監視モードで十分なデータを収集（1〜2週間推奨）
2. 正当なリクエストがすべてトークンを持っていることを確認
3. 「エンフォースモード」に切り替え

**注意**：
- エンフォースモードに切り替える前に、必ず監視モードでテストしてください
- 古いバージョンのアプリを使用しているユーザーがいる場合、そのユーザーはアクセスできなくなります

## トラブルシューティング

### アプリが「App Check token is invalid」エラーで失敗する

**原因と解決策**：

1. **開発環境でデバッグトークンが未登録**
   - 上記の「4. デバッグトークンの設定」を実行
   - デバイスを変更した場合は新しいトークンを取得・登録

2. **本番環境で App Attest / Play Integrity が未設定**
   - 上記の「2. iOS アプリの設定」または「3. Android アプリの設定」を実行
   - ビルド番号が Firebase Console に登録されているか確認

3. **Firebase Console でエンフォースモードが有効**
   - 初期は「監視モード」に設定
   - テスト完了後のみエンフォースモードに切り替え

### iOS で「App Attest is not available」エラー

**原因**：
- iOS 13 以下のデバイス
- シミュレータ（App Attest は実機のみ対応）

**解決策**：
- 自動的に DeviceCheck にフォールバックします（追加設定不要）
- 実機でテストする場合は App Attest が使用されます

### Android で「Play Integrity API is not available」エラー

**原因**：
- Google Play Console にアプリが未登録
- Play Integrity API が未有効化
- 署名証明書の不一致

**解決策**：
1. Google Cloud Console で Play Integrity API を有効化
2. Google Play Console でアプリを登録（内部テストトラックでも可）
3. 署名証明書のSHA-256フィンガープリントが Firebase Console に正しく登録されているか確認

### デバッグトークンがログに表示されない

**解決策**：

1. **App.js の初期化コードを確認**
   ```javascript
   // このコードが存在するか確認
   if (__DEV__) {
     appCheck().initializeAppCheck({
       provider: 'debug',
       isTokenAutoRefreshEnabled: true,
     });
   }
   ```

2. **ネイティブビルドを再実行**
   ```bash
   # iOS
   npx expo run:ios --no-build-cache

   # Android
   npx expo run:android --no-build-cache
   ```

3. **ログレベルを確認**
   - Xcode のコンソールで "App Check" でフィルタ
   - Android Studio の Logcat で "FirebaseAppCheck" でフィルタ

## ベストプラクティス

### 1. 段階的なロールアウト

```
Phase 1: App Check実装 + 監視モード（1-2週間）
↓
Phase 2: データ分析・問題修正
↓
Phase 3: エンフォースモード有効化（一部のAPIのみ）
↓
Phase 4: 全APIでエンフォースモード
```

### 2. デバッグトークンの管理

- チーム共有のドキュメントにトークン管理表を作成
- 定期的にトークンをローテーション（3〜6ヶ月ごと）
- 退職者のトークンは即座に削除

### 3. モニタリング

Firebase Console の App Check ダッシュボードで以下を定期確認：

- **成功率**: 90%以上を維持
- **エラー率**: 急増がないか監視
- **カバレッジ**: 全デバイス・OSバージョンで動作しているか

### 4. セキュリティルールとの組み合わせ

App Check は **認証の代替ではありません**。必ず Firebase Authentication と組み合わせて使用してください。

```javascript
// 良い例：認証 + App Check
allow write: if request.auth != null && request.app.check.isValid();

// 悪い例：App Check のみ（不十分）
allow write: if request.app.check.isValid();
```

### 5. バージョン管理

- App Check を有効化する前に、すべてのアクティブユーザーが最新版を使用していることを確認
- 古いバージョンのサポート終了計画を立てる

## 参考資料

- [Firebase App Check 公式ドキュメント](https://firebase.google.com/docs/app-check)
- [React Native Firebase - App Check](https://rnfirebase.io/app-check/usage)
- [App Attest とは（Apple Developer）](https://developer.apple.com/documentation/devicecheck/establishing_your_app_s_integrity)
- [Play Integrity API（Google）](https://developer.android.com/google/play/integrity)

## よくある質問（FAQ）

### Q1: App Check を有効にすると、既存のユーザーに影響はありますか？

A: 監視モードでは影響ありません。エンフォースモードに切り替えた場合、App Check 非対応の古いバージョンのアプリはアクセスできなくなります。

### Q2: Web アプリでも App Check は必要ですか？

A: ParkPedia は現在 iOS/Android のみですが、Web版を追加する場合は reCAPTCHA Enterprise を使用します。

### Q3: App Check のトークンはどのくらいの頻度で更新されますか？

A: デフォルトでは1時間ごとに自動更新されます（`isTokenAutoRefreshEnabled: true` の場合）。

### Q4: コストはかかりますか？

A:
- **DeviceCheck（iOS）**: 無料
- **App Attest（iOS）**: 無料
- **Play Integrity API（Android）**: 無料（基本）、一定数を超えると課金
- **reCAPTCHA Enterprise（Web）**: 一定数を超えると課金

詳細は [Firebase 料金ページ](https://firebase.google.com/pricing) を参照。

### Q5: テストフライト / 内部テストでも動作しますか？

A: はい、ただしデバッグトークンではなく、本番用のプロバイダー（DeviceCheck / Play Integrity）を使用します。

## 次のステップ

1. ✅ **このガイドを完了したら**
   - [ ] Firebase Console で監視モードを有効化
   - [ ] 1週間メトリクスを確認
   - [ ] 問題がなければエンフォースモードに切り替え

2. ✅ **セキュリティルールの見直し**
   - [ ] `firestore.rules` に App Check を追加
   - [ ] `storage.rules` に App Check を追加
   - [ ] テストを実施

3. ✅ **チーム共有**
   - [ ] 開発者全員にこのガイドを共有
   - [ ] デバッグトークンを各自登録してもらう

---

**最終更新**: 2025-12-19
**担当者**: ParkPedia開発チーム
