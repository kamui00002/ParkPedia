# AdMob実装完了サマリー - ParkPedia

**実装日**: 2025年12月2日  
**バージョン**: 1.0.7 (ビルド番号: 11)  
**ステータス**: ✅ 実装完了・TestFlight提出済み

---

## ✅ 完了した作業

### 1. AdMob Console設定
- ✅ AdMobアカウント作成
- ✅ Publisher ID: `pub-5237930968754753`
- ✅ iOS App ID: `ca-app-pub-5237930968754753~4809377071`
- ✅ バナー広告ユニットID: `ca-app-pub-5237930968754753/1172496343`

### 2. app-ads.txt設定
- ✅ ファイル作成: `google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`
- ✅ GitHub Pagesで公開: https://kamui00002.github.io/app-ads.txt
- ✅ ルートドメインに配置（重要！）

### 3. アプリ実装
- ✅ AdMob SDK インストール: `react-native-google-mobile-ads`
- ✅ app.json に iOS App ID を追加
- ✅ adConfig.js で広告設定を管理
- ✅ AdBanner コンポーネント作成
- ✅ ホーム画面に広告配置
- ✅ 公園詳細画面に広告配置

### 4. テストと検証
- ✅ 開発環境でテスト広告表示確認
- ✅ プロダクションビルド作成成功
- ✅ TestFlightに提出完了

---

## 📝 重要な学び・反省点

### 1. app-ads.txt は必ずルートドメインに配置

**問題**: 
- 最初、`https://kamui00002.github.io/ParkPedia/app-ads.txt` (サブパス) に配置
- AdMobが検証できなかった

**解決策**:
- `kamui00002.github.io` リポジトリを新規作成
- ルートに app-ads.txt を配置: `https://kamui00002.github.io/app-ads.txt`
- ✅ AdMobが正しく検証できるようになった

**教訓**: 
- app-ads.txt は**必ずドメインのルート**に配置すること
- サブディレクトリでは認識されない

---

### 2. AdMob検証は広告リクエスト後に自動で行われる

**誤解していた点**:
- 「Verify app」ボタンで手動検証が必要だと思っていた

**実際**:
- アプリが広告をリクエストすると自動的に検証される
- app-ads.txt さえ正しく配置されていれば、24〜48時間以内に自動検証完了
- 「Verify app」は補助的な機能

**教訓**:
- app-ads.txt を正しく配置したら、あとはアプリをリリースして待つだけ
- 焦って手動検証する必要はない

---

### 3. Expo Goではカスタムネイティブコード（AdMob）は動作しない

**問題**:
- AdMob実装後、`npx expo start` で起動しようとしたが動作しなかった

**原因**:
- AdMobはカスタムネイティブコードを含む
- Expo Goアプリには含まれていない

**解決策**:
- `npx expo prebuild --clean` でネイティブプロジェクトを再生成
- `npx expo run:ios` でカスタムビルドを起動
- または EAS Build で開発ビルド/プロダクションビルドを作成

**教訓**:
- カスタムネイティブコードを追加したら、Expo Goは使えなくなる
- 開発ビルドまたはプロダクションビルドが必要

---

### 4. 古いプレースホルダーコンポーネントが残っていた

**問題**:
- `AdBannerPlaceholder.js` が古い設定 (`AD_SETTINGS.banner`) を参照
- ParkDetailScreenでエラー: `Cannot read property 'banner' of undefined`

**原因**:
- 新しい `adConfig.js` では `AD_ENABLED` と `AD_UNIT_IDS` を使用
- 古い `AD_SETTINGS` は存在しない

**解決策**:
- すべての画面で `AdBannerPlaceholder` を `AdBanner` に置き換え
- 統一されたコンポーネントを使用

**教訓**:
- 新しいコンポーネントを作成したら、古いプレースホルダーを全て置き換える
- Grepで全ファイルを検索して残っていないか確認

---

### 5. TypeScript依存関係が必要だった

**問題**:
- `npx expo start` 実行時に TypeScript エラーが発生

**解決策**:
```bash
npx expo install typescript @types/react
```

