# 🏗️ ローカルビルドガイド

**作成日**: 2025年12月21日  
**目的**: ParkPediaアプリのローカルビルド手順を説明

---

## ✅ ローカルビルドの実施可能性

**結論**: **実施可能です** ✅

プロジェクトには以下のローカルビルド方法が設定されています：

1. ✅ **iOSシミュレーター/実機ビルド**: `expo run:ios`
2. ✅ **Androidエミュレーター/実機ビルド**: `expo run:android`
3. ✅ **iOS IPAファイル作成**: `local_build_ios_ipa.sh`
4. ✅ **EAS Build（クラウドビルド）**: `eas build`

---

## 📋 前提条件

### iOS ビルド

**必須**:
- ✅ macOS（Xcodeが必要）
- ✅ Xcode（最新版推奨）
- ✅ CocoaPods（`pod install`でインストール）
- ✅ Apple Developerアカウント（実機ビルドの場合）
- ✅ `GoogleService-Info.plist` がプロジェクトルートに配置済み

**確認方法**:
```bash
# Xcodeのバージョン確認
xcodebuild -version

# CocoaPodsのインストール確認
pod --version

# GoogleService-Info.plistの確認
ls -la GoogleService-Info.plist
```

### Android ビルド

**必須**:
- ✅ Android Studio
- ✅ Android SDK（API Level 33以上推奨）
- ✅ Java Development Kit (JDK 17以上)
- ✅ `google-services.json` がプロジェクトルートに配置済み（推奨）

**確認方法**:
```bash
# Javaのバージョン確認
java -version

# Android SDKの確認
echo $ANDROID_HOME
```

---

## 🚀 ローカルビルド手順

### 1. iOS シミュレーター/実機ビルド

#### シミュレーターでビルド

```bash
# 依存関係のインストール
npm install

# iOSディレクトリに移動してCocoaPodsをインストール
cd ios
pod install
cd ..

# 開発サーバー起動（別ターミナル）
npx expo start

# iOSシミュレーターでビルド
npm run ios

# または特定のデバイスで実行
npm run ios:iphone17pro
npm run ios:ipadair11
npm run ios:ipadair13
```

#### 実機でビルド

```bash
# 実機を接続してから
npx expo run:ios --device
```

---

### 2. Android エミュレーター/実機ビルド

#### エミュレーターでビルド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（別ターミナル）
npx expo start

# Androidエミュレーターでビルド
npm run android
```

#### 実機でビルド

```bash
# 実機を接続してから
npx expo run:android --device
```

---

### 3. iOS IPAファイル作成（App Store提出用）

**スクリプトを使用**:

```bash
# 実行権限を付与（初回のみ）
chmod +x local_build_ios_ipa.sh

# IPAファイルを作成
./local_build_ios_ipa.sh
```

**手動でビルド**:

```bash
# 1. Xcodeでプロジェクトを開く
open ios/ParkPedia.xcworkspace

# 2. メニューバー > Product > Archive

# 3. Organizerウィンドウで「Distribute App」を選択

# 4. App Store Connectにアップロード
```

---

### 4. EAS Build（クラウドビルド）

ローカルビルドが難しい場合は、EAS Buildを使用できます：

```bash
# EAS CLIのインストール（未インストールの場合）
npm install -g eas-cli

# EASにログイン
eas login

# iOSビルド
eas build --platform ios --profile production

# Androidビルド
eas build --platform android --profile production
```

**メリット**:
- ✅ ローカル環境の問題を回避
- ✅ クラウドで自動ビルド
- ✅ 証明書管理が簡単

**デメリット**:
- ❌ ビルド時間が長い（10〜20分）
- ❌ インターネット接続が必要

---

## 🔧 トラブルシューティング

### iOS ビルドエラー

**エラー**: `CocoaPods not found`
```bash
# CocoaPodsをインストール
sudo gem install cocoapods

# Podを再インストール
cd ios
pod deintegrate
pod install
cd ..
```

**エラー**: `GoogleService-Info.plist not found`
```bash
# Firebase Consoleからダウンロードしてプロジェクトルートに配置
# Firebase Console > プロジェクト設定 > iOS アプリ > GoogleService-Info.plist をダウンロード
```

**エラー**: `Code signing error`
```bash
# Xcodeでプロジェクトを開く
open ios/ParkPedia.xcworkspace

# TARGETS > ParkPedia > Signing & Capabilities
# Team を選択して、Automatically manage signing を有効化
```

---

### Android ビルドエラー

**エラー**: `SDK location not found`
```bash
# ANDROID_HOMEを設定
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**エラー**: `google-services.json not found`
```bash
# Firebase Consoleからダウンロードしてプロジェクトルートに配置
# Firebase Console > プロジェクト設定 > Android アプリ > google-services.json をダウンロード
```

---

## 📊 ビルド方法の比較

| 方法 | 速度 | 難易度 | 用途 |
|------|------|--------|------|
| **expo run:ios/android** | 速い（3-5分） | 中 | 開発・テスト |
| **Xcode Archive** | 中（5-10分） | 高 | App Store提出 |
| **EAS Build** | 遅い（10-20分） | 低 | クラウドビルド |

---

## ✅ 推奨ワークフロー

### 開発時
```bash
# 1. 開発サーバー起動
npx expo start

# 2. シミュレーター/エミュレーターでビルド
npm run ios
# または
npm run android
```

### 本番ビルド時
```bash
# 1. ローカルでIPA作成（推奨）
./local_build_ios_ipa.sh

# 2. またはEAS Buildを使用
eas build --platform ios --profile production
```

---

## 📝 注意事項

1. **ネイティブモジュール**: Firebase、AdMobなどのネイティブモジュールを使用しているため、Expo Goでは動作しません。Development BuildまたはProduction Buildが必要です。

2. **環境変数**: `.env` ファイルが必要です。`.env.example` をコピーして設定してください。

3. **証明書**: App Store提出には、Apple Developerアカウントと適切な証明書が必要です。

4. **ビルド時間**: 初回ビルドは時間がかかります（5-10分）。2回目以降はキャッシュにより速くなります。

---

## 🎯 次のステップ

1. **ローカルビルドを試す**: `npm run ios` または `npm run android`
2. **問題があれば**: トラブルシューティングセクションを参照
3. **本番ビルド**: `local_build_ios_ipa.sh` または `eas build` を使用

---

**最終更新**: 2025年12月21日




