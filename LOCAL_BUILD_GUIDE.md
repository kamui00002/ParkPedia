# ローカルビルドガイド - ParkPedia v1.0.6

**作成日**: 2025年11月30日
**バージョン**: 1.0.6
**ビルド番号**: 10

---

## ✅ 準備完了

- ✅ **app.json更新済み**
  - version: 1.0.6
  - buildNumber: 10

- ✅ **iOSネイティブプロジェクト存在**
  - `/ios/ParkPedia.xcworkspace`

---

## 🚀 ローカルビルド手順

### 方法1: Xcodeで直接ビルド（推奨・最速）

#### ステップ1: Xcodeでプロジェクトを開く

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
open ios/ParkPedia.xcworkspace
```

**重要**: `.xcworkspace`を開いてください（`.xcodeproj`ではありません）

#### ステップ2: Xcodeでビルド設定

1. **プロジェクトナビゲーターでParkPediaを選択**

2. **TARGETSでParkPediaを選択**

3. **General**タブを確認:
   - **Version**: 1.0.6 ✅（自動更新済み）
   - **Build**: 10 ✅（自動更新済み）
   - **Bundle Identifier**: com.parkpedia.app ✅

4. **Signing & Capabilities**タブ:
   - **Team**: Apple Developer アカウントを選択
   - **Signing Certificate**: Apple Development または Apple Distribution
   - **Provisioning Profile**: 自動または手動で選択

#### ステップ3: アーカイブを作成（App Store提出用）

1. **メニューバー** > **Product** > **Archive**

2. **ビルド開始**
   - 所要時間: 3〜10分

3. **アーカイブ成功後**
   - Organizerウィンドウが自動的に開く
   - アーカイブ一覧に「ParkPedia 1.0.6 (10)」が表示される

#### ステップ4: App Store Connectにアップロード

1. **Distribute App**ボタンをクリック

2. **App Store Connect**を選択

3. **Upload**を選択

4. **署名オプション**:
   - 「Automatically manage signing」を選択（推奨）

5. **アップロード開始**
   - 所要時間: 5〜15分

6. **アップロード完了**
   - 「Upload Successful」メッセージが表示される

---

### 方法2: コマンドラインでビルド（自動化）

#### ステップ1: Expo CLIでビルド

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia

# iOSビルドを実行
npx expo run:ios --configuration Release --device
```

**注意**: この方法はシミュレーター用のビルドです。App Store提出用には方法1を使用してください。

---

### 方法3: EAS Buildでビルド（クラウド）

ローカルビルドが難しい場合は、EAS Buildを使用できます：

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia

# EAS Buildでビルド
eas build --platform ios --profile production
```

**メリット**:
- ローカル環境の問題を回避
- クラウドで自動ビルド
- 証明書管理が簡単

**デメリット**:
- ビルド時間が長い（10〜20分）
- インターネット接続が必要

---

## 📋 ビルド前のチェックリスト

### 必須項目

- [ ] **Apple Developer Program**に登録済み
- [ ] **証明書（Certificate）**が有効
- [ ] **Provisioning Profile**が有効
- [ ] **app.json**のバージョンが1.0.6
- [ ] **app.json**のビルド番号が10
- [ ] **Bundle Identifier**が`com.parkpedia.app`

### オプション項目

- [ ] **リリースノート**を準備
- [ ] **スクリーンショット**を準備（必要に応じて）
- [ ] **テスト**を実施済み

---

## 🔧 トラブルシューティング

### エラー: "No signing certificate found"

**原因**: 証明書が見つからない

**対処法**:
1. Xcode > Settings > Accounts
2. Apple IDを追加
3. 「Download Manual Profiles」をクリック
4. 再度ビルドを試す

---

### エラー: "Provisioning profile doesn't include signing certificate"

**原因**: Provisioning Profileと証明書が一致しない

**対処法**:
1. Apple Developer ポータルで新しいProvisioning Profileを作成
2. Xcodeで「Automatically manage signing」にチェック
3. 再度ビルドを試す

---

### エラー: "Pod install required"

**原因**: CocoaPodsの依存関係が更新されていない

**対処法**:
```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia/ios
pod install
cd ..
```

---

### エラー: "Build failed"（一般的なエラー）

**対処法**:
1. **クリーンビルド**:
   - Xcode > Product > Clean Build Folder（⇧⌘K）
   - 再度ビルド

2. **派生データ削除**:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```

3. **node_modules再インストール**:
   ```bash
   cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
   rm -rf node_modules
   npm install
   ```

4. **iOS依存関係再インストール**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

---

## 📱 ビルド後の確認

### App Store Connectで確認

1. **App Store Connectにログイン**
   - https://appstoreconnect.apple.com/

2. **ParkPediaアプリを選択**

3. **TestFlight**タブを確認
   - ビルド10が表示されるまで5〜10分待つ
   - ステータスが「処理中」→「審査準備完了」に変わるのを確認

4. **バージョン1.0.6を選択**
   - 「+」ボタンから新しいバージョンを作成
   - ビルド10を選択

5. **審査に提出**
   - 必要事項を入力
   - 「審査に提出」をクリック

---

## 🎯 ローカルビルドのメリット

### なぜローカルビルドが必要？

1. **高速**: EAS Buildより速い（3〜5分 vs 10〜20分）
2. **確実**: インターネット接続の問題を回避
3. **柔軟**: ビルド設定を細かく調整可能
4. **コスト**: EAS Buildの無料枠を節約

---

## 📝 ビルド完了後のステップ

### 1. App Store Connectで設定

1. **マーケティングURLを更新**（重要！）:
   ```
   https://kamui00002.github.io
   ```

2. **バージョン情報**:
   - バージョン: 1.0.6
   - ビルド: 10

3. **What's New（新機能）**:
   ```
   バグフィックスとパフォーマンス改善
   ```

### 2. AdMob設定（オプション）

AdMobの検証が完了している場合:
1. 広告ユニットを作成
2. `adConfig.js`に広告ユニットIDを設定
3. 広告を有効化（`AD_ENABLED = true`）
4. 次のバージョン（1.0.7）で広告を実装

---

## 🚀 クイックスタート

最速でビルドする手順：

```bash
# 1. Xcodeでプロジェクトを開く
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
open ios/ParkPedia.xcworkspace

# 2. Xcodeで操作:
#    - Product > Archive
#    - Distribute App > App Store Connect > Upload

# 完了！
```

---

## ✅ まとめ

### 現在の状態
- ✅ バージョン1.0.6
- ✅ ビルド番号10
- ✅ ローカルビルド準備完了

### 次のステップ
1. Xcodeでビルド（推奨）またはEAS Build
2. App Store Connectにアップロード
3. マーケティングURLを設定
4. 審査に提出

---

**準備完了！ビルドを開始してください！** 🚀

**最終更新**: 2025年11月30日