**教訓**:
- Expo SDK 54以降では TypeScript が標準
- 依存関係を事前にインストールしておくとスムーズ

---

## 🎯 次回のリリース時のチェックリスト

### AdMob関連

1. ✅ app-ads.txt がルートドメインに配置されているか確認
   - URL: https://kamui00002.github.io/app-ads.txt
   - 内容: `google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`

2. ✅ adConfig.js で `AD_ENABLED = true` になっているか確認

3. ✅ 広告ユニットIDが正しいか確認
   - iOS App ID: `ca-app-pub-5237930968754753~4809377071`
   - バナー広告: `ca-app-pub-5237930968754753/1172496343`

4. ✅ 開発環境でテスト広告が表示されるか確認
   - `npx expo prebuild --clean`
   - `npx expo run:ios`

5. ✅ プロダクションビルド作成
   - バージョン番号を更新
   - `eas build --platform ios --profile production`

6. ✅ TestFlight提出
   - `eas submit --platform ios`

7. ✅ App Store Connect設定
   - プライバシー: ID → デバイスID → サードパーティ広告
   - 年齢制限: 広告あり

---

## 📊 AdMob収益確認

### 確認タイミング

**24〜48時間後**:
- AdMob Console: https://apps.admob.com/
- 「アプリ」→「ParkPedia (iOS)」
- app-ads.txt ステータスが「✅ 認証済み」になる
- 広告リクエストと収益が表示され始める

### 重要な注意事項

⚠️ **自分の広告は絶対にクリックしないこと**
- AdMobポリシー違反
- アカウント停止のリスク
- テストは「見るだけ」に留める

---

## 🔧 トラブルシューティング

### 広告が表示されない場合

1. **開発環境でテスト広告が表示されない**
   - adConfig.js で `AD_ENABLED = true` か確認
   - `npx expo prebuild --clean` を実行
   - `npx expo run:ios` で再起動

2. **本番環境で広告が表示されない**
   - App Store/TestFlightでリリースされているか確認
   - 24時間待つ（AdMobの初回検証に時間がかかる）
   - AdMob Consoleで広告リクエストが記録されているか確認

3. **app-ads.txt エラー**
   - https://kamui00002.github.io/app-ads.txt にアクセスできるか確認
   - ファイル内容が正しいか確認
   - 48時間待つ（クロールに時間がかかる）

---

## 📁 関連ファイル

### 広告設定
- `adConfig.js` - 広告設定の中央管理
- `components/AdBanner.js` - 広告バナーコンポーネント

### 広告を表示している画面
- `screens/HomeScreen.js` - ホーム画面（公園リスト下部）
- `screens/ParkDetailScreen.js` - 公園詳細画面（画面下部固定）

### 設定ファイル
- `app.json` - iOS App ID設定
- `https://kamui00002.github.io/app-ads.txt` - AdMob検証用

---

## 🚀 今後の改善案

### 1. 他の広告フォーマットの追加

現在: バナー広告のみ

追加可能:
- **インタースティシャル広告**（全画面広告）
  - 公園詳細から戻る時に表示
  - 収益性が高い
  
- **リワード広告**（報酬型広告）
  - 広告視聴で特典を提供
  - プレミアム機能の一時開放など

### 2. 他の画面への広告配置

現在: ホーム画面、公園詳細画面のみ

追加可能:
- マイページ
- お気に入り画面
- レビュー一覧画面

### 3. Android版の実装

現在: iOS のみ

追加作業:
- app.json に `androidAppId` を追加
- Android用の広告ユニットを作成
- Android版をビルド・テスト

---

## ✅ まとめ

**成功のポイント**:
1. ✅ app-ads.txt をルートドメインに配置
2. ✅ 開発環境でテスト広告を確認してから本番ビルド
3. ✅ 古いコンポーネントを全て新しいものに置き換え
4. ✅ App Store Connectでプライバシー設定を正しく行う

**次回のリリースでスムーズに進めるために**:
- このドキュメントを参照
- チェックリストに従って作業
- トラブルシューティングガイドを活用

---

**最終更新**: 2025年12月2日  
**次回確認**: 2025年12月4日（AdMob検証完了予定）
