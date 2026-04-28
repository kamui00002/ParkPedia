# 📤 TestFlight提出ガイド

**作成日**: 2025年12月21日  
**目的**: ParkPediaアプリをTestFlightに提出する手順を説明

---

## ✅ TestFlight提出の実施可能性

**結論**: **実施可能です** ✅

プロジェクトには以下のTestFlight提出方法が設定されています：

1. ✅ **EAS Build + Submit（推奨）**: クラウドビルド + 自動提出
2. ✅ **ローカルビルド + EAS Submit**: ローカルでIPA作成 + 自動提出
3. ✅ **Xcode経由**: Xcodeでアーカイブ + App Store Connectにアップロード

---

## 📋 前提条件

### 必須項目

1. ✅ **Apple Developerアカウント**
   - 有効なApple Developer Programメンバーシップ
   - Team ID: `B7F79FDM78`（設定済み）

2. ✅ **App Store Connect設定**
   - App ID: `6755152821`（設定済み）
   - Apple ID: `kamui00002@yahoo.co.jp`（設定済み）

3. ✅ **EAS CLI**
   - インストール: `npm install -g eas-cli`
   - ログイン: `eas login`

4. ✅ **証明書とプロビジョニングプロファイル**
   - Xcodeで自動管理（推奨）
   - または手動で設定

---

## 🚀 TestFlight提出方法

### 方法1: EAS Build + Submit（推奨・最も簡単）

**メリット**:
- ✅ クラウドで自動ビルド（ローカル環境不要）
- ✅ 証明書管理が自動
- ✅ ビルド完了後に自動提出

**手順**:

```bash
# 1. EAS CLIのインストール（未インストールの場合）
npm install -g eas-cli

# 2. EASにログイン
eas login

# 3. iOSビルド + TestFlight提出（一括実行）
eas build --platform ios --profile production --auto-submit
```

**ビルド時間**: 約15-30分

**完了後**:
- App Store Connectに自動的にアップロードされます
- TestFlightで確認可能になります（審査が必要な場合あり）

---

### 方法2: ローカルビルド + EAS Submit

**メリット**:
- ✅ ローカルでビルド（高速）
- ✅ ビルド結果を確認してから提出

**手順**:

```bash
# 1. ローカルでIPAファイルを作成
./local_build_ios_ipa.sh

# 2. IPAファイルの場所を確認
ls -la ios/build/export/ParkPedia.ipa

# 3. TestFlightに提出
eas submit --platform ios --profile production --path ./ios/build/export/ParkPedia.ipa
```

**または、一括スクリプトを使用**:

```bash
# ビルド + 提出を一括実行
chmod +x build_and_submit_testflight.sh
./build_and_submit_testflight.sh
```

---

### 方法3: Xcode経由（従来の方法）

**メリット**:
- ✅ XcodeのUIで操作
- ✅ ビルドログを詳細に確認可能

**手順**:

```bash
# 1. Xcodeでプロジェクトを開く
open ios/ParkPedia.xcworkspace

# 2. メニューバー > Product > Archive

# 3. Organizerウィンドウで「Distribute App」を選択

# 4. 「App Store Connect」を選択

# 5. 「Upload」を選択

# 6. 署名オプションを選択（自動署名推奨）

# 7. アップロード開始
```

---

## 📝 詳細手順（方法1: EAS Build + Submit）

### ステップ1: EAS CLIのセットアップ

```bash
# EAS CLIのインストール確認
eas --version

# 未インストールの場合
npm install -g eas-cli

# EASにログイン
eas login
```

### ステップ2: ビルド設定の確認

```bash
# eas.jsonの設定を確認
cat eas.json
```

**確認ポイント**:
- ✅ `submit.production.ios.appleId`: 設定済み
- ✅ `submit.production.ios.ascAppId`: 設定済み
- ✅ `submit.production.ios.appleTeamId`: 設定済み

### ステップ3: ビルド + 提出

```bash
# ビルド + 自動提出
eas build --platform ios --profile production --auto-submit
```

**対話的なプロンプト**（初回のみ）:
1. **Do you want to log in to your Apple account?**
   - 回答: `Y`
   - Apple ID: `kamui00002@yahoo.co.jp`

2. **Apple ID Password:**
   - パスワードを入力

3. **Two-factor authentication:**
   - 2FAコードを入力（iPhone/Macに表示）

