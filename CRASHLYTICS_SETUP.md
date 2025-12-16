# Firebase Crashlytics セットアップガイド

## 概要

このドキュメントは、ParkPediaアプリにFirebase Crashlyticsを導入する手順とその使用方法を説明します。

Crashlyticsは、アプリのクラッシュやエラーを自動的に収集し、Firebase Consoleで確認できるようにするツールです。これにより、ユーザーが直面している問題を迅速に特定し、修正できます。

## 導入されている機能

### 1. 自動クラッシュレポート収集

- **ネイティブクラッシュ**: iOS/Androidでのクラッシュを自動検出
- **JavaScriptエラー**: Error Boundaryで捕捉されたReactエラーも記録
- **カスタムログ**: 重要なイベントをログとして記録

### 2. Error Boundary

`components/ErrorBoundary.js` により、Reactコンポーネントのエラーをキャッチし、Crashlyticsに送信します。

- エラー発生時にユーザーフレンドリーな画面を表示
- 開発環境ではエラー詳細も表示
- 再読み込みボタンで復旧を試みる

### 3. ユーザー識別

Firebase Authenticationと連携し、クラッシュレポートにユーザーIDとメールアドレスを紐付けています。

### 4. テスト機能（開発者向け）

管理者画面（AdminScreen）に以下のテストボタンを用意しています:

- **テストクラッシュ**: 強制クラッシュを発生させてCrashlyticsの動作確認
- **テストエラー**: 非致命的エラーをCrashlyticsに送信

※ これらのボタンは開発環境（`__DEV__`）でのみ表示されます。

## Firebase Console での設定確認

### 1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. ParkPediaプロジェクトを選択

### 2. Crashlyticsを有効化

1. 左側メニューから「Crashlytics」を選択
2. 初めての場合は「Crashlyticsを開始」ボタンをクリック
3. 設定手順に従って有効化

### 3. Google Service ファイルの確認

#### iOS: GoogleService-Info.plist

ファイル場所:
```
/Users/yoshidometoru/Documents/GitHub/ParkPedia/GoogleService-Info.plist
```

確認事項:
- `GOOGLE_APP_ID` が含まれていること
- app.jsonの `ios.googleServicesFile` が正しく設定されていること

#### Android: google-services.json

**注意**: 現在、プロジェクトにgoogle-services.jsonファイルが見当たりません。

設定方法:
1. Firebase Console > プロジェクト設定 > Androidアプリ
2. 「google-services.json」をダウンロード
3. プロジェクトルートに配置
4. app.jsonにAndroid用の設定を追加（必要に応じて）

```json
"android": {
  "googleServicesFile": "./google-services.json",
  ...
}
```

## ビルド手順

### iOS

```bash
# 開発ビルド
npx expo run:ios

# プロダクションビルド（EAS Build使用）
eas build --platform ios --profile production
```

### Android

```bash
# 開発ビルド
npx expo run:android

# プロダクションビルド（EAS Build使用）
eas build --platform android --profile production
```

### 重要な注意事項

1. **初回ビルド後**: Crashlyticsのデータが表示されるまで、最初のクラッシュ後15-20分ほどかかる場合があります
2. **開発環境**: 開発ビルドでもCrashlyticsは動作しますが、本番環境での確認を推奨します
3. **シンボルファイル**: Expoのマネージドワークフローではシンボルファイルのアップロードは自動的に処理されます

## Crashlyticsの使用方法

### 1. クラッシュレポートの確認

Firebase Console > Crashlytics > ダッシュボード

- **クラッシュ一覧**: 発生したクラッシュの一覧
- **影響を受けたユーザー数**: クラッシュに遭遇したユーザー数
- **スタックトレース**: エラーの詳細な情報

### 2. カスタムログの追加

コード内でCrashlyticsにログを送信する例:

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// カスタムログ
crashlytics().log('ユーザーが公園を追加しました');

// カスタム属性
crashlytics().setAttribute('current_screen', 'ParkDetail');

