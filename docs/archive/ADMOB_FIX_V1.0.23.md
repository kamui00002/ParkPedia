# AdMob iOS起動時クラッシュ修正 (v1.0.23)

## 問題の概要

AdMobを再導入した際に、iOSアプリ起動時に以下のエラーでクラッシュが発生。

```
The Google Mobile Ads SDK was initialized without AppMeasurement
```

## 根本原因

Google Mobile Ads SDK は Firebase Analytics (AppMeasurement) との統合を期待しているが、Info.plist に必要な設定キー `GADIsAdManagerApp` が不足していた。

## 実施した修正

### 1. iOS Info.plist への設定追加 (自動生成)

`/ios/ParkPedia/Info.plist` に以下のキーを追加。

```xml
<key>GADIsAdManagerApp</key>
<true/>
```

このキーは AdMob SDK に対して、このアプリが AdManager を使用していることを明示する。

### 2. app.json の設定更新 (次回 prebuild で自動反映)

`app.json` の `expo.ios.infoPlist` セクションに `GADIsAdManagerApp` を追加。

```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "このアプリは近くの公園を検索するために位置情報を使用します。",
  "NSCameraUsageDescription": "このアプリは公園の写真を撮影するためにカメラを使用します。",
  "NSPhotoLibraryUsageDescription": "このアプリは公園の写真を選択するためにフォトライブラリにアクセスします。",
  "ITSAppUsesNonExemptEncryption": false,
  "GADIsAdManagerApp": true
}
```

### 3. Android App ID の追加

AdMob プラグイン設定に Android App ID を追加し、prebuild 時の警告を解消。

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "iosAppId": "ca-app-pub-5237930968754753~4809377071",
      "androidAppId": "ca-app-pub-5237930968754753~4809377071"
    }
  ]
]
```

## 既存の実装状況

### AdMob 設定ファイル (`adConfig.js`)

```javascript
export const AD_ENABLED = true;  // v1.0.20: クラッシュ解消により広告を再有効化

export const AD_UNIT_IDS = {
  banner: 'ca-app-pub-5237930968754753/1172496343',
};
```

### AdMob 初期化 (`App.js`)

```javascript
// AdMobをアプリ起動時に初期化（React Componentの外で実行）
let isAdMobInitialized = false;
if (Platform.OS !== 'web') {
    try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        mobileAds.initialize().then(() => {
            isAdMobInitialized = true;
            if (__DEV__) {
                console.log('AdMob初期化成功');
            }
        }).catch((error) => {
            if (__DEV__) {
                console.warn('AdMob初期化失敗:', error.message);
            }
            isAdMobInitialized = true;
        });
    } catch (error) {
        if (__DEV__) {
            console.warn('AdMobモジュール読み込み失敗:', error.message);
        }
        isAdMobInitialized = true;
    }
}
```

### AdBanner コンポーネント (`components/AdBanner.js`)

- Expo Go 環境を自動検出して広告を無効化
- 開発環境ではテスト広告IDを使用
- 本番環境では実際の広告IDを使用
- 安全なエラーハンドリング実装済み

## ビルド・テスト手順

### 1. iOS ビルド前の準備

```bash
# iOSディレクトリを削除して再生成（既存の設定をクリーン）
rm -rf ios/

# Expo prebuild で iOS プロジェクトを再生成
npx expo prebuild --platform ios --clean
```

### 2. iOS ビルドとテスト

```bash
# iPhone シミュレータでテスト
npm run ios

# 特定のデバイスでテスト
npm run ios:iphone17pro
npm run ios:ipadair5
```

### 3. 本番ビルド（EAS Build）

```bash
# TestFlight 用ビルド
eas build --platform ios --profile production

# バージョン番号更新
# - app.json: version を 1.0.23 に更新
# - app.json: buildNumber を 29 に更新
```

## 検証項目

- [ ] アプリが正常に起動する（クラッシュしない）
- [ ] 開発環境でテスト広告が表示される
- [ ] コンソールに「AdMob初期化成功」ログが表示される
- [ ] ホーム画面にバナー広告が表示される
- [ ] 広告読み込みエラーが発生しても、アプリがクラッシュしない
- [ ] Firebase Analytics が正常に動作する

## 修正前の状態

- v1.0.19: AdMob を完全削除してクラッシュを修正
- v1.0.20: adConfig.js で `AD_ENABLED = true` に変更（コミットなし）

## 修正後の期待される動作

- iOS アプリが正常に起動する
- AdMob SDK が Firebase Analytics と正常に統合される
- バナー広告が表示される（開発環境ではテスト広告）
- エラーが発生しても適切にハンドリングされる

## 関連ファイル

- `/app.json` - Expo 設定（GADIsAdManagerApp 追加）
- `/ios/ParkPedia/Info.plist` - iOS 設定（自動生成、.gitignore に含まれる）
- `/adConfig.js` - AdMob 広告設定
- `/App.js` - AdMob 初期化コード
- `/components/AdBanner.js` - バナー広告コンポーネント

## 参考資料

- [Google Mobile Ads SDK - iOS Integration](https://developers.google.com/admob/ios/quick-start)
- [react-native-google-mobile-ads Documentation](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo Config Plugins - AdMob](https://docs.expo.dev/versions/latest/sdk/admob/)

## 次のステップ

1. iOS ディレクトリを削除して `npx expo prebuild` を実行
2. シミュレータでテスト
3. クラッシュが解消されていることを確認
4. 広告が正常に表示されることを確認
5. TestFlight ビルドを作成
6. 内部テスター向けに配信
7. 問題なければ App Store 審査に提出

## トラブルシューティング

### まだクラッシュする場合

1. iOS ディレクトリを完全削除して再生成
   ```bash
   rm -rf ios/
   npx expo prebuild --platform ios --clean
   ```

2. Podfile.lock を削除して再インストール
   ```bash
   cd ios/
   rm -rf Podfile.lock Pods/
   pod install
   cd ..
   ```

3. ビルドキャッシュをクリア
   ```bash
   npx expo start --clear
   ```

### 広告が表示されない場合

- 開発環境では、初回は広告の読み込みに時間がかかる場合がある
- コンソールログで「AdMob: 広告が読み込まれました」を確認
- テスト広告IDが正しく設定されているか確認
- 広告ユニットIDが有効であることを AdMob コンソールで確認

### Firebase Analytics が動作しない場合

- `GoogleService-Info.plist` が正しく配置されているか確認
- Firebase プロジェクト設定で iOS アプリが正しく登録されているか確認
- Bundle Identifier が一致しているか確認（`com.parkpedia.app`）

---

**作成日**: 2025-01-XX
**作成者**: Claude Code (Technical Support Specialist)
**バージョン**: 1.0.23
