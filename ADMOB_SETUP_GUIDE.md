# Google AdMob設定ガイド - ParkPedia

**作成日**: 2025年11月30日
**Publisher ID**: pub-5237930968754753
**app-ads.txt URL**: https://kamui00002.github.io/ParkPedia/app-ads.txt

---

## ✅ 完了済みの準備作業

- ✅ **AdMobアカウント作成済み**
  - Publisher ID: pub-5237930968754753

- ✅ **app-ads.txtファイル作成済み**
  - 配置場所: `/docs/app-ads.txt`
  - 公開URL: https://kamui00002.github.io/ParkPedia/app-ads.txt
  - 内容: `google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`

- ✅ **プライバシーポリシー公開済み**
  - URL: https://kamui00002.github.io/ParkPedia/privacy-policy.html
  - 広告に関する記載: あり

---

## 🚀 AdMob Consoleでのアプリ登録手順

### ステップ1: AdMob Consoleにログイン

1. **AdMob Consoleにアクセス**
   - URL: https://apps.admob.com/

2. **Googleアカウントでログイン**
   - AdMobアカウントに紐づいたGoogleアカウントを使用

---

### ステップ2: 新しいアプリを追加

#### 2-1. アプリの追加

1. **左メニューの「アプリ」をクリック**

2. **「アプリを追加」ボタンをクリック**

3. **プラットフォームを選択**
   - ✅ iOS
   - ✅ Android（将来的に追加する場合）

#### 2-2. アプリの情報を入力（iOS）

**アプリがすでに公開されていますか？**
- **はい**を選択（App Storeで公開済み）

**App Store URL またはバンドルIDを入力**:
```
com.parkpedia.app
```
または
```
https://apps.apple.com/app/id6755152821
```

**検索して選択**:
- 「ParkPedia」で検索
- アプリが表示されたら選択

#### 2-3. app-ads.txt設定

**app-ads.txtのステータス**:
- AdMobが自動的に検出を試みます
- **重要**: AdMobは通常、ドメインのルートでapp-ads.txtを探します

**現在の配置**:
- URL: https://kamui00002.github.io/ParkPedia/app-ads.txt
- ⚠️ サブパスに配置（`/ParkPedia/`）

**AdMobでの設定**:
1. アプリを追加後、「app-ads.txt」タブを確認
2. ステータスが「確認済み」または「検証中」であることを確認
3. エラーが表示される場合は、以下の対応が必要：

---

### ⚠️ app-ads.txt の問題と対処法

AdMobがapp-ads.txtを検出できない場合の対処法:

#### オプション1: ドメインのルートに配置（推奨）

AdMobは通常、以下のURLでapp-ads.txtを探します:
- ✅ `https://kamui00002.github.io/app-ads.txt` （ルート）
- ❌ `https://kamui00002.github.io/ParkPedia/app-ads.txt` （サブパス）

**解決策**:

1. **kamui00002.github.io リポジトリを作成**
   - GitHubで新しいリポジトリ `kamui00002.github.io` を作成
   - ユーザーサイトとして機能します

2. **app-ads.txtをルートに配置**
   ```bash
   # kamui00002.github.io リポジトリに
   # ルートディレクトリにapp-ads.txtを配置
   ```

3. **内容**:
   ```
   google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
   ```

4. **GitHub Pagesで公開**
   - リポジトリ設定 > Pages
   - Source: Deploy from a branch
   - Branch: main / root

5. **確認**:
   - https://kamui00002.github.io/app-ads.txt にアクセス可能か確認

#### オプション2: カスタムドメインを使用

カスタムドメイン（例: parkpedia.com）を持っている場合:
1. ドメインのルートにapp-ads.txtを配置
2. GitHub Pagesでカスタムドメインを設定
3. AdMobでカスタムドメインを使用

#### オプション3: AdMobサポートに問い合わせ

サブパスでの配置が認識されない場合:
- AdMobサポートに連絡
- GitHub Pagesの制約を説明
- 代替案を相談

---

### ステップ3: 広告ユニットの作成

アプリが登録されたら、広告ユニットを作成します。

#### 3-1. バナー広告ユニット

1. **アプリを選択** > **「広告ユニット」**タブ

2. **「広告ユニットを追加」**をクリック

3. **広告フォーマットを選択**: **バナー**

4. **広告ユニット名**:
   ```
   ParkPedia - Home Screen Banner
   ```

5. **作成**をクリック

6. **広告ユニットIDをコピー**:
   ```
   ca-app-pub-5237930968754753/XXXXXXXXXX
   ```