// ユーザーID設定
crashlytics().setUserId(userId);

// 非致命的エラーの記録
try {
  // 何かの処理
} catch (error) {
  crashlytics().recordError(error);
}
```

### 3. テスト方法

#### 開発環境でのテスト

1. アプリをビルドして実行
2. 管理者としてログイン
3. 管理者画面（Admin）に移動
4. 「開発者向けツール」セクションで「テストクラッシュ」または「テストエラー」を実行

#### 確認手順

1. テストを実行
2. Firebase Console > Crashlytics を開く
3. 15-20分待つ（初回の場合）
4. クラッシュレポートが表示されることを確認

### 4. 本番環境での監視

1. 定期的にFirebase Consoleをチェック
2. 新しいクラッシュが報告された場合は優先的に対応
3. クラッシュフリーユーザー率を99%以上に保つことを目標に

## トラブルシューティング

### クラッシュレポートが表示されない

#### 原因1: Crashlyticsが正しく初期化されていない

確認:
```bash
# iOSログを確認
npx react-native log-ios

# Androidログを確認
npx react-native log-android
```

「Crashlytics初期化成功」のログが表示されることを確認

#### 原因2: Google Serviceファイルが不足

- iOS: `GoogleService-Info.plist` の存在を確認
- Android: `google-services.json` の存在を確認

#### 原因3: Firebase Console側の設定

1. Firebase Console > プロジェクト設定
2. アプリが正しく登録されているか確認
3. Crashlyticsが有効化されているか確認

#### 原因4: 時間がかかっている

初回は最大20-30分かかることがあります。しばらく待ってから再確認してください。

### ビルドエラーが発生する

#### Expo Prebuild エラー

```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules
npm install

# Expo キャッシュをクリア
npx expo start --clear
```

#### iOS ビルドエラー

```bash
# Podをクリーンインストール
cd ios
pod deintegrate
pod install
cd ..
```

#### Android ビルドエラー

```bash
# Gradleキャッシュをクリア
cd android
./gradlew clean
cd ..
```

### 開発環境でCrashlyticsを無効にしたい

`App.js` の以下のコメントを外してください:

```javascript
// 開発環境ではCrashlyticsを無効化（オプション）
crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
```

## プライバシーとデータ収集

### 収集されるデータ

Crashlyticsは以下の情報を収集します:

- クラッシュスタックトレース
- デバイス情報（OS、モデル、メモリなど）
- ユーザーID（Firebase Auth UID）
- ユーザーのメールアドレス（匿名ユーザーの場合は "anonymous"）
- カスタムログとイベント

### プライバシーポリシーへの記載

アプリのプライバシーポリシー（TERMS_OF_SERVICE.md）に以下の内容を追加することを推奨します:

```
## クラッシュレポートの収集

本アプリは、アプリの安定性向上のため、Firebase Crashlyticsを使用してクラッシュレポートを収集しています。
収集される情報には、デバイス情報、クラッシュログ、ユーザーIDが含まれます。
これらの情報は、アプリの問題を特定し修正する目的でのみ使用されます。
```

### App Store / Google Playの申請時

- **App Store**: App Privacy セクションで「Crash Data」の収集を宣言
- **Google Play**: データ セーフティ セクションで「Diagnostics」データの収集を宣言

## バージョン情報

- 導入バージョン: v1.0.24
- Firebase SDK: `@react-native-firebase/app` と `@react-native-firebase/crashlytics`
- Expo SDK: 52

## 参考リンク

- [Firebase Crashlytics公式ドキュメント](https://firebase.google.com/docs/crashlytics)
- [React Native Firebase Crashlytics](https://rnfirebase.io/crashlytics/usage)
- [Expo と Firebase の統合](https://docs.expo.dev/guides/using-firebase/)

## サポート

問題が発生した場合は、以下を確認してください:

1. このドキュメントのトラブルシューティングセクション
2. Firebase Console のエラーメッセージ
3. アプリのログ出力

それでも解決しない場合は、開発チームにお問い合わせください。
