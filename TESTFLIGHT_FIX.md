# 🔧 TestFlight提出エラー修正ガイド

**問題**: 既に同じバージョンが提出済みというエラー

---

## ❌ エラーの原因

```
✖ Something went wrong when submitting your app to Apple App Store Connect.
You've already submitted this version of the app.
```

**原因**:
- 既存のビルドファイル（古いバージョン）を提出しようとしている
- `app.config.js`を更新しただけでは、既にビルドされたIPAファイルのバージョンは変わらない
- **新しいバージョンで再度ビルドする必要がある**

---

## ✅ 解決方法

### 重要なポイント

1. ✅ `app.config.js`のバージョンは既に更新済み（1.0.29）
2. ❌ 既存のビルドファイルは古いバージョンのまま
3. ✅ **新しいバージョンで再度ビルドする必要がある**

---

## 🚀 正しい手順

### ステップ1: バージョン確認

```bash
# 現在のバージョンを確認
grep "version:" app.config.js
grep "buildNumber:" app.config.js
```

**確認ポイント**:
- ✅ `version: '1.0.29'` になっているか
- ✅ `buildNumber: '35'` になっているか

### ステップ2: 新しいバージョンでビルド（必須）

**方法A: EAS Build（推奨）**

```bash
# 新しいバージョンでビルド + 自動提出
eas build --platform ios --profile production --auto-submit
```

**方法B: ローカルビルド**

```bash
# 1. 新しいバージョンでIPAファイルを作成
./local_build_ios_ipa.sh

# 2. 新しいビルドを提出
eas submit --platform ios --profile production --path ./ios/build/export/ParkPedia.ipa
```

**方法C: 一括スクリプト**

```bash
# ビルド + 提出を一括実行
./build_and_submit_testflight.sh
```

---

## ⚠️ よくある間違い

### ❌ 間違った手順

```bash
# 1. app.config.jsを更新
# 2. 既存のビルドファイルを提出 ← これがエラーの原因！
eas submit --platform ios --profile production --path ./ios/build/export/ParkPedia.ipa
```

**問題**: 既存のビルドファイルは古いバージョンのまま

### ✅ 正しい手順

```bash
# 1. app.config.jsを更新（既に完了）
# 2. 新しいバージョンで再度ビルド（必須）
eas build --platform ios --profile production --auto-submit
# または
./local_build_ios_ipa.sh
# 3. 新しいビルドを提出
eas submit --platform ios --profile production --path ./ios/build/export/ParkPedia.ipa
```

---

## 📝 チェックリスト

提出前に以下を確認してください：

- [ ] `app.config.js`の`version`が更新されている（1.0.29）
- [ ] `app.config.js`の`buildNumber`が更新されている（35）
- [ ] **新しいバージョンで再度ビルドしている**
- [ ] 提出するビルドファイルが新しいバージョンでビルドされたもの

---

## 🎯 推奨ワークフロー

```bash
# 1. バージョン更新（既に完了）
# app.config.js: version: '1.0.29', buildNumber: '35'

# 2. 新しいビルドを作成（必須）
eas build --platform ios --profile production --auto-submit

# これで自動的に新しいバージョンでビルドされ、提出されます
```

---

## 💡 補足説明

### なぜ新しいビルドが必要なのか？

1. **ビルド時のバージョン**: IPAファイルはビルド時に`app.config.js`のバージョン情報を埋め込みます
2. **提出時のチェック**: App Store ConnectはIPAファイル内のバージョン情報をチェックします
3. **既存ビルドの問題**: 既存のビルドファイルは古いバージョン情報のままです

### バージョン番号のルール

- **version** (`CFBundleShortVersionString`): ユーザーに見えるバージョン（例: 1.0.29）
- **buildNumber** (`CFBundleVersion`): 内部ビルド番号（例: 35）
- 同じ`version`でも、`buildNumber`を増やせば新しいビルドとして提出可能

---

**最終更新**: 2025年12月21日