7. **`adConfig.js`に設定**:
   ```javascript
   banner: Platform.select({
     ios: 'ca-app-pub-5237930968754753/XXXXXXXXXX',
     android: 'ca-app-pub-5237930968754753/YYYYYYYYYY',
   }),
   ```

#### 3-2. インタースティシャル広告ユニット

1. **「広告ユニットを追加」**をクリック

2. **広告フォーマットを選択**: **インタースティシャル**

3. **広告ユニット名**:
   ```
   ParkPedia - Review Interstitial
   ```

4. **作成**をクリック

5. **広告ユニットIDをコピー**して`adConfig.js`に設定

---

### ステップ4: AdMobパッケージのインストール

現在、AdMobパッケージがインストールされていないため、実装が必要です。

#### 4-1. パッケージのインストール

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia

# Expo用AdMobパッケージをインストール
npx expo install expo-ads-admob

# または最新版
npx expo install react-native-google-mobile-ads
```

**推奨**: `react-native-google-mobile-ads`（最新のAdMob SDK）

#### 4-2. app.jsonの設定

`app.json`に以下を追加:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-5237930968754753~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-5237930968754753~YYYYYYYYYY"
        }
      ]
    ]
  }
}
```

**注意**: `androidAppId`と`iosAppId`は**アプリID**（広告ユニットIDとは異なる）

**アプリIDの取得**:
- AdMob Console > アプリ > アプリ設定
- 「アプリID」をコピー（`ca-app-pub-5237930968754753~XXXXXXXXXX`形式）

---

### ステップ5: 広告コンポーネントの実装

#### 5-1. バナー広告コンポーネント

`components/AdBanner.js`を作成:

```javascript
import React from 'react';
import { Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_ENABLED, AD_UNIT_IDS } from '../adConfig';

const AdBanner = () => {
  if (!AD_ENABLED) {
    return null; // 広告無効時は何も表示しない
  }

  const adUnitId = __DEV__
    ? TestIds.BANNER // 開発時はテスト広告
    : AD_UNIT_IDS.banner; // 本番時は実際の広告ユニットID

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: false,
      }}
    />
  );
};

export default AdBanner;
```

#### 5-2. 画面への配置

`screens/HomeScreen.js`に追加:

```javascript
import AdBanner from '../components/AdBanner';

// HomeScreen内の適切な場所に配置
<AdBanner />
```

---

### ステップ6: adConfig.jsの更新

広告ユニットIDを取得したら、`adConfig.js`を更新:

```javascript
// 広告ユニットID（AdMobで取得したIDに置き換える）
export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-5237930968754753/XXXXXXXXXX',      // iOSバナー広告ID
    android: 'ca-app-pub-5237930968754753/YYYYYYYYYY',  // Androidバナー広告ID
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-5237930968754753/AAAAAAAAAA',      // iOSインタースティシャル広告ID
    android: 'ca-app-pub-5237930968754753/BBBBBBBBBB',  // Androidインタースティシャル広告ID
  }),
};

// 🎯 本番リリース時はこれをtrueに変更
export const AD_ENABLED = false;  // ← まずはfalseのままテスト
```

---

### ステップ7: テスト

#### 7-1. 開発環境でのテスト

```bash
# iOSシミュレーターで起動
npm run ios

# 広告スペースが表示されることを確認
# AD_ENABLED = false の場合は何も表示されない
```

#### 7-2. テスト広告の表示

1. **AD_ENABLEDをtrueに変更**（一時的に）
2. **アプリを再起動**
3. **テスト広告が表示されることを確認**
   - `__DEV__`がtrueの場合、自動的にテスト広告が表示される

#### 7-3. 本番広告のテスト

**⚠️ 重要**: 自分の広告をクリックしないでください（ポリシー違反）

1. **AD_ENABLEDをtrueに維持**
2. **テストデバイスを登録**（推奨）
3. **実機でテスト**
4. **広告が正しく表示されることを確認**

---

### ステップ8: App Storeへの再提出

広告を実装したら、App Storeに新しいバージョンを提出:

#### 8-1. バージョン更新

`app.json`:
```json
{
  "expo": {
    "version": "1.0.6",
    "ios": {
      "buildNumber": "10"
    }
  }
}
```

#### 8-2. ビルド作成

```bash
eas build --platform ios --profile production
```

#### 8-3. App Store Connectで設定

1. **「広告」セクション**
   - 「このアプリには広告が含まれています」にチェック
   - 広告の種類: バナー広告、インタースティシャル広告

2. **プライバシーポリシー**
   - 既存のURL（広告に関する記載あり）

3. **提出**

---

## 📋 AdMob審査のチェックリスト

