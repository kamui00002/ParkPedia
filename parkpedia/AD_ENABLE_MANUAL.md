# 🚀 広告有効化マニュアル

App Store公開後、広告を有効にする手順

---

## 📋 事前準備チェックリスト

```
☐ App Store / Google Playで公開済み
☐ アプリが正常に動作している
☐ ユーザーが10人以上いる
☐ クラッシュやバグが解決済み
```

---

## ステップ1: AdMobアカウント作成（所要時間: 5分）

### 1-1. AdMobにアクセス
URL: https://admob.google.com/

### 1-2. アカウント作成
- Googleアカウントでログイン
- 規約に同意
- 支払い情報を入力（後でもOK）

### 1-3. アプリを登録
- 「アプリを追加」をクリック
- プラットフォーム: iOS / Android
- App Store URL を入力
- アプリ名: ParkPedia

---

## ステップ2: 広告ユニットID取得（所要時間: 10分）

### 2-1. 広告ユニットを作成

以下の3つの広告ユニットを作成：

#### 1. バナー広告（ホーム画面用）
```
名前: home_banner
形式: バナー
サイズ: 320x50
```
→ **ID をメモ:** ca-app-pub-xxxxx/yyyyy

#### 2. バナー広告（詳細画面用）
```
名前: detail_banner
形式: バナー
サイズ: 320x50
```
→ **ID をメモ:** ca-app-pub-xxxxx/zzzzz

#### 3. インタースティシャル広告
```
名前: review_interstitial
形式: インタースティシャル
```
→ **ID をメモ:** ca-app-pub-xxxxx/aaaaa

---

## ステップ3: パッケージのインストール（所要時間: 5分）

### ターミナルで実行

```bash
# React Native Google Mobile Ads をインストール
npm install react-native-google-mobile-ads

# iOSの場合、Podをインストール
cd ios
pod install
cd ..
```

---

## ステップ4: コードの修正（所要時間: 15分）

### 4-1. adConfig.js を編集

`parkpedia/adConfig.js` を開いて、以下を変更：

```javascript
// 変更前
export const AD_ENABLED = false;

// 変更後
export const AD_ENABLED = true;  // ← ここを true に変更
```

### 4-2. 広告ユニットIDを追加

`parkpedia/adConfig.js` に以下を追加：

```javascript
import { Platform } from 'react-native';

export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-xxxxx/yyyyy',      // ← ステップ2で取得したID
    android: 'ca-app-pub-xxxxx/zzzzz',  // ← ステップ2で取得したID
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-xxxxx/aaaaa',      // ← ステップ2で取得したID
    android: 'ca-app-pub-xxxxx/bbbbb',  // ← ステップ2で取得したID
  }),
};
```

### 4-3. AdBannerPlaceholder.js を更新

`parkpedia/components/AdBannerPlaceholder.js` の TODO 部分のコメントアウトを外す：

```javascript
// 変更前
  /* 
  import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  
  <BannerAd ... />
  */

// 変更後（コメントを外す）
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../adConfig';

<BannerAd
  unitId={AD_UNIT_IDS.banner}
  size={BannerAdSize.BANNER}
  requestOptions={{
    requestNonPersonalizedAdsOnly: false,
  }}
  onAdLoaded={() => {
    console.log('✅ 広告読み込み完了');
  }}
  onAdFailedToLoad={(error) => {
    console.error('❌ 広告読み込み失敗:', error);
  }}
/>
```

---

## ステップ5: app.json の設定（所要時間: 5分）

`parkpedia/app.json` に以下を追加：

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxx~yyyyy",
          "iosAppId": "ca-app-pub-xxxxx~zzzzz"
        }
      ]
    ]
  }
}
```

**⚠️ 注意:** 
- `androidAppId` と `iosAppId` は広告ユニットIDとは別の「アプリID」です
- AdMobの「アプリ設定」→「アプリID」で確認できます

---

## ステップ6: ビルドとテスト（所要時間: 10分）

### 6-1. アプリを再ビルド

```bash
# キャッシュをクリア
npx expo start --clear

# または完全にクリーン
rm -rf node_modules
npm install
npx expo start --clear
```

### 6-2. テスト用デバイスで確認

- アプリを起動
- ホーム画面に広告が表示されるか確認
- 公園詳細画面に広告が表示されるか確認

**初回は広告が表示されるまで数分かかる場合があります**

---

## ステップ7: App Store / Google Play に再申請（所要時間: 30分）

### 7-1. バージョンアップ

`parkpedia/app.json` でバージョンを上げる：

```json
{
  "expo": {
    "version": "1.1.0"  // 1.0.0 → 1.1.0 に変更
  }
}
```

### 7-2. ビルド

```bash
# iOS
npx eas build --platform ios

# Android
npx eas build --platform android
```

### 7-3. アップデート申請

- App Store Connect / Google Play Console にログイン
- 新しいバージョンをアップロード
- 変更内容: 「軽微なバグ修正と機能改善」
- 審査に提出

---

## ステップ8: AdMob審査申請（所要時間: 5分）

### 8-1. AdMobにログイン

### 8-2. アプリ設定

「アプリはサポートされているアプリストアに登録されていますか？」

→ **「はい」** を選択

### 8-3. 審査待ち

通常1-3日で審査結果が通知されます

---

## ✅ 完了！

審査が通ると、自動的に広告が表示され始めます。

---

## 📊 動作確認チェックリスト

```
☐ ホーム画面に広告が表示される
☐ 公園詳細画面に広告が表示される
☐ 広告をタップするとブラウザが開く
☐ クラッシュしない
☐ AdMob管理画面で統計が見える
```

---

## 🐛 トラブルシューティング

### 広告が表示されない

**原因1: 広告リクエストが少ない**
→ 待つ（初回は表示まで時間がかかる）

**原因2: IDが間違っている**
→ AdMobで取得したIDを再確認

**原因3: AdMob審査が未通過**
→ AdMob管理画面で審査状態を確認

### アプリがクラッシュする

**原因: 設定ミス**
→ app.json の設定を再確認
→ `npx expo start --clear` で再起動

### 収益が発生しない

**原因: クリックが少ない**
→ 正常。最初は収益が少ないのが普通
→ ユーザーが増えると自然に増加

---

## 📞 サポート

問題が解決しない場合：
- AdMob ヘルプセンター
- React Native Google Mobile Ads ドキュメント
- Stack Overflow

---

**🎉 広告実装完了！収益化開始です！**

