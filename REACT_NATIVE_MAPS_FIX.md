# React Native Maps 白画面問題の修正ガイド

## 問題の概要

AddParkScreen.jsでreact-native-mapsを使用した際に、アプリが真っ白な画面になる問題が発生していました。

## 根本原因

1. **app.config.jsにreact-native-mapsの設定が欠落**
   - Expo設定ファイルにGoogle Maps APIキーの設定がなかった
   - iOSとAndroidの両方でネイティブモジュールが正しくリンクされていなかった

2. **Google Maps API Keyの未設定**
   - 環境変数にGoogle Maps APIキーが設定されていなかった

## 実施した修正

### 1. app.config.jsの更新

#### iOS設定に追加:
```javascript
ios: {
  // ... 既存の設定 ...
  config: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS || '',
  },
}
```

#### Android設定に追加:
```javascript
android: {
  // ... 既存の設定 ...
  config: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID || '',
    },
  },
}
```

### 2. .env.exampleの更新

Google Maps APIキーのプレースホルダーを追加:
```bash
GOOGLE_MAPS_API_KEY_IOS=your-google-maps-api-key-for-ios
GOOGLE_MAPS_API_KEY_ANDROID=your-google-maps-api-key-for-android
```

## 次のステップ（必須）

### 1. Google Maps APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択（またはFirebaseプロジェクトと同じGCPプロジェクト）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「APIキー」をクリック
5. 作成したAPIキーを制限（推奨）:
   - **iOS用**: アプリケーション制限で「iOSアプリ」を選択、バンドルIDに `com.parkpedia.app` を設定
   - **Android用**: アプリケーション制限で「Androidアプリ」を選択、パッケージ名に `com.parkpedia.app` とSHA-1フィンガープリントを設定

6. API制限で以下を有効化:
   - Maps SDK for iOS
   - Maps SDK for Android
   - Places API（オプション）
   - Geocoding API（住所検索に使用）

### 2. .envファイルにAPIキーを設定

プロジェクトルートの `.env` ファイル（存在しない場合は `.env.example` をコピー）に以下を追加:

```bash
# Google Maps API Keys
GOOGLE_MAPS_API_KEY_IOS=YOUR_ACTUAL_IOS_API_KEY_HERE
GOOGLE_MAPS_API_KEY_ANDROID=YOUR_ACTUAL_ANDROID_API_KEY_HERE
```

**重要**:
- `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません
- APIキーは絶対に公開リポジトリにコミットしないでください
- 本番環境ではEAS Secretsまたは環境変数サービスを使用してください

### 3. ネイティブプロジェクトの再ビルド

設定変更後、ネイティブコードを再ビルドする必要があります:

```bash
# iOSの場合
npx expo prebuild --clean
npx expo run:ios

# Androidの場合
npx expo prebuild --clean
npx expo run:android
```

または、開発ビルドを作成:

```bash
# iOSシミュレータ用
eas build --profile development --platform ios

# Android実機/エミュレータ用
eas build --profile development --platform android
```

### 4. 動作確認

1. アプリを起動
2. ホーム画面から「公園を追加」ボタンをタップ
3. AddParkScreen.jsで「マップから選ぶ」ボタンをタップ
4. 地図が正しく表示されることを確認
5. 地図をタップして位置を選択できることを確認

## エラーログの確認方法

### Expo開発中:
```bash
# Expoサーバー起動
npx expo start

# iOSで起動してログ確認
npx expo start --ios

# Androidで起動してログ確認
npx expo start --android
```

### ネイティブビルド時:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
# または
adb logcat "*:E" # エラーのみ表示
```

### ブラウザデバッガー:
1. Expo開発サーバー起動中に `m` を押す
2. ブラウザでデバッガーを開く
3. コンソールタブでエラーを確認

## よくある問題とトラブルシューティング

### 1. "Google Maps API key not found" エラー

**原因**: APIキーが正しく設定されていない

**解決策**:
- `.env`ファイルにAPIキーが正しく設定されているか確認
- `npx expo prebuild --clean` でネイティブプロジェクトを再ビルド
- 開発サーバーを再起動

### 2. 地図が灰色で表示される

**原因**: APIキーの制限設定が間違っている、またはAPIが有効化されていない

**解決策**:
- Google Cloud ConsoleでMaps SDK for iOS/Androidが有効化されているか確認
- APIキーの制限設定（バンドルID/パッケージ名）が正しいか確認
- 請求先アカウントが設定されているか確認（Google Mapsは無料枠がありますが、請求先設定が必要）

### 3. iOSで地図が表示されない

**原因**: 位置情報の権限が正しく設定されていない可能性

**解決策**:
- `app.config.js`の`infoPlist`に`NSLocationWhenInUseUsageDescription`が設定されているか確認（既に設定済み）
- アプリをアンインストールして再インストール
- iOSシミュレータの「設定」→「プライバシー」→「位置情報サービス」を確認

### 4. Androidで地図が表示されない

**原因**: SHA-1フィンガープリントが設定されていない

**解決策**:
```bash
# デバッグ用SHA-1を取得
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# 本番用SHA-1を取得（リリースビルド時）
keytool -list -v -keystore /path/to/your-release-key.keystore -alias your-key-alias
```

取得したSHA-1をGoogle Cloud ConsoleのAndroid APIキー制限に追加

## 関連ファイル

- `/Users/yoshidometoru/Documents/GitHub/ParkPedia/app.config.js` - Expo設定ファイル
- `/Users/yoshidometoru/Documents/GitHub/ParkPedia/.env.example` - 環境変数テンプレート
- `/Users/yoshidometoru/Documents/GitHub/ParkPedia/screens/AddParkScreen.js` - 地図を使用する画面

## 参考資料

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Google Cloud Console](https://console.cloud.google.com/)