### アプリ登録前
- [x] AdMobアカウント作成済み
- [x] app-ads.txtファイル作成済み
- [x] app-ads.txtがGitHub Pagesで公開済み
- [ ] app-ads.txtがドメインのルートにアクセス可能（要確認）
- [x] プライバシーポリシーに広告に関する記載あり

### AdMob Console設定
- [ ] AdMob Consoleでアプリを登録
- [ ] app-ads.txtのステータスが「確認済み」
- [ ] 広告ユニット（バナー）を作成
- [ ] 広告ユニット（インタースティシャル）を作成
- [ ] アプリIDと広告ユニットIDを取得

### アプリへの実装
- [ ] AdMobパッケージをインストール
- [ ] app.jsonにAdMob設定を追加
- [ ] adConfig.jsに広告ユニットIDを設定
- [ ] バナー広告コンポーネントを作成
- [ ] 画面に広告を配置
- [ ] 開発環境でテスト広告を確認
- [ ] 実機でテスト

### App Store再提出
- [ ] バージョン番号を更新（1.0.6）
- [ ] ビルド番号を更新（10）
- [ ] 新しいビルドを作成
- [ ] App Store Connectで「広告あり」に設定
- [ ] 審査に提出

---

## ⚠️ 重要な注意点

### 1. app-ads.txtの配置

**現在の問題**:
- app-ads.txtが`/ParkPedia/`サブパスに配置されている
- AdMobはドメインのルート（`https://kamui00002.github.io/app-ads.txt`）を期待

**対処法**:
- AdMobでアプリ登録時にエラーが出る場合
- `kamui00002.github.io`リポジトリを作成してルートに配置
- または、AdMobサポートに問い合わせ

### 2. 広告ポリシー遵守

- ❌ 自分の広告をクリックしない
- ❌ 他の人に広告クリックを依頼しない
- ❌ 誤クリックを誘導する配置をしない
- ✅ ユーザー体験を損なわない適切な配置
- ✅ プライバシーポリシーに広告について明記

### 3. テスト方法

**開発時**:
- `__DEV__`フラグでテスト広告を使用
- 本番広告IDを設定しても、開発時は自動的にテスト広告

**本番テスト**:
- テストデバイスを登録して安全にテスト
- 絶対に自分の広告をクリックしない

### 4. 収益化までの期間

- AdMobアカウント承認: 通常1〜3営業日
- app-ads.txt検証: 数時間〜24時間
- 広告配信開始: 承認後すぐ
- 初回支払い: $100以上の収益で翌月

---

## 🔧 トラブルシューティング

### Q1: app-ads.txtが検証されない

**A1**: 以下を確認:
1. https://kamui00002.github.io/ParkPedia/app-ads.txt にアクセス可能か
2. 内容が正確か（`google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`）
3. ドメインのルートに配置が必要かAdMobサポートに確認

### Q2: 広告が表示されない

**A2**: 以下を確認:
1. `AD_ENABLED`が`true`か
2. 広告ユニットIDが正しいか
3. AdMobパッケージが正しくインストールされているか
4. app.jsonの設定が正しいか
5. アプリIDが設定されているか
6. 開発時はテスト広告が表示されるか（`__DEV__`フラグ）

### Q3: AdMobアカウントが停止された

**A3**: 原因:
- 自分の広告をクリック
- 無効なトラフィック
- ポリシー違反

**対処法**:
- AdMobサポートに問い合わせ
- 再審査を申請
- ポリシー遵守を徹底

---

## 📞 サポート

### AdMobヘルプセンター
- URL: https://support.google.com/admob/

### AdMobサポート
- AdMob Console > ヘルプ > サポートに問い合わせ

### app-ads.txtについて
- 公式ガイド: https://support.google.com/admob/answer/10532191

---

## ✅ 次のステップ

### 今すぐ実行可能:

1. **AdMob Consoleでアプリを登録**
   - https://apps.admob.com/
   - 「アプリを追加」をクリック
   - ParkPediaを検索して追加

2. **app-ads.txtの検証状態を確認**
   - エラーが出る場合は、ルートに配置を検討

3. **広告ユニットを作成**
   - バナー広告
   - インタースティシャル広告
   - 広告ユニットIDをメモ

### 次の作業:

4. **AdMobパッケージをインストール**
   - `react-native-google-mobile-ads`

5. **広告を実装**
   - adConfig.jsを更新
   - AdBannerコンポーネントを作成
   - 画面に配置

6. **テスト**
   - 開発環境でテスト広告を確認
   - 実機でテスト

7. **App Storeに再提出**
   - バージョン1.0.6として

---

**準備完了！AdMobの設定を始めましょう！** 🚀

**最終更新**: 2025-11-30
