# App Store配信ガイド（Expoプロジェクト）

## ✅ はい、ExpoからApp Storeに配信できます！

ExpoプロジェクトからApp Storeに配信する方法は**2つ**あります：

---

## 方法1: EAS Build（推奨・簡単）

**EAS Build**は、Expoが提供するクラウドビルドサービスです。Macがなくても、クラウドでビルドできます。

### メリット
- ✅ Macがなくてもビルド可能
- ✅ 簡単に設定できる
- ✅ 自動的にApp Store Connectにアップロード可能
- ✅ ビルド履歴を管理できる

### 必要な準備

1. **EAS CLIをインストール**:
   ```bash
   npm install -g eas-cli
   ```

2. **EASアカウントにログイン**:
   ```bash
   eas login
   ```

3. **プロジェクトを設定**（既に`eas.json`が存在します）:
   ```bash
   cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
   eas build:configure
   ```

### ビルドと配信の手順

#### 1. プロダクションビルドを作成

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
eas build --platform ios --profile production
```

#### 2. App Store Connectにアップロード

```bash
eas submit --platform ios --profile production
```

#### 3. App Store Connectで審査申請

- App Store Connectにログイン
- アプリを選択
- 新しいビルドを選択
- 審査に提出

---

## 方法2: Xcodeで直接ビルド（従来の方法）

**Xcode**で直接ビルドして、App Store Connectにアップロードする方法です。

### メリット
- ✅ ローカルでビルドできる
- ✅ ビルドプロセスを完全に制御できる
- ✅ 無料（EAS Buildは有料プランあり）

### 必要な準備

1. **Apple Developerアカウント**（年間$99）
2. **Xcode**（最新版）
3. **署名証明書とProvisioning Profile**

### ビルドと配信の手順

#### 1. Xcodeでプロジェクトを開く

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios
open ParkPedia.xcworkspace
```

#### 2. 署名と証明書を設定

1. Xcodeでプロジェクトを選択
2. **Signing & Capabilities**タブを開く
3. **Team**を選択（Apple Developerアカウント）
4. **Automatically manage signing**にチェック
5. **Bundle Identifier**が`com.parkpedia.app`であることを確認

#### 3. Archiveを作成

1. 上部のデバイス選択で**Any iOS Device**を選択
2. `Product` → `Archive`を選択
3. ビルドが完了するまで待つ

#### 4. App Store Connectにアップロード

1. **Organizer**ウィンドウが自動的に開く
2. 作成したArchiveを選択
3. **Distribute App**をクリック
4. **App Store Connect**を選択
5. **Upload**を選択
6. 配信オプションを確認して**Upload**をクリック

#### 5. App Store Connectで審査申請

1. App Store Connectにログイン
2. アプリを選択
3. 新しいビルドを選択
4. アプリ情報を入力
5. 審査に提出

---

## 📋 配信前のチェックリスト

### 必須項目

- [ ] **アイコンファイル**: `assets/icon.png`（1024x1024px）が存在する
- [ ] **スプラッシュスクリーン**: `assets/splash.png`が存在する
- [ ] **バージョン番号**: `app.json`の`version`が適切（例: `1.0.0`）
- [ ] **Bundle Identifier**: `com.parkpedia.app`がApp Store Connectで登録済み
- [ ] **広告設定**: `AD_ENABLED = false`（審査通過後に有効化）
- [ ] **権限説明文**: すべての権限に説明文が設定されている

### 推奨項目

- [ ] **スクリーンショット**: 各デバイスサイズのスクリーンショットを準備
- [ ] **アプリ説明文**: App Store用の説明文を準備
- [ ] **プライバシーポリシー**: URLを準備（必要に応じて）
- [ ] **サポートURL**: サポートページのURLを準備

---

## 🚀 推奨ワークフロー

### 初回配信

1. **EAS Buildを使用**（簡単）:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios --profile production
   ```

2. **または、Xcodeで直接ビルド**:
   - XcodeでArchiveを作成
   - OrganizerからApp Store Connectにアップロード

### アップデート配信

1. **バージョン番号を更新**:
   - `app.json`の`version`を更新（例: `1.0.0` → `1.0.1`）
   - `ios/ParkPedia/Info.plist`の`CFBundleShortVersionString`も更新

2. **ビルドとアップロード**:
   - EAS BuildまたはXcodeでビルド
   - App Store Connectにアップロード

---

## 📝 現在の設定状況

### ✅ 設定済み

- `eas.json`が存在（EAS Buildの設定）
- `app.json`に配信に必要な設定が含まれている
- Bundle Identifier: `com.parkpedia.app`
- 権限説明文が設定されている

### ⚠️ 要確認

- [ ] アイコンファイル（`assets/icon.png`）が存在するか
- [ ] スプラッシュスクリーン（`assets/splash.png`）が存在するか
- [ ] Apple Developerアカウントが有効か
- [ ] App Store Connectでアプリが登録されているか

---

## 🎯 次のステップ

### EAS Buildを使用する場合

1. EAS CLIをインストール
2. `eas login`でログイン
3. `eas build --platform ios --profile production`でビルド
4. `eas submit --platform ios --profile production`でアップロード

### Xcodeで直接ビルドする場合

1. Xcodeでプロジェクトを開く
2. 署名と証明書を設定
3. Archiveを作成
4. App Store Connectにアップロード

---

## 📚 参考リンク

- [EAS Build ドキュメント](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Expo 配信ガイド](https://docs.expo.dev/submit/introduction/)

---

**どちらの方法でもApp Storeに配信できます！EAS Buildの方が簡単ですが、Xcodeで直接ビルドする方法も可能です。**

