# Firebase Crashlytics ビルド & テストガイド

このドキュメントは、Crashlytics統合後のビルドとテスト手順を説明します。

## 前提条件

- Firebase Consoleでプロジェクトが設定済み
- GoogleService-Info.plist (iOS) がプロジェクトルートに配置済み
- google-services.json (Android) がプロジェクトルートに配置済み（推奨）
- EAS CLIがインストール済み: `npm install -g eas-cli`

## ビルド前の準備

### 1. 依存関係の確認

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
npm install
```

インストールされるCrashlyticsパッケージ:
- @react-native-firebase/app@^23.7.0
- @react-native-firebase/crashlytics@^23.7.0

### 2. Expoプロジェクトの確認

```bash
# Expo CLIが最新か確認
npx expo --version

# プロジェクトの整合性チェック
npx expo doctor
```

## 開発ビルド（ローカル）

### iOS シミュレーター

```bash
# 開発サーバー起動
npx expo start

# 別のターミナルでiOSビルド
npx expo run:ios

# または特定のデバイスで実行
npm run ios:iphone17pro
npm run ios:ipadair11
```

### Android エミュレーター

```bash
# 開発サーバー起動
npx expo start

# 別のターミナルでAndroidビルド
npx expo run:android
```

## プロダクションビルド（EAS Build）

### 初回セットアップ

EAS Buildの設定ファイル（eas.json）を確認:

```bash
# EASプロジェクトの初期化（未設定の場合）
eas build:configure
```

### iOS プロダクションビルド

```bash
# TestFlight用ビルド
eas build --platform ios --profile production

# ビルド完了後、EASダッシュボードからIPAをダウンロード可能
# または App Store Connect へ自動送信
```

### Android プロダクションビルド

```bash
# Google Play用ビルド
eas build --platform android --profile production

# ビルド完了後、EASダッシュボードからAABをダウンロード可能
```

### 両プラットフォーム同時ビルド

```bash
eas build --platform all --profile production
```

## ビルド後の確認事項

### 1. ログの確認

ビルドログで以下を確認:

```
✓ Firebase Crashlytics plugin configured
✓ @react-native-firebase/app installed
✓ @react-native-firebase/crashlytics installed
```

### 2. アプリの起動確認

アプリを起動して、ログに以下が表示されることを確認:

```
LOG  AdMob初期化成功
LOG  Crashlytics初期化成功
```

### 3. Firebase Consoleの確認

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. ParkPediaプロジェクトを選択
3. 左メニュー「Crashlytics」をクリック
4. 初回アクセス時は「開始する」をクリック

## テスト手順

### 方法1: 管理画面でのテスト（推奨）

1. **アプリを起動**
2. **管理者としてログイン**
   - 管理者権限のあるアカウントでログイン
3. **管理画面に移動**
   - マイページから「管理者ページ」をタップ
4. **開発者向けツールを使用**
   - 「テストエラー」ボタン: 非致命的エラーを送信（アプリは継続）
   - 「テストクラッシュ」ボタン: 強制クラッシュを発生（アプリ終了）

> 注意: 開発者向けツールは開発環境（__DEV__）でのみ表示されます。

### 方法2: コードでのテスト

任意の画面で以下のコードを追加してテスト:

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// テストエラーの送信
const testError = () => {
  crashlytics().log('テストエラーを送信');
  crashlytics().recordError(new Error('これはテストエラーです'));
};

// テストクラッシュの発生
const testCrash = () => {
  crashlytics().crash();
};
```

### 方法3: 意図的なエラーの発生

```javascript
// 存在しない変数を参照
const triggerError = () => {
  console.log(nonExistentVariable);
};

// undefinedのメソッド呼び出し
const triggerCrash = () => {
  const obj = null;
  obj.method();
};
```

## Crashlytics レポートの確認

### 1. Firebase Consoleでの確認

1. Firebase Console > Crashlytics > ダッシュボード
2. 「Issues」タブでエラー・クラッシュ一覧を確認
3. 個別のレポートをクリックして詳細を表示