4. **Select a team:**
   - Team ID `B7F79FDM78` を選択

### ステップ4: ビルドの監視

ビルドが開始されると、以下のURLが表示されます：

```
✔ Build started, it may take a few minutes to complete.
You can monitor the build at: https://expo.dev/accounts/[your-account]/projects/parkpedia/builds/[build-id]
```

**ビルド時間**: 通常15-30分

### ステップ5: 提出完了の確認

ビルドが完了すると、自動的にApp Store Connectにアップロードされます：

```
✔ Build finished successfully
✔ Uploaded to App Store Connect
```

**確認方法**:
1. App Store Connectにログイン: https://appstoreconnect.apple.com/
2. 「マイApp」> 「ParkPedia」> 「TestFlight」タブ
3. ビルドが表示されていることを確認

---

## 🔧 トラブルシューティング

### エラー: `EAS CLI not found`

```bash
# EAS CLIをインストール
npm install -g eas-cli

# パスを確認
which eas
```

### エラー: `Not logged in to EAS`

```bash
# EASにログイン
eas login

# ログイン確認
eas whoami
```

### エラー: `Apple authentication failed`

```bash
# Apple IDとパスワードを再入力
# 2FAコードが正しいか確認
# Apple Developerアカウントが有効か確認
```

### エラー: `Code signing error`

```bash
# Xcodeでプロジェクトを開く
open ios/ParkPedia.xcworkspace

# TARGETS > ParkPedia > Signing & Capabilities
# Team を選択
# Automatically manage signing を有効化
```

### エラー: `GoogleService-Info.plist not found`

```bash
# Firebase Consoleからダウンロード
# Firebase Console > プロジェクト設定 > iOS アプリ
# GoogleService-Info.plist をダウンロード
# プロジェクトルートに配置
```

---

## 📊 提出方法の比較

| 方法 | 速度 | 難易度 | 推奨度 |
|------|------|--------|--------|
| **EAS Build + Submit** | 遅い（15-30分） | 低 | ⭐⭐⭐⭐⭐ |
| **ローカルビルド + Submit** | 中（10-15分） | 中 | ⭐⭐⭐⭐ |
| **Xcode経由** | 速い（5-10分） | 高 | ⭐⭐⭐ |

---

## ✅ 提出後の確認事項

### App Store Connectでの確認

1. **ビルドの状態確認**
   - 「処理中」→ 「処理済み」になるまで待機（5-10分）

2. **TestFlightでの確認**
   - 「TestFlight」タブでビルドが表示されることを確認
   - 内部テスターに配布可能な状態か確認

3. **審査が必要な場合**
   - 初回提出時は審査が必要な場合があります
   - 「審査中」→ 「承認済み」になるまで待機

### テスト配布

1. **内部テスター**
   - App Store Connect > TestFlight > 内部テスター
   - 最大100名まで追加可能

2. **外部テスター**
   - App Store Connect > TestFlight > 外部テスター
   - 最大10,000名まで追加可能
   - 審査が必要（初回のみ）

---

## 🎯 推奨ワークフロー

### 初回提出

```bash
# 1. EAS CLIのセットアップ
npm install -g eas-cli
eas login

# 2. ビルド + 提出
eas build --platform ios --profile production --auto-submit

# 3. App Store Connectで確認
# https://appstoreconnect.apple.com/
```

### 2回目以降の提出

```bash
# バージョン番号を更新（app.config.js）
# version: '1.0.28'
# buildNumber: '34'

# ビルド + 提出
eas build --platform ios --profile production --auto-submit
```

---

## 📝 注意事項

1. **バージョン番号**: 提出前に `app.config.js` の `version` と `buildNumber` を更新してください

2. **証明書の有効期限**: Apple Developerアカウントの証明書が有効期限内か確認してください

3. **審査時間**: 初回提出時は審査に時間がかかる場合があります（通常1-3日）

4. **ビルド時間**: EAS Buildはクラウドで実行されるため、15-30分かかります

5. **ネットワーク接続**: ビルド中はインターネット接続が必要です

---

## 🚀 クイックスタート

```bash
# 1. EAS CLIのインストール（初回のみ）
npm install -g eas-cli

# 2. EASにログイン（初回のみ）
eas login

# 3. ビルド + 提出（一括実行）
eas build --platform ios --profile production --auto-submit
```

---

**最終更新**: 2025年12月21日