**初回レポートの注意点:**
- 最初のクラッシュレポートが表示されるまで15-20分かかる場合があります
- 開発ビルドでもレポートは送信されますが、本番ビルドを推奨します

### 2. レポートに含まれる情報

- **スタックトレース**: エラー発生箇所
- **デバイス情報**: OS、モデル、メモリなど
- **ユーザー情報**: Firebase Auth UID、メールアドレス
- **カスタムログ**: アプリ内で記録したログ
- **カスタム属性**: 設定したユーザー属性

## トラブルシューティング

### レポートが表示されない

#### チェックリスト:

1. **Firebase Consoleの設定**
   ```
   - Crashlyticsが有効化されている
   - アプリが正しく登録されている
   - GoogleServiceファイルが最新
   ```

2. **アプリのログ確認**
   ```bash
   # iOSログ
   npx react-native log-ios

   # Androidログ
   npx react-native log-android
   ```

   「Crashlytics初期化成功」が表示されることを確認

3. **時間を待つ**
   - 初回は最大30分待機
   - 複数回クラッシュを発生させる

4. **ネットワーク接続**
   - インターネットに接続されているか確認
   - ファイアウォール・VPNの影響を確認

### ビルドエラー

#### iOS ビルドエラー

```bash
# キャッシュクリア
npx expo start --clear

# Podの再インストール（ローカルビルドの場合）
cd ios
pod deintegrate
pod install
cd ..
```

#### Android ビルドエラー

```bash
# キャッシュクリア
npx expo start --clear

# Gradleキャッシュのクリア（ローカルビルドの場合）
cd android
./gradlew clean
cd ..
```

#### Node モジュールのクリーンインストール

```bash
rm -rf node_modules package-lock.json
npm install
```

### 開発中にCrashlyticsを無効化

App.jsの以下のコメントを外す:

```javascript
// 開発環境ではCrashlyticsを無効化（オプション）
crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
```

## 本番リリース前のチェックリスト

- [ ] Firebase Consoleでテストレポートが確認できる
- [ ] iOS/Android両方でテスト済み
- [ ] Error Boundaryが正しく動作する
- [ ] ユーザーIDが正しく設定される
- [ ] カスタムログが記録される
- [ ] プライバシーポリシーにクラッシュレポート収集を明記
- [ ] App Store / Google Playのプライバシー申告を更新

## 本番環境での監視

### 推奨アクション

1. **定期的なチェック**: 週1回はCrashlyticsダッシュボードを確認
2. **アラート設定**: 重大なクラッシュ発生時にメール通知を設定
3. **目標設定**: クラッシュフリーユーザー率 99%以上を維持
4. **迅速な対応**: 新しいクラッシュが報告されたら優先的に修正

### Firebase Consoleでのアラート設定

1. Firebase Console > Crashlytics > ⚙️設定
2. 「Email notifications」を有効化
3. 通知条件を設定

## 次のステップ

Crashlyticsが正常に動作したら:

1. **パフォーマンスモニタリング**の追加を検討
   ```bash
   npm install @react-native-firebase/perf
   ```

2. **Analytics**との連携でより詳細な分析
   ```bash
   npm install @react-native-firebase/analytics
   ```

3. **Remote Config**で動的な設定変更
   ```bash
   npm install @react-native-firebase/remote-config
   ```

## 参考リソース

- [CRASHLYTICS_SETUP.md](./CRASHLYTICS_SETUP.md) - 詳細なセットアップガイド
- [Firebase Crashlytics公式ドキュメント](https://firebase.google.com/docs/crashlytics)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Firebase統合ガイド](https://docs.expo.dev/guides/using-firebase/)

## サポート

問題が発生した場合:

1. このドキュメントのトラブルシューティングを確認
2. CRASHLYTICS_SETUP.mdの詳細ガイドを参照
3. Firebase Consoleのエラーメッセージを確認
4. 開発チームに問い合わせ

---

**バージョン情報**
- アプリバージョン: v1.0.24
- iOS buildNumber: 30
- Android versionCode: 23
- 最終更新: 2025年（Crashlytics導入時）
